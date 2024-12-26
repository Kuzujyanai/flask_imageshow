// js/main.js

import { initializeProduct1Page, initializeContactPage } from './pages.js';

document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.menu-item, .submenu-item');
    const contentContainer = document.getElementById('content');
    const defaultContent = document.getElementById('default-content');

    menuItems.forEach(item => {
        item.addEventListener('click', async function (e) {
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

            try {
                const response = await fetch(target);
                if (!response.ok) {
                    throw new Error(`无法加载 ${target}: ${response.statusText}`);
                }
                const html = await response.text();
                contentContainer.innerHTML = html;

                // 根据加载的页面初始化相应的功能
                if (target === 'product1.html') {
                    initializeProduct1Page();
                } else if (target === 'collection.html') {
                    initializeContactPage();
                }
            } catch (error) {
                contentContainer.innerHTML = `<p class="error">错误: ${error.message}</p>`;
            }
        });
    });

    // 自动加载默认内容（首页）
    const defaultMenuItem = document.querySelector('.menu-item[data-target="home.html"]');
    if (defaultMenuItem) {
        defaultMenuItem.click();
    }
});
