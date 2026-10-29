// Item Listing Page JavaScript
console.log('Item listing JS loaded');

// Check authentication and get user ID
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        currentUserId = userData._id;
        loadProduct();
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
    }
});

// Get cart for current user
function getUserCart() {
    if (!currentUserId) return [];
    const userCartKey = `cart_${currentUserId}`;
    return JSON.parse(localStorage.getItem(userCartKey) || '[]');
}

// Save cart for current user
function saveUserCart(cart) {
    if (!currentUserId) return;
    const userCartKey = `cart_${currentUserId}`;
    localStorage.setItem(userCartKey, JSON.stringify(cart));
}

// Get product ID from URL
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadProduct() {
    const id = getProductId();
    const detail = document.getElementById('productDetail');
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    
    if (!id) {
        detail.innerHTML = '<p>Product not found.</p>';
        return;
    }
    
    detail.innerHTML = '<p>Loading...</p>';
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/products/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error('Not found');
        
        const product = await res.json();
        console.log('Product loaded:', product);
        
        // Gallery logic
        let mainImage = product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/600?text=No+Image';
        let thumbnails = '';
        
        if (product.images && product.images.length > 1) {
            thumbnails = '<div class="thumbnails" id="thumbnailsGallery">' + product.images.map((img, i) =>
                `<img src="${img}" class="thumbnail" id="thumb${i}" style="width:60px;cursor:pointer;margin:4px;border-radius:6px;${i===0?'border:2px solid #3C2A21;':''}" onclick="setMainImage('${img}', ${i}, ${product.images.length})">`
            ).join('') + '</div>';
        }
        
        // Check if already in cart using user-specific cart
        let cart = getUserCart();
        let inCart = cart.includes(product._id);
        
        detail.innerHTML = `
            <div class="product-images">
                <div class="main-image">
                    <img id="mainProductImage" src="${mainImage}" alt="${product.title}">
                </div>
                ${thumbnails}
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.title}</h1>
                <div class="product-price">₹${product.price}</div>
                <div class="product-description">
                    <p>${product.description || 'No description available.'}</p>
                </div>
                <div class="product-actions">
                    <div class="action-buttons">
                        <button class="btn btn-primary${inCart ? ' added' : ''}" id="cartBtn" onclick="toggleCart('${product._id}')">
                            ${inCart ? '<i class="fas fa-check"></i> In Cart' : '<i class="fas fa-shopping-cart"></i> Add to Cart'}
                        </button>
                        <button class="btn btn-success" onclick="purchaseItem('${product._id}', ${product.price})">
                            <i class="fas fa-credit-card"></i> Purchase Now
                        </button>
                        ${inCart ? '<button class="btn btn-danger" onclick="removeFromCart(\'' + product._id + '\')"><i class="fas fa-trash"></i> Remove</button>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Load related products
        loadRelatedProducts(id);
        
    } catch (err) {
        console.error('Error loading product:', err);
        detail.innerHTML = '<p>Failed to load product. Please try again.</p>';
    }
}

// Set main image and highlight selected thumbnail
function setMainImage(img, idx, total) {
    document.getElementById('mainProductImage').src = img;
    for (let i = 0; i < total; i++) {
        const thumb = document.getElementById('thumb' + i);
        if (thumb) thumb.style.border = i === idx ? '2px solid #3C2A21' : 'none';
    }
}

function toggleCart(productId) {
    let cart = getUserCart();
    const btn = document.getElementById('cartBtn');
    
    if (!cart.includes(productId)) {
        // Add to cart
        cart.push(productId);
        saveUserCart(cart);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> In Cart';
            btn.classList.add('added');
        }
        // Add remove button
        const actionsDiv = document.querySelector('.action-buttons');
        if (actionsDiv && !document.querySelector('.btn-danger')) {
            actionsDiv.innerHTML += '<button class="btn btn-danger" onclick="removeFromCart(\'' + productId + '\')"><i class="fas fa-trash"></i> Remove</button>';
        }
        showNotification('Added to cart!');
    } else {
        // Remove from cart
        cart = cart.filter(id => id !== productId);
        saveUserCart(cart);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            btn.classList.remove('added');
        }
        // Remove remove button
        const removeBtn = document.querySelector('.btn-danger');
        if (removeBtn) {
            removeBtn.remove();
        }
        showNotification('Removed from cart');
    }
}

function removeFromCart(productId) {
    let cart = getUserCart();
    cart = cart.filter(id => id !== productId);
    saveUserCart(cart);
    
    const btn = document.getElementById('cartBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        btn.classList.remove('added');
    }
    
    // Remove remove button
    const removeBtn = document.querySelector('.btn-danger');
    if (removeBtn) {
        removeBtn.remove();
    }
    
    showNotification('Removed from cart');
}

async function loadRelatedProducts(currentId) {
    const grid = document.getElementById('relatedProducts');
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error('Failed to load products');
        
        const products = await res.json();
        const related = products.filter(p => p._id !== currentId);
        
        if (!related.length) {
            grid.innerHTML = '<p>No related products found.</p>';
            return;
        }
        
        grid.innerHTML = '';
        related.slice(0, 4).forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="product-card-image">
                    <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300'}" 
                         alt="${product.title}"
                         onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-title">${product.title}</h3>
                    <div class="product-card-price">₹${product.price}</div>
                </div>
            `;
            card.onclick = () => {
                window.location.href = `itemlisting.html?id=${product._id}`;
            };
            grid.appendChild(card);
        });
        
    } catch (err) {
        console.error('Error loading related products:', err);
        grid.innerHTML = '<p>Failed to load related products.</p>';
    }
}

// Purchase item function
async function purchaseItem(productId, productPrice) {
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        const res = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            alert(errorData.message || 'Failed to purchase item');
            return;
        }
        
        const purchaseResult = await res.json();
        
        // Remove from cart if it was there
        let cart = getUserCart();
        cart = cart.filter(id => id !== productId);
        saveUserCart(cart);
        
        alert('Purchase successful! Item has been added to your purchase history.');
        
        // Redirect to dashboard
        window.location.href = 'userdashboard.html';
        
    } catch (err) {
        console.error('Error purchasing item:', err);
        alert('Failed to purchase item. Please try again.');
    }
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

// Add CSS animations
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
