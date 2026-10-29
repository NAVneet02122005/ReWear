// User Dashboard JavaScript
console.log('Dashboard JS loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing dashboard...');
    
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        console.log('No auth, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        window.currentUser = user;
        console.log('Current user:', user.username);
        
        // Display user info
        displayUserInfo(user);
        
        // Setup tabs
        setupTabs();
        
        // Setup logout
        setupLogout();
        
        // Load data
        await loadAllData();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please try logging in again.');
        window.location.href = 'login.html';
    }
});

// Display user information
function displayUserInfo(user) {
    const usernameEl = document.getElementById('username');
    const avatarEl = document.getElementById('user-avatar');
    const adminLink = document.getElementById('admin-panel-link');
    
    if (usernameEl) usernameEl.textContent = user.username || 'User';
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    
    // Show admin panel link if user is admin
    if (adminLink && (user.role === 'admin' || user.role === 'superadmin')) {
        adminLink.style.display = 'block';
    }
}

// Setup tabs
function setupTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tab.getAttribute('data-tab'));
            
            // Remove active from all
            tabLinks.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            // Add active to clicked
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const content = document.getElementById(tabId);
            if (content) {
                content.style.display = 'block';
            }
        });
    });
}

// Setup logout
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// Load all data
async function loadAllData() {
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    console.log('Loading data from:', API_URL);
    
    await Promise.all([
        loadCartItems(API_URL),
        loadPurchases(API_URL),
        loadMessages(API_URL)
    ]);
}

// Get user cart
function getUserCart() {
    if (!window.currentUser) return [];
    const cartKey = `cart_${window.currentUser._id}`;
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

// Save user cart
function saveUserCart(cart) {
    if (!window.currentUser) return;
    const cartKey = `cart_${window.currentUser._id}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// Load cart items
async function loadCartItems(API_URL) {
    const grid = document.getElementById('myListingsGrid');
    const token = localStorage.getItem('token');
    
    try {
        console.log('Loading cart items...');
        
        // Get all products
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allProducts = await response.json();
        const cart = getUserCart();
        
        console.log('Total products:', allProducts.length);
        console.log('Cart items:', cart.length);
        
        // Filter products in cart
        const cartProducts = allProducts.filter(p => cart.includes(p._id));
        
        // Update count
        document.getElementById('totalListings').textContent = cartProducts.length;
        
        if (cartProducts.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px;">Your cart is empty. <a href="browse.html">Browse products</a></p>';
            document.getElementById('purchase-all-btn').style.display = 'none';
            return;
        }
        
        // Show purchase all button
        document.getElementById('purchase-all-btn').style.display = 'block';
        
        // Render cart items
        grid.innerHTML = '';
        cartProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.cssText = 'background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer;';
            card.innerHTML = `
                <div class="item-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
                    <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300'}" 
                         alt="${product.title}"
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                </div>
                <div class="item-details">
                    <h4 style="margin: 10px 0; color: #3C2A21;">${product.title}</h4>
                    <p style="color: #27ae60; font-size: 1.2rem; font-weight: bold; margin: 5px 0;">₹${product.price}</p>
                    <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button class="purchase-btn" data-id="${product._id}" 
                                style="flex: 1; background: #27ae60; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-shopping-cart"></i> Purchase
                        </button>
                        <button class="remove-btn" data-id="${product._id}"
                                style="flex: 1; background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            
            // Click to view details
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    window.location.href = `itemlisting.html?id=${product._id}`;
                }
            });
            
            grid.appendChild(card);
        });
        
        // Add button listeners
        document.querySelectorAll('.purchase-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute('data-id');
                await purchaseItem(productId, API_URL);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
        
        // Purchase all button
        document.getElementById('purchase-all-btn').addEventListener('click', async () => {
            await purchaseAllItems(API_URL);
        });
        
    } catch (error) {
        console.error('Error loading cart:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #e74c3c;">Failed to load cart items. Please refresh the page.</p>';
    }
}

// Remove from cart
function removeFromCart(productId) {
    let cart = getUserCart();
    cart = cart.filter(id => id !== productId);
    saveUserCart(cart);
    
    // Reload cart
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    loadCartItems(API_URL);
    
    showNotification('Item removed from cart');
}

// Purchase single item
async function purchaseItem(productId, API_URL) {
    const token = localStorage.getItem('token');
    
    try {
        console.log('Purchasing item:', productId);
        
        const response = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Purchase failed');
        }
        
        // Remove from cart
        let cart = getUserCart();
        cart = cart.filter(id => id !== productId);
        saveUserCart(cart);
        
        // Reload data
        await loadAllData();
        
        showNotification('Purchase successful!');
        
    } catch (error) {
        console.error('Purchase error:', error);
        alert('Purchase failed: ' + error.message);
    }
}

