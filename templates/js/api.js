// js/api.js
import { showLoadingOverlay, hideLoadingOverlay,showLoadingOverlay1, hideLoadingOverlay1 } from './ui.js';
export async function scrapeData(formattedDate) {
    showLoadingOverlay();
    try {
        const response = await fetch('/scrape/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: formattedDate })
        });
        const data = await response.json();
        hideLoadingOverlay();
        if (data.message) {
            alert(data.message);
            return data;
        }
    } catch (error) {
        hideLoadingOverlay();
        console.error('Error:', error);
        alert('爬取数据时发生错误。');
        throw error;
    }
}

export async function loadImages(date) {
    const url = date ? `/images?date=${date}` : '/images';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`无法获取图片数据: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function loadCollectionImages(date) {
    const url = date ? `/collection-images?date=${date}` : '/collection-images';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`无法获取收藏图片数据: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function uploadSelectedImages() {
    showLoadingOverlay1();
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
        hideLoadingOverlay1();
        alert('图片信息上传成功！');
        // 取消选择
        checkboxes.forEach(cb => cb.checked = false);
    })
    .catch(error => {
        alert(`错误: ${error.message}`);
    });
}