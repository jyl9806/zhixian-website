// home.js 完整修改版本
document.addEventListener('DOMContentLoaded', initializeMainPage);

// ========== 初始化函数 ==========
function initializeMainPage() {
    initializeDownloadButtons();
    initializeCarouselData();  
    initializeCountdown();
    initializeImageLazyLoading(); 
}

// ========== 下载功能 ==========
function initializeDownloadButtons() {
    const directDownloadBtn = document.getElementById('direct-download');
    const cloudDownloadBtn = document.getElementById('cloud-download');

    // 直连下载功能 
    if (directDownloadBtn) {
        directDownloadBtn.addEventListener('click', function () {
            // 直连下载链接
            const downloadUrl = 'https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/software/xxx.exe';

            // 直接跳转到下载链接
            window.location.href = downloadUrl;

            // 显示下载提示
            showDownloadToast('软件下载已开始，请稍候...');
        });
    }

    // 网盘下载功能
    if (cloudDownloadBtn) {
        cloudDownloadBtn.addEventListener('click', function () {
            // 具体网盘链接
            const cloudUrl = 'xxx';
            window.open(cloudUrl, '_blank');
            
            // 显示下载提示
            showDownloadToast('正在跳转到网盘下载页面...');
        });
    }
}

// ========== 轮播图配置数据 ==========
const carouselData = [
    {
        src: "https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/images/interface-images/process.png",
        alt: "工艺界面图片",
        title: "工艺设计界面",
        description: "直观的工艺参数设置和吓数管理"
    },
    {
        src: "https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/images/interface-images/shaping.png", 
        alt: "成型界面图片",
        title: "成型设计界面",
        description: "智能成型动作编辑和预览"
    },
    {
        src: "https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/images/interface-images/pattern.png",
        alt: "花样界面图片", 
        title: "花样设计界面",
        description: "丰富的花样库和自定义设计"
    },
    {
        src: "https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/images/interface-images/simulation.png",
        alt: "仿真界面图片",
        title: "实时仿真界面", 
        description: "高精度布料物理特性仿真"
    },
    {
        src: "https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech/images/interface-images/compilation.png",
        alt: "上机编译界面图片",
        title: "上机编译界面",
        description: "一键生成横机可执行文件"
    }
];

// ========== 轮播图初始化 ==========
function initializeCarouselData() {
    const carouselInner = document.getElementById('carousel-inner');
    if (!carouselInner) return;

    // 清空加载占位符
    carouselInner.innerHTML = '';
    
    // 动态生成轮播项
    carouselData.forEach((item, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <img src="${item.src}" 
                 alt="${item.alt}" 
                 class="d-block w-100 carousel-image" 
                 loading="lazy"
                 data-src="${item.src}"
                 onerror="handleCarouselImageError(this)">
            <div class="carousel-caption d-none d-md-block">
                <h5>${item.title}</h5>
                <p>${item.description}</p>
            </div>
        `;
        carouselInner.appendChild(carouselItem);
    });

    // 初始化进度条
    initCarouselProgress();
}

// ========== 图片懒加载功能 ==========
function initializeImageLazyLoading() {
    // 使用 Intersection Observer 实现懒加载
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('fade-in');
                    }
                    
                    lazyImageObserver.unobserve(img);
                }
            });
        });

        // 观察所有带 data-src 属性的图片
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            lazyImageObserver.observe(img);
        });
    } else {
        // 回退方案：直接加载所有图片
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// 轮播图图片加载错误处理
function handleCarouselImageError(img) {
    const parent = img.parentElement;
    const caption = parent.querySelector('.carousel-caption');
    
    // 替换为占位符
    const placeholder = document.createElement('div');
    placeholder.className = 'carousel-placeholder d-flex align-items-center justify-content-center';
    placeholder.innerHTML = `
        <div class="text-center">
            <i class="bi bi-image display-1 text-muted"></i>
            <p class="mt-2">图片加载失败</p>
        </div>
    `;
    
    parent.insertBefore(placeholder, caption);
    img.style.display = 'none';
}

// ========== 轮播图进度条 ==========
function initCarouselProgress() {
    const carousel = document.getElementById('softwareCarousel');
    const progressBar = document.querySelector('.carousel-progress');

    if (carousel && progressBar) {
        // 初始进度
        updateProgressBar(0);
        
        // 监听轮播事件
        carousel.addEventListener('slide.bs.carousel', function (e) {
            updateProgressBar(e.to);
        });
        
        carousel.addEventListener('slid.bs.carousel', function (e) {
            updateProgressBar(e.to);
        });
    }
}

function updateProgressBar(activeIndex) {
    const progressBar = document.querySelector('.carousel-progress');
    if (!progressBar) return;
    
    const totalItems = carouselData.length;
    const progress = ((activeIndex + 1) / totalItems) * 100;
    progressBar.style.width = progress + '%';
}

// ========== 倒计时功能 ==========
function initializeCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        console.error('倒计时元素未找到');
        return;
    }

    const deadline = new Date('2025-12-31T23:59:59'); // 活动截止时间
    
    function updateCountdown() {
        const now = new Date();
        const timeLeft = deadline - now;
        
        if (timeLeft <= 0) {
            countdownElement.textContent = '活动已结束';
            countdownElement.classList.add('text-danger', 'fw-bold');
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        countdownElement.textContent = `${days} 天`;
        
        // 如果小于7天，添加警告样式
        if (days < 7) {
            countdownElement.classList.add('text-danger', 'fw-bold');
            countdownElement.classList.remove('text-success');
        } else if (days < 30) {
            countdownElement.classList.add('text-warning', 'fw-bold');
            countdownElement.classList.remove('text-success');
        } else {
            countdownElement.classList.add('text-success', 'fw-bold');
        }
    }
    
    // 立即更新并设置定时器
    updateCountdown();
    setInterval(updateCountdown, 60 * 60 * 1000); // 每小时更新一次（更精确）
}

// 显示下载提示
function showDownloadToast(message) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '11';
    toast.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header">
                <i class="bi bi-info-circle text-primary me-2"></i>
                <strong class="me-auto">下载提示</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// 图片加载完成的淡入效果
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});