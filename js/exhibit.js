// exhibit.js 完整版本
document.addEventListener('DOMContentLoaded', initializeExhibitPage);

// ========== 全局变量 ==========
let allProducts = [];
let currentPage = 1;
const productsPerPage = 12; // 三行四列 = 12个产品
let filteredProducts = [];

// ========== 初始化函数 ==========
function initializeExhibitPage() {
    initializeEventListeners();
    loadProducts();
}

// ========== 事件监听器初始化 ==========
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', handleSearch);
        searchBtn.addEventListener('click', handleSearch);
    }

    // 排序功能
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // 分页功能
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        prevPage.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(currentPage - 1);
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(currentPage + 1);
        });
    }
}

// ========== 产品数据管理 ==========
function loadProducts() {
    // 模拟从文件系统读取产品数据
    // 在实际应用中，这里应该通过服务器API获取产品数据
    simulateProductDataLoading();
}

function simulateProductDataLoading() {
    // 模拟异步加载
    setTimeout(() => {
        // 这里应该根据实际的文件夹结构动态生成产品列表
        // 假设我们有这些产品文件夹
        const productFolders = [
            'product_id1',
            'product_id2',
            // 可以继续添加更多产品文件夹
        ];

        allProducts = productFolders.map(folder => {
            const id = folder.replace('product_id', '');
            return {
                id: id,
                name: `编织作品 ${id}`,
                mainImage: `images/product/${folder}/id${id}.jpg`,
                subImages: [
                    `images/product/${folder}/sub-images/id${id}1.jpg`,
                    `images/product/${folder}/sub-images/id${id}2.jpg`
                ],
                company: `企业/个人 ${id}`,
                phone: `1380013800${id}`,
                social: `wechat_${id}`,
                description: `这是第${id}号编织作品的详细描述。该作品展示了精湛的编织工艺和创新的设计理念。`,
                uploadTime: `2024-0${id}-15 10:30:00`
            };
        });

        // 如果没有产品，显示提示信息
        if (allProducts.length === 0) {
            showNoProductsMessage();
            return;
        }

        filteredProducts = [...allProducts];
        displayProducts();
        updatePagination();
        
    }, 1000); // 模拟加载延迟
}

// ========== 产品显示功能 ==========
function displayProducts() {
    const container = document.getElementById('exhibits-container');
    const grid = document.getElementById('exhibits-grid');
    
    if (!container || !grid) return;

    // 显示网格
    grid.style.display = 'block';

    // 清空容器
    container.innerHTML = '';

    // 计算当前页的产品
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    if (currentProducts.length === 0) {
        showNoProductsMessage();
        return;
    }

    // 生成产品卡片
    currentProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
    
    col.innerHTML = `
        <div class="exhibit-card" data-product-id="${product.id}">
            <div class="exhibit-image-container">
                <img src="${product.mainImage}" 
                     alt="${product.name}" 
                     class="exhibit-image"
                     loading="lazy"
                     onerror="handleProductImageError(this)">
            </div>
            <div class="exhibit-info">
                <h5 class="exhibit-name">${product.name}</h5>
            </div>
        </div>
    `;

    // 添加点击事件
    const card = col.querySelector('.exhibit-card');
    card.addEventListener('click', () => openProductModal(product));

    return col;
}

// ========== 搜索和排序功能 ==========
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.company.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayProducts();
    updatePagination();
}

function handleSort() {
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'name_asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            break;
        case 'name_desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name, 'zh-CN'));
            break;
        default:
            // 保持原顺序
            break;
    }
    
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// ========== 分页功能 ==========
function updatePagination() {
    const paginationControls = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    }
    
    paginationControls.style.display = 'block';
    
    const paginationList = paginationControls.querySelector('.pagination');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    // 更新上一页/下一页状态
    prevPage.parentElement.classList.toggle('disabled', currentPage === 1);
    nextPage.parentElement.classList.toggle('disabled', currentPage === totalPages);
    
    // 生成页码
    const pageNumbers = paginationList.querySelectorAll('.page-item:not(.prev):not(.next)');
    pageNumbers.forEach(item => item.remove());
    
    // 添加页码
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(i);
        });
        
        paginationList.insertBefore(pageItem, nextPage.parentElement);
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayProducts();
    updatePagination();
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 模态框功能 ==========
function openProductModal(product) {
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    const modalLabel = document.getElementById('productDetailModalLabel');
    const carouselInner = document.getElementById('carousel-inner');
    
    // 更新模态框标题
    modalLabel.textContent = product.name;
    
    // 更新基本信息
    document.getElementById('modal-company').textContent = product.company;
    document.getElementById('modal-phone').textContent = product.phone;
    document.getElementById('modal-social').textContent = product.social;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-upload-time').textContent = product.uploadTime;
    
    // 更新轮播图
    carouselInner.innerHTML = '';
    
    const allImages = [product.mainImage, ...product.subImages];
    allImages.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <img src="${image}" 
                 class="d-block w-100" 
                 alt="${product.name} - 图片 ${index + 1}"
                 onerror="handleModalImageError(this)">
        `;
        carouselInner.appendChild(carouselItem);
    });
    
    // 显示模态框
    modal.show();
    
    // 增加浏览量
    product.views++;
    
    // 更新显示的产品卡片（如果可见）
    const productCard = document.querySelector(`[data-product-id="${product.id}"]`);
    if (productCard) {
        const viewsElement = productCard.querySelector('.exhibit-views');
        if (viewsElement) {
            viewsElement.innerHTML = `<i class="bi bi-eye"></i> ${product.views}`;
        }
    }
}

// ========== 错误处理 ==========
function handleProductImageError(img) {
    const container = img.parentElement;
    container.innerHTML = `
        <div class="exhibit-image-placeholder">
            <i class="bi bi-image display-4 text-muted"></i>
            <p class="mt-2 small">图片加载失败</p>
        </div>
    `;
}

function handleModalImageError(img) {
    const parent = img.parentElement;
    parent.innerHTML = `
        <div class="carousel-placeholder d-flex align-items-center justify-content-center">
            <div class="text-center">
                <i class="bi bi-image display-1 text-muted"></i>
                <p class="mt-2">图片加载失败</p>
            </div>
        </div>
    `;
}

// ========== 空状态显示 ==========
function showNoProductsMessage() {
    const container = document.getElementById('exhibits-container');
    const grid = document.getElementById('exhibits-grid');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (container && grid) {
        grid.style.display = 'block';
        container.innerHTML = `
            <div class="col-12">
                <div class="state-prompt text-center py-5">
                    <div class="prompt-content">
                        <i class="bi bi-inbox display-1 text-muted mb-3"></i>
                        <h4 class="text-muted">暂无用户上传</h4>
                        <p class="text-muted mb-4">当前还没有用户上传展品，请稍后再来查看。</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (paginationControls) {
        paginationControls.style.display = 'none';
    }
}

// ========== 图片懒加载 ==========
function initializeImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.remove('lazy');
                    lazyImageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
}