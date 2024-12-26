
// js/ui.js
export function populateImageGallery(images) {
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
            <img src="${proxiedUrl}" alt="${image.rank}" data-caption="作者: ${image.username}" loading="lazy">  
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

export function setupModal() {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("imgModal");
    const captionText = document.getElementById("caption");
    const closeBtn = document.getElementsByClassName("close")[0];
    const images = document.querySelectorAll('.image-item img');

    images.forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = "block";
            modalImg.src = this.getAttribute('src');
            captionText.innerHTML = this.getAttribute('data-caption') || '';
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

export function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
    document.body.classList.add('loading'); // 禁用滚动
}

export function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
    document.body.classList.remove('loading'); // 恢复滚动
}

export function showLoadingOverlay1() {
    const overlay = document.getElementById('loadingOverlay1');
    overlay.classList.add('active');
    document.body.classList.add('loading'); // 禁用滚动
}

export function hideLoadingOverlay1() {
    const overlay = document.getElementById('loadingOverlay1');
    overlay.classList.remove('active');
    document.body.classList.remove('loading'); // 恢复滚动
}
