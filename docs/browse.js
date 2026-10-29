// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
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
        loadProducts();
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
});

// Get cart for current user
function getUserCart() {
    const userId = window.currentUserId;
    if (!userId) return [];
    
    const userCartKey = `cart_${userId}`;
    return JSON.parse(localStorage.getItem(userCartKey) || '[]');
}

// Save cart for current user
function saveUserCart(cart) {
    const userId = window.currentUserId;
    if (!userId) return;
    
    const userCartKey = `cart_${userId}`;
    localStorage.setItem(userCartKey, JSON.stringify(cart));
}

// Load products from backend
async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
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
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = '<p>Failed to load products.</p>';
    }
}

// Render products in the grid
function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    const cart = getUserCart();
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const isInCart = cart.includes(product._id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300'}" 
                     alt="${product.title}"
                     onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-meta">
                    <span class="product-size">Size: ${product.size || 'M'}</span>
                    <span class="product-condition">Condition: ${product.condition || 'Good'}</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product._id}" ${isInCart ? 'disabled' : ''}>
                        ${isInCart ? '<i class="fas fa-check"></i> In Cart' : '<i class="fas fa-exchange-alt"></i> Request Swap'}
                    </button>
                </div>
            </div>
        `;
        
        // Add click handler to redirect to item detail page
        card.addEventListener('click', function(e) {
            // Don't redirect if clicking on the button
            if (!e.target.closest('.add-to-cart')) {
                window.location.href = `itemlisting.html?id=${product._id}`;
            }
        });
        
        productsGrid.appendChild(card);
    });
    
    // Add event listeners for add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const productId = this.getAttribute('data-id');
            let cart = getUserCart();
            
            if (!cart.includes(productId)) {
                cart.push(productId);
                saveUserCart(cart);
                
                // Update button
                this.innerHTML = '<i class="fas fa-check"></i> In Cart';
                this.disabled = true;
                
                // Update cart count
                updateCartCount();
                
                // Show notification
                showNotification('Added to cart!');
            }
        });
    });
}

// Show notification
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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

// Update cart count display
function updateCartCount() {
    const cart = getUserCart();
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Cart functionality
const cartButton = document.getElementById('cart-button');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');

cartButton.addEventListener('click', function(e) {
    e.preventDefault();
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    loadCartItems();
});

closeCart.addEventListener('click', function() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', function() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Load cart items
async function loadCartItems() {
    try {
        const token = localStorage.getItem('token');
        const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        const cart = getUserCart();
        const cartItems = products.filter(product => cart.includes(product._id));
        
        const cartContainer = document.querySelector('.cart-items');
        cartContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p>No items in cart</p>';
            return;
        }
        
        cartItems.forEach(product => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.images && product.images[0] ? product.images[0] : ''}" alt="${product.title}">
                <div class="cart-item-info">
                    <h4>${product.title}</h4>
                    <p>Size: ${product.size || 'M'}</p>
                </div>
                <button class="cart-item-remove" data-id="${product._id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartContainer.appendChild(cartItem);
        });
        
        // Add event listeners for remove buttons
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                let cart = getUserCart();
                cart = cart.filter(id => id !== productId);
                saveUserCart(cart);
                
                // Remove from display
                const cartItem = this.closest('.cart-item');
                cartItem.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    cartItem.remove();
                    updateCartCount();
                }, 300);
            });
        });
        
    } catch (error) {
        console.error('Error loading cart items:', error);
    }
}

// Filter toggle
const filterButton = document.getElementById('filter-button');
const filters = document.getElementById('filters');

filterButton.addEventListener('click', function() {
    filters.classList.toggle('active');
});

// Filter options
const filterOptions = document.querySelectorAll('.filter-option');

filterOptions.forEach(option => {
    option.addEventListener('click', function() {
        if (this.classList.contains('active')) {
            this.classList.remove('active');
        } else {
            // Remove active class from siblings in the same group
            const parentOptions = this.parentNode.querySelectorAll('.filter-option');
            parentOptions.forEach(opt => opt.classList.remove('active'));
            
            this.classList.add('active');
        }
    });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');

searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value.toLowerCase();
        const productTitles = document.querySelectorAll('.product-title');
        
        productTitles.forEach(title => {
            const productCard = title.closest('.product-card');
            if (title.textContent.toLowerCase().includes(searchTerm)) {
                productCard.style.display = 'block';
            } else {
                productCard.style.display = 'none';
            }
        });
    }
});

// Initialize cart count
updateCartCount();

// Add CSS animations for notifications
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
`;
document.head.appendChild(style);
