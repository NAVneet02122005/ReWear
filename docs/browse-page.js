// Browse page functionality
let currentPage = 1;
let productsData = [];
const PRODUCTS_PER_PAGE = 12;
let currentSort = 'Recommended';

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Not authenticated, redirect to login
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    try {
        const userData = JSON.parse(user);
        window.currentUserId = userData._id;
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
    
    loadProducts();
    setupSortListener();
    setupSearchListener();
});

async function loadProducts() {
    const grid = document.getElementById('productGrid');
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    
    grid.innerHTML = '<p style="text-align: center; padding: 40px;">Loading products...</p>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        
        console.log('Loaded products:', products.length);
        
        if (!Array.isArray(products) || products.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px;">No products found. <a href="upload.html">Upload the first product!</a></p>';
            document.querySelector('.pagination').style.display = 'none';
            return;
        }
        
        productsData = products;
        renderProductsPage(1);
        renderPagination();
        
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #e74c3c;">Failed to load products. Please check if the backend is running.</p>';
        document.querySelector('.pagination').style.display = 'none';
    }
}

function renderProductsPage(page) {
    currentPage = page;
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    let sortedProducts = [...productsData];
    
    // Apply sorting
    if (currentSort === 'Newest' || currentSort === 'Recommended') {
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'Price: Low to High') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'Price: High to Low') {
        sortedProducts.sort((a, b) => b.price - a.price);
    }
    
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageProducts = sortedProducts.slice(start, end);
    
    pageProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images && product.images[0] ? product.images[0] : 'placeholder.jpg'}" 
                     alt="${product.title}"
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">₹${product.price}</div>
                <div class="product-description">${product.description ? product.description.substring(0, 100) + '...' : 'No description'}</div>
                <button class="add-to-cart-btn" data-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        
        // Add click handler for card
        card.onclick = (e) => {
            if (!e.target.classList.contains('add-to-cart-btn') && !e.target.closest('.add-to-cart-btn')) {
                window.location.href = `itemlisting.html?id=${product._id}`;
            }
        };
        
        grid.appendChild(card);
    });
    
    // Add event listeners for add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.getAttribute('data-id');
            addToCart(productId);
        });
    });
    
    // Update cart count
    updateCartCount();
}

function renderPagination() {
    const totalPages = Math.ceil(productsData.length / PRODUCTS_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pagination.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-button';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            renderProductsPage(currentPage - 1);
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-button' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => {
            renderProductsPage(i);
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(btn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-button';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            renderProductsPage(currentPage + 1);
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    pagination.appendChild(nextBtn);
}

function setupSortListener() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProductsPage(1);
            renderPagination();
        });
    }
}

function setupSearchListener() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm === '') {
                renderProductsPage(1);
                renderPagination();
                return;
            }
            
            const filtered = productsData.filter(product => 
                product.title.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
            
            const grid = document.getElementById('productGrid');
            grid.innerHTML = '';
            
            if (filtered.length === 0) {
                grid.innerHTML = '<p style="text-align: center; padding: 40px;">No products match your search.</p>';
                document.querySelector('.pagination').style.display = 'none';
                return;
            }
            
            filtered.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <div class="product-image">
                        <img src="${product.images && product.images[0] ? product.images[0] : 'placeholder.jpg'}" 
                             alt="${product.title}"
                             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">₹${product.price}</div>
                        <div class="product-description">${product.description ? product.description.substring(0, 100) + '...' : 'No description'}</div>
                        <button class="add-to-cart-btn" data-id="${product._id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                `;
                
                card.onclick = (e) => {
                    if (!e.target.classList.contains('add-to-cart-btn') && !e.target.closest('.add-to-cart-btn')) {
                        window.location.href = `itemlisting.html?id=${product._id}`;
                    }
                };
                
                grid.appendChild(card);
            });
            
            // Add event listeners for add to cart buttons
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-id');
                    addToCart(productId);
                });
            });
            
            document.querySelector('.pagination').style.display = 'none';
        });
    }
}

// Cart functionality
function getUserCart() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    
    try {
        const user = JSON.parse(userStr);
        const userCartKey = `cart_${user._id}`;
        return JSON.parse(localStorage.getItem(userCartKey) || '[]');
    } catch (error) {
        console.error('Error getting cart:', error);
        return [];
    }
}

function saveUserCart(cart) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    try {
        const user = JSON.parse(userStr);
        const userCartKey = `cart_${user._id}`;
        localStorage.setItem(userCartKey, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function addToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return;
    }
    
    let cart = getUserCart();
    
    if (cart.includes(productId)) {
        alert('Item already in cart!');
        return;
    }
    
    cart.push(productId);
    saveUserCart(cart);
    updateCartCount();
    
    // Update button
    const btn = document.querySelector(`[data-id="${productId}"]`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        btn.disabled = true;
        btn.style.background = '#27ae60';
    }
    
    // Show notification
    showNotification('Item added to cart!');
}

function updateCartCount() {
    const cart = getUserCart();
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'inline-block' : 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .add-to-cart-btn {
        background: #3C2A21;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 10px;
        transition: all 0.3s;
        width: 100%;
    }
    .add-to-cart-btn:hover:not(:disabled) {
        background: #1A120B;
        transform: translateY(-2px);
    }
    .add-to-cart-btn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);
