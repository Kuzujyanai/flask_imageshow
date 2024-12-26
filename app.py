# app.py
from flask import Flask, render_template, jsonify, send_file, request, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import requests
import time
from io import BytesIO
import logging

# 配置日志记录
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="templates", static_url_path='')

# 配置数据库URI（使用SQLite数据库）
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pixiv_ranking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 配置多个数据库绑定
app.config['SQLALCHEMY_BINDS'] = {
    'collection': 'sqlite:///pixiv_collection.db'
}

# 初始化SQLAlchemy
db = SQLAlchemy(app)


# 定义PixivImage模型
class PixivImage(db.Model):
    __tablename__ = 'pixiv_images'

    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.String(10), nullable=False)
    original_url = db.Column(db.String(255), unique=True, nullable=False)
    converted_url = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    targets = db.Column(db.String(255), nullable=False)  # 存储为逗号分隔的字符串
    date_scraped = db.Column(db.String(8), nullable=False)  # "YYYYMMDD"格式

    def __repr__(self):
        return f"<PixivImage {self.rank} - {self.username}>"


# app.py

class PixivCollectionImage(db.Model):
    __tablename__ = 'pixiv_collection_images'
    __bind_key__ = 'collection'  # 绑定到 'pixiv_collection.db'

    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.String(10), nullable=False)
    original_url = db.Column(db.String(255), unique=True, nullable=False)
    converted_url = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    targets = db.Column(db.String(255), nullable=False)  # 存储为逗号分隔的字符串
    date_scraped = db.Column(db.String(8), nullable=False)  # "YYYYMMDD"格式

    def __repr__(self):
        return f"<PixivCollectionImage {self.rank} - {self.username}>"


# 主页路由
@app.route('/')
def home():
    return render_template("index.html")


# 获取单个url的json数据
def get_pixiv_ranking(url, proxies=None):
    time.sleep(0.5)  # 防止过于频繁的请求
    try:
        response = requests.get(url, proxies=proxies)
        response.raise_for_status()  # 检查请求是否成功

        # 解析JSON数据
        data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        logger.error(f"请求失败：{e}")
        return None
    except ValueError as e:
        logger.error(f"JSON解析失败：{e}")
        return None


# 提取单个链接的数据
def extract_data(data):
    # 过滤掉不满足条件的数据项
    filtered_data = {'contents': [item for item in data.get('contents', []) if
                                  item.get('illust_page_count') == "1" and
                                  item.get('yes_rank') == 0 and
                                  item.get('illust_type') == "0"]}

    extracted_data = []
    for content in filtered_data.get('contents', []):
        # 获取相应的字段
        url = content.get('url', '')
        username = content.get('user_name', '')
        rank = content.get('rank', '')
        targets = content.get('tags', [])  # 获取tags字段

        # 去掉 URL 中的 "/c/240x480"
        url = url.replace("/c/240x480", "")

        # 将链接进行转换
        converted_link = url.replace("i.pximg.net", "i.belovedones.xyz")

        # 将tags列表转换为逗号分隔的字符串
        tags_str = ','.join(targets)

        # 保存原始和转换后的 URL
        extracted_data.append({
            'rank': rank,
            'original_url': url,  # 修改为不包含 "/c/240x480" 的 URL
            'converted_url': converted_link,
            'username': username,
            'targets': tags_str  # 保存tags字段
        })

    return extracted_data


# 将所有提取后的数据保存到数据库
def save_all_extracted_data_to_db(url_list, proxies, date_scraped):
    logger.info(f"开始爬取 {date_scraped} 的数据...")

    # 获取新数据
    for url in url_list:
        pixiv_data = get_pixiv_ranking(url, proxies)
        if pixiv_data:
            extracted_data = extract_data(pixiv_data)
            for item in extracted_data:
                pixiv_image = PixivImage(
                    rank=item['rank'],
                    original_url=item['original_url'],
                    converted_url=item['converted_url'],
                    username=item['username'],
                    targets=item['targets'],
                    date_scraped=date_scraped
                )
                try:
                    db.session.add(pixiv_image)
                    db.session.commit()
                except IntegrityError:
                    db.session.rollback()
                    logger.warning(f"数据已存在，跳过URL: {item['original_url']}")

    logger.info(f"{date_scraped} 的数据已保存到数据库。")
    return True  # 表示成功执行爬取