// Purchase all items
async function purchaseAllItems(API_URL) {
    const token = localStorage.getItem('token');
    const cart = getUserCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    if (!confirm(`Purchase all ${cart.length} items?`)) {
        return;
    }
    
    try {
        console.log('Purchasing all items:', cart);
        
        const response = await fetch(`${API_URL}/purchases/bulk`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productIds: cart })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Bulk purchase failed');
        }
        
        // Clear cart
        saveUserCart([]);
        
        // Reload data
        await loadAllData();
        
        showNotification('All items purchased successfully!');
        
    } catch (error) {
        console.error('Bulk purchase error:', error);
        alert('Purchase failed: ' + error.message);
    }
}

// Load purchases
async function loadPurchases(API_URL) {
    const grid = document.getElementById('purchasesGrid');
    const token = localStorage.getItem('token');
    
    try {
        console.log('Loading purchases...');
        
        const response = await fetch(`${API_URL}/purchases`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const purchases = await response.json();
        console.log('Purchases loaded:', purchases.length);
        
        // Update count
        document.getElementById('purchaseCount').textContent = purchases.length;
        
        if (purchases.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px;">No purchases yet. <a href="browse.html">Start shopping!</a></p>';
            return;
        }
        
        // Render purchases
        grid.innerHTML = '';
        purchases.forEach(purchase => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.cssText = 'background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
            card.innerHTML = `
                <div class="item-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
                    <img src="${purchase.product?.images?.[0] || 'https://via.placeholder.com/300'}" 
                         alt="${purchase.product?.title || 'Product'}"
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                </div>
                <div class="item-details">
                    <h4 style="margin: 10px 0; color: #3C2A21;">${purchase.product?.title || 'Product'}</h4>
                    <p style="color: #27ae60; font-size: 1.2rem; font-weight: bold; margin: 5px 0;">₹${purchase.totalAmount}</p>
                    <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">
                        <i class="fas fa-calendar"></i> ${new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                    <p style="margin: 5px 0;">
                        <span style="background: #27ae60; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">
                            ${purchase.status}
                        </span>
                    </p>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading purchases:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #e74c3c;">Failed to load purchases.</p>';
    }
}

// Load messages
async function loadMessages(API_URL) {
    const container = document.getElementById('messagesContainer');
    const token = localStorage.getItem('token');
    
    try {
        console.log('Loading messages...');
        
        const response = await fetch(`${API_URL}/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const messages = await response.json();
        console.log('Messages loaded:', messages.length);
        
        // Update counts
        const unreadCount = messages.filter(m => !m.isRead).length;
        document.getElementById('messageCount').textContent = messages.length;
        
        const unreadBadge = document.getElementById('unread-count');
        if (unreadCount > 0) {
            unreadBadge.textContent = unreadCount;
            unreadBadge.style.display = 'inline-block';
        } else {
            unreadBadge.style.display = 'none';
        }
        
        if (messages.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">No messages yet.</p>';
            return;
        }
        
        // Render messages
        container.innerHTML = '';
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                background: ${message.isRead ? '#f9f9f9' : 'white'};
                border-left: 4px solid ${message.isRead ? '#ccc' : '#27ae60'};
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            messageDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <strong style="color: #3C2A21; font-size: 1.1rem;">${message.subject}</strong>
                        ${!message.isRead ? '<span style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 10px;">NEW</span>' : ''}
                    </div>
                    <span style="color: #666; font-size: 0.85rem;">
                        <i class="fas fa-clock"></i> ${new Date(message.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p style="color: #666; margin: 10px 0;">${message.content}</p>
                ${message.relatedProduct ? `<p style="color: #999; font-size: 0.85rem;"><i class="fas fa-tag"></i> Related to: ${message.relatedProduct.title}</p>` : ''}
                ${!message.isRead ? `<button class="mark-read-btn" data-id="${message._id}" style="background: #3C2A21; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-top: 10px;"><i class="fas fa-check"></i> Mark as Read</button>` : ''}
            `;
            container.appendChild(messageDiv);
        });
        
        // Add mark as read listeners
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const messageId = btn.getAttribute('data-id');
                await markMessageAsRead(messageId, API_URL);
            });
        });
        
    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #e74c3c;">Failed to load messages.</p>';
    }
}

// Mark message as read
async function markMessageAsRead(messageId, API_URL) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            await loadMessages(API_URL);
            showNotification('Message marked as read');
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
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
    .unread-badge {
        background: #e74c3c;
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.75rem;
        margin-left: 5px;
    }
`;
document.head.appendChild(style);
