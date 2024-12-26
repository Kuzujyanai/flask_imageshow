// js/script.js


document.addEventListener('DOMContentLoaded', function () {


    const menuItems = document.querySelectorAll('.menu-item, .submenu-item');
    const contentContainer = document.getElementById('content');
    const defaultContent = document.getElementById('default-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation(); // 防止事件冒泡

// 如果点击的是有子导航的菜单项
            if (this.classList.contains('has-submenu')) {
// 切换子菜单的展开状态
                this.classList.toggle('active');
                return; // 不切换内容区域
            }

// 移除所有没有子导航的菜单项的.active类
            const nonSubmenuItems = document.querySelectorAll('.menu-item:not(.has-submenu)');
            nonSubmenuItems.forEach(i => i.classList.remove('active'));

// 移除所有子菜单项的.active类
            const submenuItems = document.querySelectorAll('.submenu-item');
            submenuItems.forEach(i => i.classList.remove('active'));

// 添加.active类到当前点击的菜单项
            this.classList.add('active');

// 如果是子菜单项，确保父菜单项也被激活
            if (this.classList.contains('submenu-item')) {
                const parentMenu = this.closest('.has-submenu');
                if (parentMenu) {
                    parentMenu.classList.add('active');
                }
            }

// 获取目标内容的HTML文件路径
            const target = this.getAttribute('data-target');
            if (!target) return;

// 移除默认内容
            if (defaultContent) {
                defaultContent.style.display = 'none';
            }

// 显示加载指示器（可选）
            contentContainer.innerHTML = '<p class="loading">加载中...</p>';

// 使用Fetch API加载外部HTML文件
            fetch(target)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`无法加载 ${target}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(html => {
                    contentContainer.innerHTML = html;
// 如果加载的是 product1.html，初始化其功能
// 根据加载的页面初始化相应的功能
                    if (target === 'product1.html') {
                        initializeProduct1Page();
                    } else if (target === 'collection.html') {
                        initializeContactPage();
                    }
                })
                .catch(error => {
                    contentContainer.innerHTML = `<p class="error">错误: ${error.message}</p>`;
                });
        });
    });

// 自动加载默认内容（首页）
    const defaultMenuItem = document.querySelector('.menu-item[data-target="home.html"]');
    if (defaultMenuItem) {
        defaultMenuItem.click();
    }

// 初始化产品1页面的功能
function initializeProduct1Page() {
    // 自定义日期格式化函数
    function formatDate(date) {
        return date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
    }

    // 1. 初始化日历
    const calendar = document.getElementById('calendar');
    const selectedTime = document.getElementById('selected-time');

    if (calendar) {
        const now = new Date();
        let maxDate;
        let defaultDate;

        if (now.getHours() >= 12) {
            // 当前时间已过中午十二点，允许选择昨天
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            maxDate = formatDate(yesterday);
            defaultDate = maxDate;
        } else {
            // 当前时间未过中午十二点，只允许选择前天
            const dayBeforeYesterday = new Date(now);
            dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
            maxDate = formatDate(dayBeforeYesterday);
            defaultDate = maxDate;
        }

        // 设置日历的最大可选日期
        calendar.max = maxDate;

        // 设置日历的默认值
        calendar.value = defaultDate;
        selectedTime.innerHTML = `<span>${defaultDate}</span>`;

        // 监听日期变化
        calendar.addEventListener('change', function () {
            const selectedDate = this.value;
            selectedTime.innerHTML = `<span>${selectedDate}</span>`;

        });
    }

    // 2. 加载图片从本地数据库
    // 获取当前日期
    const currentDateSpan = selectedTime.querySelector('span');
    let currentDate = '';
    if (currentDateSpan) {
        currentDate = currentDateSpan.textContent.trim();
    }


    // 3. 绑定工具栏按钮事件
    const scrapeDataBtn = document.getElementById('scrape-data-btn');
    const uploadDataBtn = document.getElementById('upload-data-btn');
    const refreshDataBtn = document.getElementById('refresh-data-btn');

    if (scrapeDataBtn) {
        scrapeDataBtn.addEventListener('click', function () {
            // 实现爬取数据的功能
            scrapeData();
        });
    }

    if (uploadDataBtn) {
        uploadDataBtn.addEventListener('click', function () {
            // 实现上传选择的图片信息到本地数据库的功能
            uploadSelectedImages();
        });
    }

    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', function () {
            // 实现刷新数据的功能
            const currentDate = selectedTime.querySelector('span').textContent.trim();
            const formattedDate = currentDate.replace(/-/g, '');
            loadImages(formattedDate);
        });
    }
}

    function initializeContactPage() {
        // 自定义日期格式化函数
        function formatDate(date) {
            return date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
        }

        // 1. 初始化日历
        const calendar = document.getElementById('calendar');
        const selectedTime = document.getElementById('selected-time');

        if (calendar) {
            const now = new Date();
            let maxDate;
            let defaultDate;

            if (now.getHours() >= 12) {
                // 当前时间已过中午十二点，允许选择昨天
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                maxDate = formatDate(yesterday);
                defaultDate = maxDate;
            } else {
                // 当前时间未过中午十二点，只允许选择前天
                const dayBeforeYesterday = new Date(now);
                dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
                maxDate = formatDate(dayBeforeYesterday);
                defaultDate = maxDate;
            }

            // 设置日历的最大可选日期
            calendar.max = maxDate;

            // 设置日历的默认值
            calendar.value = defaultDate;
            selectedTime.innerHTML = `<span>${defaultDate}</span>`;

            // 监听日期变化
            calendar.addEventListener('change', function () {
                const selectedDate = this.value;
                selectedTime.innerHTML = `<span>${selectedDate}</span>`;
                loadCollectionImages(selectedDate.replace(/-/g, '')); // 加载新日期的数据
            });
        }

        // 2. 加载图片从收藏数据库
        // 获取当前日期
        const currentDateSpan = selectedTime.querySelector('span');
        let currentDate = '';
        if (currentDateSpan) {
            currentDate = currentDateSpan.textContent.trim();
        }

        // 初始加载
        loadCollectionImages(currentDate.replace(/-/g, ''));

        // 3. 绑定工具栏按钮事件
        const uploadDataBtn = document.getElementById('upload-data-btn');
        const refreshDataBtn = document.getElementById('refresh-data-btn');

        if (uploadDataBtn) {
            uploadDataBtn.addEventListener('click', function () {
                // 实现上传选择的图片信息到本地数据库的功能
                uploadSelectedImages();
            });
        }

        if (refreshDataBtn) {
            refreshDataBtn.addEventListener('click', function () {
                // 实现刷新数据的功能
                const currentDate = selectedTime.querySelector('span').textContent.trim();
                const formattedDate = currentDate.replace(/-/g, '');
                loadCollectionImages(formattedDate);
            });
        }
    }
// 爬取数据功能
    function scrapeData() {
        showLoadingOverlay();
        // 获取span中的日期
        const dateSpan = document.querySelector('#selected-time span');
        const selectedDate = dateSpan.textContent.trim(); // 例如 "2024-12-24"

        // 验证日期格式（可选）
        if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
            alert('日期格式不正确，应为 YYYY-MM-DD。');
            return;
        }

        // 将 "YYYY-MM-DD" 转换为 "YYYYMMDD"
        const formattedDate = selectedDate.replace(/-/g, '');

        // 准备发送到API的负载
        const payload = {
            date: formattedDate
        };

        // 发送POST请求到Flask的 /scrape/ 端点
        fetch('/scrape/', {  // 根据app.py中的路由调整
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            hideLoadingOverlay();
            if (data.message) {
                alert(data.message);
                if (data.message.includes('成功')) {
                    // 重新加载图片

                }
            }
        })

        .catch(error => {
            console.error('Error:', error);
            alert('爬取数据时发生错误。');
        });
    }       if (scrapeDataBtn) {
        scrapeDataBtn.addEventListener('click', function() {
            // 实现爬取数据的功能
            scrapeData();
        });
    }
// 读取图片数据从本地数据库（通过API获取）
    function loadImages(date) {
        const url = date ? `/images?date=${date}` : '/images';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法获取图片数据: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                populateImageGallery(data);
            })
            .catch(error => {
                const gallery = document.querySelector('.image-gallery');
                if (gallery) {
                    gallery.innerHTML = `<p class="error">错误: ${error.message}</p>`;
                }
            });
    }
    // 读取收藏图片数据从本地数据库（通过API获取）

   // 读取收藏图片数据从本地数据库（通过API获取）
    function loadCollectionImages(date) {
        // API端点 '/collection-images' 支持按日期过滤
        const url = date ? `/collection-images?date=${date}` : '/collection-images';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法获取收藏图片数据: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                populateImageGallery(data);
            })
            .catch(error => {
                const gallery = document.querySelector('.image-gallery');
                if (gallery) {
                    gallery.innerHTML = `<p class="error">错误: ${error.message}</p>`;
                }
            });
    }

// 将图片数据填充到图片展示部分
    function populateImageGallery(images) {
        const gallery = document.querySelector('.image-gallery');
        if (!gallery) return;

        gallery.innerHTML = ''; // 清空现有内容

        if (images.length === 0) {
            gallery.innerHTML = '<p>没有找到对应日期的图片数据。</p>';
            return;
        }

        images.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');

// 使用代理路由加载图片
            const proxiedUrl = `/proxy-image?url=${encodeURIComponent(image.original_url)}`;

            imageItem.innerHTML = `  
<img src="${proxiedUrl}" alt="${image.rank}" data-original-url="${proxiedUrl}" loading="lazy">  
<label class="checkbox-container">  
<input type="checkbox" class="image-checkbox" data-id="${image.id}">  
<span class="checkmark"></span>  
<span class="image-info">作者: ${image.username}<br>标签: ${image.targets.join(', ')}</span>  
</label>  
`;

            gallery.appendChild(imageItem);
        });

// 添加事件监听器
        setupModal();
    }

    function setupModal() {
        const modal = document.getElementById("myModal");
        const modalImg = document.getElementById("imgModal");
        const captionText = document.getElementById("caption");
        const closeBtn = document.getElementsByClassName("close")[0];
        const images = document.querySelectorAll('.image-item img');

        images.forEach(img => {
            img.addEventListener('click', function () {
                modal.style.display = "block";
                modalImg.src = this.getAttribute('src');
                captionText.innerHTML = this.getAttribute('data-caption');
            });
        });

// 点击关闭按钮关闭模态窗口
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }

// 点击模态窗口的空白区域也可以关闭
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }


// 上传选择的图片信息到本地数据库功能

function uploadSelectedImages() {
    const checkboxes = document.querySelectorAll('.image-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));

    if (selectedIds.length === 0) {
        alert('请先选择要上传的图片。');
        return;
    }

    // 假设有一个API端点 '/upload-images' 进行上传
    fetch('/upload-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds: selectedIds })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || `上传数据失败: ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        alert('图片信息上传成功！');
        // 取消选择
        checkboxes.forEach(cb => cb.checked = false);
    })
    .catch(error => {
        alert(`错误: ${error.message}`);
    });
}



//加载监听结束
});

// 显示加载提示
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
    document.body.classList.add('loading'); // 禁用滚动
}

// 隐藏加载提示
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
    document.body.classList.remove('loading'); // 恢复滚动
}