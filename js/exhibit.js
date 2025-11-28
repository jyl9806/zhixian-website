// exhibit.js
document.addEventListener('DOMContentLoaded', initializeExhibitPage);

// ========== 全局变量 ==========
let allProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let filteredProducts = [];

// Sealos Cloud对象存储配置
const OBJECT_STORAGE_BASE_URL = 'https://objectstorageapi.hzh.sealos.run/6u3wazcw-zhixiantech';
const EXHIBITS_INDEX_URL = `${OBJECT_STORAGE_BASE_URL}/exhibits-index.json`;

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
async function loadProducts() {
    try {
        await fetchExhibitsFromIndex();
    } catch (error) {
        console.error('加载产品数据失败:', error);
        showErrorMessage('加载产品数据失败，请刷新页面重试');
    }
}

async function fetchExhibitsFromIndex() {
    try {
        showLoadingState();
        
        // 1. 获取展品索引文件
        const indexResponse = await fetch(EXHIBITS_INDEX_URL);
        if (!indexResponse.ok) {
            throw new Error(`无法加载展品索引: ${indexResponse.status}`);
        }
        
        const indexData = await indexResponse.json();
        
        if (!indexData.exhibits || indexData.exhibits.length === 0) {
            showNoProductsMessage();
            return;
        }

        // 2. 并行获取所有展品的详细信息
        const productPromises = indexData.exhibits.map(async (exhibit) => {
            try {
                const infoUrl = `${exhibit.address}/info.json`;
                const infoResponse = await fetch(infoUrl);
                
                if (!infoResponse.ok) {
                    throw new Error(`无法加载展品 ${exhibit.id} 的信息`);
                }
                
                const productInfo = await infoResponse.json();
                
                // 构建完整的图片URL
                const mainImage = `${exhibit.address}/${productInfo.images.main}`;
                const detailImages = productInfo.images.details.map(
                    detail => `${exhibit.address}/${detail}`
                );

                return {
                    id: exhibit.id,
                    name: productInfo.name,
                    mainImage: mainImage,
                    subImages: detailImages,
                    company: productInfo.company,
                    phone: productInfo.phone,
                    social: productInfo.social,
                    description: productInfo.description,
                    uploadTime: productInfo.uploadTime,
                    specifications: productInfo.specifications,
                    folder: exhibit.folder
                };
            } catch (error) {
                console.error(`加载展品 ${exhibit.id} 失败:`, error);
                // 返回一个基本的展品信息，即使详细信息加载失败
                return {
                    id: exhibit.id,
                    name: `编织作品 ${exhibit.id}`,
                    mainImage: `${exhibit.address}/main.jpg`,
                    subImages: [],
                    company: '未知创作者',
                    phone: '未提供',
                    social: '未提供',
                    description: '该展品信息加载失败',
                    uploadTime: '未知时间',
                    folder: exhibit.folder
                };
            }
        });

        // 3. 等待所有展品信息加载完成
        allProducts = await Promise.all(productPromises);
        
        // 过滤掉加载失败的空产品
        allProducts = allProducts.filter(product => product !== null);
        
        if (allProducts.length === 0) {
            showNoProductsMessage();
            return;
        }

        filteredProducts = [...allProducts];
        displayProducts();
        updatePagination();
        
    } catch (error) {
        console.error('获取展品数据失败:', error);
        throw error;
    }
}

