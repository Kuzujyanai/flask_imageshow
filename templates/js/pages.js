// js/pages.js

import { loadImages, loadCollectionImages, scrapeData, uploadSelectedImages } from './api.js';
import { populateImageGallery} from './ui.js';

export function initializeProduct1Page() {
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

    // 2. 绑定工具栏按钮事件
    const scrapeDataBtn = document.getElementById('scrape-data-btn');
    const uploadDataBtn = document.getElementById('upload-data-btn');
    const refreshDataBtn = document.getElementById('refresh-data-btn');

    if (scrapeDataBtn) {
        scrapeDataBtn.addEventListener('click', async function () {
            try {
                const dateSpan = document.querySelector('#selected-time span');
                const selectedDate = dateSpan.textContent.trim();
                const formattedDate = selectedDate.replace(/-/g, '');
                const data = await scrapeData(formattedDate);
                if (data.message && data.message.includes('成功')) {
                    // 重新加载图片

                }
            } catch (error) {
                // 错误已在API模块中处理
            }
        });
    }

    if (uploadDataBtn) {
        uploadDataBtn.addEventListener('click', async function () {
            try {
                 uploadSelectedImages();
                // 重新加载图片或进行其他操作
            } catch (error) {
                // 错误已在API模块中处理
            }
        });
    }

    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', function () {
            const currentDate = selectedTime.querySelector('span').textContent.trim();
            const formattedDate = currentDate.replace(/-/g, '');
            loadImages(formattedDate)
                .then(images => {
                    populateImageGallery(images);
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }


}

export function initializeContactPage() {
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

    // 2. 绑定工具栏按钮事件
    //const uploadDataBtn = document.getElementById('upload-data-btn');
    const refreshDataBtn = document.getElementById('refresh-data-btn');



    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', function () {
            const currentDate = selectedTime.querySelector('span').textContent.trim();
            const formattedDate = currentDate.replace(/-/g, '');
            loadCollectionImages(formattedDate)
                .then(images => {
                    populateImageGallery(images);
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }


}
