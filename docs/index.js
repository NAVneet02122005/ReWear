// Index page functionality
document.addEventListener('DOMContentLoaded', async () => {
    await loadFeaturedProducts();
});

// Load featured products
async function loadFeaturedProducts() {
    const grid = document.getElementById('featuredGrid');
    const API_URL = window.API_BASE_URL || 'http://localhost:5000/api';
    
    try {
        grid.innerHTML = '<p style="color: #666;">Loading featured items...</p>';
        
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        
        console.log('Loaded products:', products.length);
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<p style="color: #666;">No products available yet. <a href="upload.html">Be the first to upload!</a></p>';
            return;
        }
        
        // Show up to 6 featured products
        const featuredProducts = products.slice(0, 6);
        
        grid.innerHTML = '';
        
        featuredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.images && product.images[0] ? product.images[0] : 'placeholder.jpg'}" 
                         alt="${product.title}"
                         onerror="this.src='https://via.placeholder.com/240x200?text=No+Image'">
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="price">₹${product.price}</p>
                </div>
            `;
            
            card.onclick = () => {
                window.location.href = `itemlisting.html?id=${product._id}`;
            };
            
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        grid.innerHTML = '<p style="color: #e74c3c;">Failed to load products. Please check if the backend is running.</p>';
    }
}