// ========== 产品显示功能 ==========
function displayProducts() {
    const container = document.getElementById('exhibits-container');
    const grid = document.getElementById('exhibits-grid');
    
    if (!container || !grid) return;

    grid.style.display = 'block';
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    if (currentProducts.length === 0) {
        showNoProductsMessage();
        return;
    }

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
                ${product.specifications ? `
                <div class="exhibit-badges">
                    <span class="badge bg-primary">${product.specifications.technique}</span>
                </div>
                ` : ''}
            </div>
            <div class="exhibit-info">
                <h5 class="exhibit-name">${product.name}</h5>
                <p class="exhibit-company text-muted small">${product.company}</p>
            </div>
        </div>
    `;

    const card = col.querySelector('.exhibit-card');
    card.addEventListener('click', () => openProductModal(product));

    return col;
}

// ========== 模态框功能 ==========
function openProductModal(product) {
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    const modalLabel = document.getElementById('productDetailModalLabel');
    const carouselInner = document.getElementById('carousel-inner');
    const specificationsContainer = document.getElementById('modal-specifications');
    
    // 更新模态框标题
    modalLabel.textContent = product.name;
    
    // 更新基本信息
    document.getElementById('modal-company').textContent = product.company;
    document.getElementById('modal-phone').textContent = product.phone;
    document.getElementById('modal-social').textContent = product.social;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-upload-time').textContent = product.uploadTime;
    
    // 更新规格信息
    if (product.specifications) {
        const specsHtml = `
            <div class="spec-item">
                <div class="label">材料</div>
                <div class="value">${product.specifications.material}</div>
            </div>
            <div class="spec-item">
                <div class="label">尺寸</div>
                <div class="value">${product.specifications.size}</div>
            </div>
            <div class="spec-item">
                <div class="label">工艺</div>
                <div class="value">${product.specifications.technique}</div>
            </div>
            <div class="spec-item">
                <div class="label">机型</div>
                <div class="value">${product.specifications.machine}</div>
            </div>
        `;
        specificationsContainer.innerHTML = specsHtml;
    } else {
        specificationsContainer.innerHTML = `
            <div class="col-12 text-center text-muted">
                <p>暂无规格信息</p>
            </div>
        `;
    }
    
    // 更新轮播图
    carouselInner.innerHTML = '';
    
    const allImages = [product.mainImage, ...product.subImages];
    allImages.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <img src="${image}" 
                 class="d-block w-100 product-modal-image" 
                 alt="${product.name} - 图片 ${index + 1}"
                 loading="lazy"
                 onerror="handleModalImageError(this)">
        `;
        carouselInner.appendChild(carouselItem);
    });
    
    modal.show();
}

// ========== 创建产品卡片 - 优化版 ==========
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
                <div class="exhibit-views">
                    <i class="bi bi-eye"></i> ${product.views}
                </div>
                ${product.specifications ? `
                <div class="exhibit-badges">
                    <span class="badge bg-primary">${product.specifications.technique}</span>
                </div>
                ` : ''}
            </div>
            <div class="exhibit-info">
                <h5 class="exhibit-name">${product.name}</h5>
                <p class="exhibit-company">${product.company}</p>
            </div>
        </div>
    `;

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
            product.company.toLowerCase().includes(searchTerm) ||
            (product.specifications && product.specifications.material.toLowerCase().includes(searchTerm)) ||
            (product.specifications && product.specifications.technique.toLowerCase().includes(searchTerm))
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
    
    prevPage.parentElement.classList.toggle('disabled', currentPage === 1);
    nextPage.parentElement.classList.toggle('disabled', currentPage === totalPages);
    
    const pageNumbers = paginationList.querySelectorAll('.page-item:not(.prev):not(.next)');
    pageNumbers.forEach(item => item.remove());
    
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
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

// ========== 状态显示 ==========
function showLoadingState() {
    const container = document.getElementById('exhibits-container');
    const grid = document.getElementById('exhibits-grid');
    
    if (container && grid) {
        grid.style.display = 'block';
        container.innerHTML = `
            <div class="col-12">
                <div class="state-prompt text-center py-5">
                    <div class="prompt-content">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <h4 class="text-muted">正在加载展品...</h4>
                        <p class="text-muted mb-4">请稍候，正在从服务器获取数据。</p>
                    </div>
                </div>
            </div>
        `;
    }
}

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
                        <h4 class="text-muted">暂无展品</h4>
                        <p class="text-muted mb-4">当前还没有上传的展品，请稍后再来查看。</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (paginationControls) {
        paginationControls.style.display = 'none';
    }
}

function showErrorMessage(message) {
    const container = document.getElementById('exhibits-container');
    const grid = document.getElementById('exhibits-grid');
    
    if (container && grid) {
        grid.style.display = 'block';
        container.innerHTML = `
            <div class="col-12">
                <div class="state-prompt text-center py-5">
                    <div class="prompt-content">
                        <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                        <h4 class="text-danger">加载失败</h4>
                        <p class="text-muted mb-4">${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
                    </div>
                </div>
            </div>
        `;
    }
}