# 爬取数据的API端点
@app.route('/scrape/', methods=['POST'])
def scrape():
    data = request.get_json()

    # 获取日期参数
    date_param = data.get('date', None)

    if not date_param:
        return jsonify({'message': '日期参数不能为空。'}), 400

    # 检查数据库中是否已存在该日期的数据
    existing_entry = PixivImage.query.filter_by(date_scraped=date_param).first()
    if existing_entry:
        return jsonify({'message': f"{date_param} 的数据已经爬取过了。"}), 400

    # 构建URL列表
    base_url = f"https://www.pixiv.net/ranking.php?mode=daily&date={date_param}&p={{}}&format=json"
    url_list = [base_url.format(p) for p in range(1, 11)]

    # 设置代理（如果需要）
    proxies = {
        "http": "http://127.0.0.1:10809",
        "https": "http://127.0.0.1:10809"
    }

    # 调用爬虫服务
    success = save_all_extracted_data_to_db(url_list, proxies, date_param)

    if success:
        return jsonify({'message': f"{date_param} 的数据爬取并存储成功。"}), 200
    else:
        return jsonify({'message': '爬取数据时发生错误。'}), 500


# 获取所有图片数据的API端点（支持按日期过滤）
@app.route('/images', methods=['GET'])
def get_images():
    date_param = request.args.get('date', None)
    if date_param:
        images = PixivImage.query.filter_by(date_scraped=date_param).all()
    else:
        images = PixivImage.query.all()
    result = []
    for image in images:
        result.append({
            'id': image.id,
            'rank': image.rank,
            'original_url': image.original_url,
            'converted_url': image.converted_url,
            'username': image.username,
            'targets': image.targets.split(','),  # 将逗号分隔的字符串转换回列表
            'date_scraped': image.date_scraped
        })
    return jsonify(result), 200


# app.py

# 获取收藏图片数据的API端点（支持按日期过滤）
@app.route('/collection-images', methods=['GET'])
def get_collection_images():
    date_param = request.args.get('date', None)
    if date_param:
        images = PixivCollectionImage.query.filter_by(date_scraped=date_param).all()
    else:
        images = PixivCollectionImage.query.all()
    result = []
    for image in images:
        result.append({
            'id': image.id,
            'rank': image.rank,
            'original_url': image.original_url,
            'converted_url': image.converted_url,
            'username': image.username,
            'targets': image.targets.split(','),  # 将逗号分隔的字符串转换回列表
            'date_scraped': image.date_scraped
        })
    return jsonify(result), 200


# 上传选择的图片信息的API端点（可选实现）
@app.route('/upload-images', methods=['POST'])
def upload_images():
    data = request.get_json()
    image_ids = data.get('imageIds', [])

    if not image_ids:
        return jsonify({'message': '未选择任何图片。'}), 400

    try:
        # 查询选中的图片
        selected_images = PixivImage.query.filter(PixivImage.id.in_(image_ids)).all()

        # 将选中的图片插入到 collection 数据库
        for image in selected_images:
            # 检查图片是否已存在于 collection 中
            existing_image = PixivCollectionImage.query.filter_by(original_url=image.original_url).first()
            if existing_image:
                logger.warning(f"图片已存在于 collection 中，跳过URL: {image.original_url}")
                continue  # 跳过已存在的图片

            # 创建新的 PixivCollectionImage 实例
            collection_image = PixivCollectionImage(
                rank=image.rank,
                original_url=image.original_url,
                converted_url=image.converted_url,
                username=image.username,
                targets=image.targets,
                date_scraped=image.date_scraped
            )

            db.session.add(collection_image)

        db.session.commit()
        logger.info(f"上传了图片ID: {image_ids}")
        return jsonify({'message': '图片信息上传成功！'}), 200

    except IntegrityError:
        db.session.rollback()
        logger.error("数据库完整性错误。")
        return jsonify({'message': '数据库完整性错误。'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"上传失败: {str(e)}")
        return jsonify({'message': f'上传失败: {str(e)}'}), 500


@app.route('/proxy-image')
def proxy_image():
    image_url = request.args.get('url')
    if not image_url:
        abort(400, description="Image URL is required")

    headers = {
        'Referer': 'https://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',  # 伪造 Referer 头
    }

    try:
        response = requests.get(image_url, headers=headers, stream=True)
        response.raise_for_status()
        # 将图片内容转发给客户端
        return send_file(BytesIO(response.content), mimetype=response.headers['Content-Type'])
    except requests.exceptions.RequestException as e:
        abort(404, description="Image not found or cannot be accessed")


if __name__ == '__main__':
    with app.app_context():
        db.create_all(bind=None)  # 创建默认绑定的表（pixiv_ranking.db）
        db.create_all(bind='collection')  # 创建 'collection' 绑定的表（pixiv_collection.db）

    app.run(debug=True)
