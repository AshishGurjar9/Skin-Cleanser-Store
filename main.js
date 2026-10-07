// Main Application Logic for Flawless Skincare

// Cart Storage & State
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('flawless_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('flawless_cart', JSON.stringify(cart));
    renderCart();
}

function formatPrice(num) {
    return '$' + Number(num || 0).toFixed(2);
}

// Cart Item Actions
function changeItemQty(id, change) {
    let cart = getCart();
    let idx = cart.findIndex(item => item.id === id);
    if (idx !== -1) {
        cart[idx].qty += change;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        saveCart(cart);
    }
}

function removeItemFromCart(id) {
    saveCart(getCart().filter(item => item.id !== id));
}

// Render Cart Offcanvas & Badges
function renderCart() {
    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update prices & badges across navbar and buttons
    document.querySelectorAll('.navbar-cart-price').forEach(el => {
        el.innerText = totalQty > 0 ? formatPrice(totalPrice) : '';
        el.style.visibility = totalQty > 0 ? 'visible' : 'hidden';
        el.closest('.navbar-cart-link')?.parentElement.classList.toggle('navbar-cart-empty', totalQty === 0);
    });
    document.querySelectorAll('.navbar-cart-badge, .floating-cart-btn .badge').forEach(el => {
        el.innerText = totalQty;
        el.classList.toggle('d-none', totalQty === 0);
        el.style.display = totalQty > 0 ? 'inline-flex' : 'none';
    });

    // Update drawer header and totals
    let headerBadge = document.getElementById('cartHeaderBadge');
    let subtotalEl = document.getElementById('cartSubtotal');
    let totalEl = document.getElementById('cartTotal');
    if (headerBadge) headerBadge.innerText = totalQty;
    if (subtotalEl) subtotalEl.innerText = formatPrice(totalPrice);
    if (totalEl) totalEl.innerText = formatPrice(totalPrice);

    // Free shipping progress bar ($1000 threshold)
    let shippingBar = document.getElementById('shippingProgressBar');
    let shippingText = document.getElementById('shippingNoticeText');
    if (shippingBar && shippingText) {
        const threshold = 1000.00;
        if (totalPrice >= threshold) {
            shippingText.innerHTML = '<strong class="text-success">Congratulations! You unlocked Free Shipping!</strong>';
            shippingBar.style.width = '100%';
            shippingBar.className = 'progress-bar bg-success';
        } else {
            let away = threshold - totalPrice;
            shippingText.innerHTML = `You're <strong class="text-danger">${formatPrice(away)}</strong> away from free shipping!`;
            let pct = Math.max(5, (totalPrice / threshold) * 100);
            shippingBar.style.width = pct + '%';
            shippingBar.className = 'progress-bar bg-danger';
        }
    }

    // Render cart items list
    let container = document.getElementById('cartItemsContainer');
    let emptyMsg = document.getElementById('emptyCartMessage');
    let footer = document.getElementById('cartFooter');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        container.classList.add('d-none');
        if (emptyMsg) emptyMsg.classList.remove('d-none');
        if (footer) footer.classList.add('d-none');
    } else {
        if (emptyMsg) emptyMsg.classList.add('d-none');
        if (footer) footer.classList.remove('d-none');
        container.classList.remove('d-none');

        container.innerHTML = cart.map(item => `
            <div class="cart-item-row" data-id="${item.id}">
                <div class="cart-item-img">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="flex-grow-1">
                    <a href="product-detail.html" class="text-decoration-none text-dark fw-medium small d-block mb-1">${item.name}</a>
                    <span class="text-secondary small d-block mb-1">${formatPrice(item.price)}</span>
                    <span class="cart-remove-link btn-remove-item" data-id="${item.id}">REMOVE</span>
                </div>
                <div class="cart-qty-ctrl">
                    <button type="button" class="cart-qty-btn btn-qty-plus" data-id="${item.id}">+</button>
                    <span class="cart-qty-val">${item.qty}</span>
                    <button type="button" class="cart-qty-btn btn-qty-minus" data-id="${item.id}">-</button>
                </div>
            </div>
        `).join('');

        // Attach item controls
        container.querySelectorAll('.btn-qty-plus').forEach(btn => btn.onclick = () => changeItemQty(btn.dataset.id, 1));
        container.querySelectorAll('.btn-qty-minus').forEach(btn => btn.onclick = () => changeItemQty(btn.dataset.id, -1));
        container.querySelectorAll('.btn-remove-item').forEach(btn => btn.onclick = () => removeItemFromCart(btn.dataset.id));
    }

    renderCheckoutSummary(cart, totalPrice);
}

// Checkout Summary
function renderCheckoutSummary(cart, totalPrice) {
    let list = document.getElementById('checkoutItemsList');
    if (!list) return;

    let subtotalEl = document.getElementById('checkoutSubtotal');
    let totalEl = document.getElementById('checkoutTotal');
    let placeOrderEl = document.getElementById('placeOrderPrice');

    if (cart.length === 0) {
        list.innerHTML = '<p class="text-secondary small mb-0">Your cart is empty. <a href="shop.html" class="text-primary fw-medium">Continue shopping</a></p>';
    } else {
        list.innerHTML = cart.map(item => `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div class="d-flex align-items-center gap-3">
                    <div class="checkout-item-img">
                        <img src="${item.img}" alt="${item.name}">
                        <span class="checkout-item-badge">${item.qty}</span>
                    </div>
                    <span class="text-dark small fw-medium">${item.name}</span>
                </div>
                <span class="text-dark small fw-semibold">${formatPrice(item.price * item.qty)}</span>
            </div>
        `).join('');
    }

    let priceStr = formatPrice(totalPrice);
    if (subtotalEl) subtotalEl.innerText = priceStr;
    if (totalEl) totalEl.innerText = priceStr;
    if (placeOrderEl) placeOrderEl.innerText = priceStr;
}

// Open Cart Drawer
function openCartOffcanvas() {
    let el = document.getElementById('cartOffcanvas');
    if (el && window.bootstrap) bootstrap.Offcanvas.getOrCreateInstance(el).show();
}

// Product Catalog & Fallback Data
const FALLBACK_PRODUCTS = [
    { id: "almond-milk-lotion", name: "Almond Milk Lotion", category: "Body lotion", price: 28.00, priceDisplay: "$28.00", img: "images/skin-cleanser-template-product-img-8.jpg", rating: 5, description: "Enriched with sweet almond extract and organic milk proteins.", isFeatured: false },
    { id: "antiaging-skin-oil", name: "Antiaging Skin Oil", category: "Moisturizer", price: 44.90, priceDisplay: "$44.90", img: "images/skin-cleanser-template-product-img-4.jpg", rating: 5, description: "Revitalizing face and neck oil formulated with botanical antioxidants.", isFeatured: true },
    { id: "balancing-daily-cleanser", name: "Balancing Daily Cleanser", category: "Cleanser", price: 34.90, priceDisplay: "$34.90", img: "images/skin-cleanser-template-product-img-5.jpg", rating: 5, description: "pH-balanced daily wash that gently purifies skin pores.", isFeatured: false },
    { id: "calm-hydrating-moisturizer", name: "Calm Hydrating Moisturizer", category: "Bundles", price: 29.90, priceDisplay: "$29.90 – $34.90", img: "images/skin-cleanser-template-product-img-14.jpg", rating: 5, description: "Ultra-lightweight cream loaded with hyaluronic acid.", isFeatured: true },
    { id: "cleanser-concentrate", name: "Cleanser Concentrate", category: "Cleanser", price: 30.00, priceDisplay: "$30.00", img: "images/skin-cleanser-template-product-img-7.jpg", rating: 5, description: "High-potency gentle concentrate that eliminates makeup easily.", isFeatured: false },
    { id: "complex-sunscreen-balm", name: "Complex Sunscreen Balm", category: "Sunscreens", price: 22.50, priceDisplay: "$22.50", img: "images/skin-cleanser-template-product-img-12.jpg", rating: 5, description: "Broad-spectrum SPF 50+ mineral balm without white cast.", isFeatured: true },
    { id: "cream-to-foam-lotion", name: "Cream to Foam Lotion", category: "Body lotion", price: 18.90, priceDisplay: "$18.90", img: "images/skin-cleanser-template-product-img-2.jpg", rating: 5, description: "Transforming cream that lathers into a luxurious foam.", isFeatured: true },
    { id: "energizing-marine-lotion", name: "Energizing Marine Lotion", category: "Body lotion", price: 20.50, priceDisplay: "$20.50", img: "images/skin-cleanser-template-product-img-1.jpg", rating: 5, description: "Infused with sea kelp and marine algae for cool hydration.", isFeatured: false },
    { id: "hybrid-cleansing-balm", name: "Hybrid Cleansing Balm", category: "Cleanser", price: 32.90, priceDisplay: "$32.90", img: "images/skin-cleanser-template-product-img-3.jpg", rating: 5, description: "Sherbet-like cleansing balm that dissolves waterproof makeup.", isFeatured: true },
    { id: "hydrating-gel-oil", name: "Hydrating Gel Oil", category: "Moisturizer", price: 20.00, priceDisplay: "$20.00", img: "images/skin-cleanser-template-product-img-9.jpg", rating: 5, description: "Unique gel-to-oil hybrid formula providing deep nourishment.", isFeatured: false },
    { id: "makeup-melting-cleanser", name: "Makeup Melting Cleanser", category: "Cleanser", price: 29.90, priceDisplay: "$29.90", img: "images/skin-cleanser-template-product-img-10.jpg", rating: 5, description: "Gentle botanical cleanser designed to dissolve makeup.", isFeatured: false },
    { id: "milky-gentle-cleanser", name: "Milky Gentle Cleanser", category: "Cleanser", price: 28.90, priceDisplay: "$28.90", img: "images/skin-cleanser-template-product-img-13.jpg", rating: 5, description: "Creamy conditioning emulsion enriched with oat extract.", isFeatured: false },
    { id: "soothing-sunscreen-gel", name: "Soothing Sunscreen Gel", category: "Sunscreens", price: 24.50, priceDisplay: "$24.50", img: "images/skin-cleanser-template-product-img-11.jpg", rating: 5, description: "Invisible non-greasy SPF 45 sunscreen gel.", isFeatured: false },
    { id: "flawless-face-lotion", name: "Flawless Face Lotion", category: "Moisturizer", price: 26.00, priceDisplay: "$26.00", img: "images/skin-cleanser-template-face-lotion-image.png", rating: 5, description: "Signature daily moisturizer with velvety matte finish.", isFeatured: false }
];

async function loadProductsData() {
    try {
        let res = await fetch('products.json');

        if (res.ok) {
            let data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
        }

    } catch (e) {
        console.info('Loaded fallback products catalog');
    }

    return FALLBACK_PRODUCTS;
}


// Quick Add to Cart (On-Card Button)
function quickAddToCart(productId, buttonEl, allProductsList) {

    const list = allProductsList || FALLBACK_PRODUCTS;

    let p = list.find(
        item => String(item.id) === String(productId)
    );

    if (!p) {
        p = FALLBACK_PRODUCTS.find(
            item => String(item.id) === String(productId)
        );
    }

    if (!p) {
        console.log("Product not found:", productId);
        return;
    }

    let cart = getCart();

    let existing = cart.find(
        item => String(item.id) === String(p.id)
    );

    if (existing) {

        existing.qty += 1;

    } else {

        cart.push({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            img: p.img,
            qty: 1
        });

    }

    saveCart(cart);


    // Visual Feedback on Button
    if (buttonEl) {

        buttonEl.classList.add('added-success');

        let icon = buttonEl.querySelector('i');

        let tooltip = buttonEl.querySelector(
            '.ast-card-action-tooltip'
        );

        let originalIcon = icon
            ? icon.className
            : 'bi bi-bag';


        if (icon) {
            icon.className = 'bi bi-check-lg';
        }

        if (tooltip) {
            tooltip.innerText = 'Added!';
        }


        setTimeout(() => {

            buttonEl.classList.remove('added-success');

            if (icon) {
                icon.className = originalIcon;
            }

            if (tooltip) {
                tooltip.innerText = 'Add to cart';
            }

        }, 1400);
    }


    openCartOffcanvas();
}
// Home Page Dynamic Products
async function initHomePage() {
    let newArrivalsEl = document.getElementById('homeNewArrivalsGrid');
    let mostLovedEl = document.getElementById('homeMostLovedGrid');
    if (!newArrivalsEl && !mostLovedEl) return;

    const allProducts = await loadProductsData();

    function renderHomeCard(p) {
        let priceText = p.priceDisplay || formatPrice(p.price);
        let detailUrl = `product-detail.html?name=${encodeURIComponent(p.name)}&price=${p.price}&img=${encodeURIComponent(p.img)}&category=${encodeURIComponent(p.category)}`;

        return `
            <div class="col-6 col-sm-6 col-lg-3 product-item">
                <div class="product-card-wrap">
                    <div class="product-thumbnail-wrap">
                        <a href="${detailUrl}" class="d-flex align-items-center justify-content-center w-100 text-decoration-none">
                            <img src="${p.img}" class="img-fluid" alt="${p.name}">
                        </a>
                        <button type="button" class="ast-on-card-button btn-quick-cart" data-id="${p.id}" aria-label="Add to cart: ${p.name}">
                            <span class="ast-card-action-tooltip">Add to cart</span>
                            <i class="bi bi-bag"></i>
                        </button>
                    </div>
                    <div class="pt-3 text-start">
                        <span class="product-cat-name d-block">${p.category}</span>
                        <a href="${detailUrl}" class="text-decoration-none text-dark">
                            <h3 class="product-item-title mb-1">${p.name}</h3>
                        </a>
                        <div class="product-item-price">${priceText}</div>
                    </div>
                </div>
            </div>`;
    }

    if (newArrivalsEl) {
        let arrivalIds = ["hybrid-cleansing-balm", "soothing-sunscreen-gel", "energizing-marine-lotion", "calm-hydrating-moisturizer", "makeup-melting-cleanser", "balancing-daily-cleanser", "hydrating-gel-oil", "cleanser-concentrate"];
        let arrivalProducts = arrivalIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
        if (arrivalProducts.length === 0) arrivalProducts = allProducts.slice(0, 8);
        newArrivalsEl.innerHTML = arrivalProducts.map(renderHomeCard).join('');
    }

    if (mostLovedEl) {
        let lovedIds = ["antiaging-skin-oil", "cream-to-foam-lotion", "complex-sunscreen-balm", "calm-hydrating-moisturizer"];
        let lovedProducts = lovedIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
        if (lovedProducts.length === 0) lovedProducts = allProducts.filter(p => p.isFeatured).slice(0, 4);
        mostLovedEl.innerHTML = lovedProducts.map(renderHomeCard).join('');
    }

    // Attach Quick Add listener to all cards on Home Page
    document.querySelectorAll('#homeNewArrivalsGrid .btn-quick-cart, #homeMostLovedGrid .btn-quick-cart').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            quickAddToCart(btn.dataset.id, btn, allProducts);
        };
    });
}
// Product Detail Page
function initProductDetailPage() {
    let urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get('name');
    let price = urlParams.get('price');
    let img = urlParams.get('img');
    let category = urlParams.get('category');

    if (name) {
        let cleanName = name.trim();
        document.title = `${cleanName} - Skin Cleanser Store`;
        let titleEl = document.getElementById('productDetailTitle');
        if (titleEl) titleEl.innerText = cleanName;
        let breadcrumbActive = document.getElementById('breadcrumbProductName');
        if (breadcrumbActive) breadcrumbActive.innerText = cleanName;
        let reviewsNotice = document.getElementById('productReviewsNotice');
        if (reviewsNotice) reviewsNotice.innerText = `There are no reviews yet. Be the first to review "${cleanName}".`;
    }

    if (category) {
        ['productCategorySub', 'breadcrumbCategory', 'productDetailCategoryMeta'].forEach(id => {
            let el = document.getElementById(id);
            if (el) el.innerText = category;
        });
    }

    if (price) {
        let priceEl = document.getElementById('productDetailPrice');
        if (priceEl) priceEl.innerText = formatPrice(price);
    }

    if (img) {
        let imgEl = document.getElementById('mainProductImg');
        if (imgEl) {
            imgEl.src = img;
            if (name) imgEl.alt = name;
        }
        let zoomLink = document.getElementById('productZoomLink');
        if (zoomLink) zoomLink.href = img;
    }

    const imageCard = document.querySelector('.product-detail-img-card');
    const productImage = document.getElementById('mainProductImg');
    if (imageCard && productImage && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let imageBounds;
        const updateZoomPosition = (event) => {
            if (!imageBounds) return;
            const x = Math.min(Math.max(event.clientX - imageBounds.left, 0), imageBounds.width);
            const y = Math.min(Math.max(event.clientY - imageBounds.top, 0), imageBounds.height);
            productImage.style.transformOrigin = `${x}px ${y}px`;
        };

        imageCard.addEventListener('pointerenter', (event) => {
            imageBounds = productImage.getBoundingClientRect();
            imageCard.classList.add('is-zoomed');
            updateZoomPosition(event);
        });
        imageCard.addEventListener('pointermove', updateZoomPosition);
        imageCard.addEventListener('pointerleave', () => {
            imageCard.classList.remove('is-zoomed');
            productImage.style.removeProperty('transform-origin');
            imageBounds = null;
        });
    }

    // Add To Cart Button Handler
    let addBtn = document.getElementById('btnSingleAddToCart');
    if (addBtn) {
        addBtn.onclick = () => {
            let qty = Math.max(1, parseInt(document.getElementById('productSingleQty')?.value, 10) || 1);
            let pName = document.getElementById('productDetailTitle')?.innerText.trim() || 'Antiaging Skin Oil';
            let pId = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let pImg = document.getElementById('mainProductImg')?.getAttribute('src') || 'images/skin-cleanser-template-product-img-4.jpg';
            let priceMatch = document.getElementById('productDetailPrice')?.innerText.match(/\$([0-9]+(?:\.[0-9]+)?)/);
            let pPrice = priceMatch ? parseFloat(priceMatch[1]) : 44.90;

            let cart = getCart();
            let existing = cart.find(item => item.id === pId);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ id: pId, name: pName, price: pPrice, img: pImg, qty: qty });
            }
            saveCart(cart);
            openCartOffcanvas();
        };
    }
}

// Shop Catalog Page Engine
async function initShopPage() {
    let grid = document.getElementById('productGrid');
    if (!grid) return;

    const allProducts = await loadProductsData();
    let activeCategory = '';
    let sortType = 'default';
    let currentPage = 1;
    const itemsPerPage = 12;

    const showingCount = document.getElementById('showingCount');
    const pagination = document.getElementById('shopPagination');
    const sortSelect = document.getElementById('sortSelect');
    const catLinks = document.querySelectorAll('#categoryFilterList a');

    function updateCategoryCounts() {
        let counts = { '': allProducts.length };
        allProducts.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
        let allSpan = document.getElementById('catCountAll');
        if (allSpan) allSpan.innerText = `(${counts['']})`;

        catLinks.forEach(link => {
            let cat = link.dataset.category;
            let badge = link.querySelector('span:last-child');
            if (badge && cat) badge.innerText = `(${counts[cat] || 0})`;
        });
    }

    function renderProducts() {
        let filtered = allProducts.filter(p => !activeCategory || p.category === activeCategory);

        // Sorting
        let sorted = [...filtered];
        if (sortType === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        else if (sortType === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        else if (sortType === 'popularity') sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        else if (sortType === 'rating') sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5));

        // Pagination
        let total = sorted.length;
        let pages = Math.ceil(total / itemsPerPage) || 1;
        currentPage = Math.min(Math.max(1, currentPage), pages);
        let start = (currentPage - 1) * itemsPerPage;
        let paged = sorted.slice(start, start + itemsPerPage);

        if (showingCount) {
            showingCount.innerText = total === 0 ? 'Showing 0 results' : `Showing ${start + 1}–${Math.min(start + itemsPerPage, total)} of ${total} results`;
        }

        if (paged.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-secondary fs-5 mb-3">No products match your selected filters.</p>
                    <button type="button" class="btn shop2 rounded-pill px-4 py-2 small" id="resetFiltersBtn">Reset Filters</button>
                </div>`;
            document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
                activeCategory = '';
                catLinks.forEach(l => l.classList.toggle('active', l.dataset.category === ''));
                currentPage = 1;
                renderProducts();
            });
        } else {
    grid.innerHTML = paged.map(p => {

        let detailUrl = `product-detail.html?name=${encodeURIComponent(p.name)}&price=${p.price}&img=${encodeURIComponent(p.img)}&category=${encodeURIComponent(p.category)}`;

        return `
            <div class="col product-item" data-id="${p.id}" data-price="${p.price}">

                <div class="shop-product-card h-100 p-2">

                    <div class="product-thumbnail-wrap">

                        <a href="${detailUrl}" class="text-decoration-none text-dark d-block">

                            <div class="bg-light rounded text-center p-2 p-md-3 mb-3">

                                <img src="${p.img}"
                                    class="img-fluid"
                                    alt="${p.name}">

                            </div>

                        </a>

                        <button type="button"
                            class="ast-on-card-button btn-quick-cart"
                            data-id="${p.id}"
                            aria-label="Add to cart: ${p.name}">

                            <span class="ast-card-action-tooltip">
                                Add to cart
                            </span>

                            <i class="bi bi-bag"></i>

                        </button>

                    </div>

                    <div class="product-info text-start">

                        <span class="d-block text-secondary small mb-1">
                            ${p.category}
                        </span>

                        <h6 class="fw-normal mb-1 text-dark">
                            ${p.name}
                        </h6>

                        <p class="fw-semibold text-dark mb-0 small">
                            ${p.priceDisplay || formatPrice(p.price)}
                        </p>

                    </div>

                </div>

            </div>`;
            
    }).join('');

    // Attach Quick Add listener to shop product buttons
    grid.querySelectorAll('.btn-quick-cart').forEach(btn => {

        btn.onclick = (e) => {

            e.preventDefault();
            e.stopPropagation();

            quickAddToCart(
                btn.dataset.id,
                btn,
                allProducts
            );

        };

    });

}

        // Render Pagination Controls
        if (pagination) {
            if (pages <= 1) {
                pagination.innerHTML = '';
            } else {
                let html = '';
                if (currentPage > 1) {
                    html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a></li>`;
                }
                for (let i = 1; i <= pages; i++) {
                    html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
                }
                if (currentPage < pages) {
                    html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a></li>`;
                }
                pagination.innerHTML = html;
                pagination.querySelectorAll('a.page-link').forEach(link => {
                    link.onclick = (e) => {
                        e.preventDefault();
                        currentPage = parseInt(link.dataset.page, 10);
                        renderProducts();
                        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
                    };
                });
            }
        }
    }

    // Category Sidebar Listeners
    catLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            catLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            activeCategory = link.dataset.category || '';
            currentPage = 1;
            renderProducts();
        };
    });

    // Check URL Category Query Param
    try {
        let urlCat = new URLSearchParams(window.location.search).get('category');
        if (urlCat) {
            let catTrim = urlCat.trim().toLowerCase();
            catLinks.forEach(link => {
                if ((link.dataset.category || '').trim().toLowerCase() === catTrim) {
                    catLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    activeCategory = link.dataset.category;
                }
            });
        }
    } catch (err) {}

    // Footer Category Filter Click Handler
    document.querySelectorAll('.footer-category-link').forEach(fLink => {
        fLink.onclick = (e) => {
            let cat = fLink.dataset.cat;
            if (cat) {
                e.preventDefault();
                catLinks.forEach(l => l.classList.toggle('active', l.dataset.category === cat));
                activeCategory = cat;
                currentPage = 1;
                renderProducts();
                window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
            }
        };
    });

//      // Sort Listeners
    sortSelect?.addEventListener('change', () => { sortType = sortSelect.value; currentPage = 1; renderProducts(); });

    updateCategoryCounts();
    renderProducts();
}

// Product Details Tabs
function initProductTabs() {
    let descBtn = document.getElementById('descTabBtn');
    let reviewBtn = document.getElementById('reviewTabBtn');
    let descContent = document.getElementById('descTabContent');
    let reviewContent = document.getElementById('reviewTabContent');

    if (descBtn && reviewBtn) {
        descBtn.onclick = () => {
            descBtn.classList.add('active', 'border-dark');
            descBtn.classList.remove('text-secondary');
            reviewBtn.classList.remove('active', 'border-dark');
            reviewBtn.classList.add('text-secondary');
            descContent?.classList.remove('d-none');
            reviewContent?.classList.add('d-none');
        };
        reviewBtn.onclick = () => {
            reviewBtn.classList.add('active', 'border-dark');
            reviewBtn.classList.remove('text-secondary');
            descBtn.classList.remove('active', 'border-dark');
            descBtn.classList.add('text-secondary');
            descContent?.classList.add('d-none');
            reviewContent?.classList.remove('d-none');
        };
    }
}

// Quantity Buttons on Product Detail
function initQtyInputs() {
    let minus = document.getElementById('qtyMinusBtn');
    let plus = document.getElementById('qtyPlusBtn');
    let input = document.getElementById('detailQtyInput');
    if (minus && plus && input) {
        minus.onclick = () => { let v = parseInt(input.value) || 1; if (v > 1) input.value = v - 1; };
        plus.onclick = () => { input.value = (parseInt(input.value) || 1) + 1; };
    }
}

// Checkout Form & Coupon
function initCheckoutPage() {
    document.getElementById('placeOrderBtn')?.addEventListener('click', () => {
        let cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty! Please add items before placing an order.');
            window.location.href = 'shop.html';
            return;
        }
        let form = document.getElementById('checkoutForm');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }
        alert('Thank you! Your order has been placed successfully.');
        localStorage.removeItem('flawless_cart');
        window.location.href = 'index.html';
    });

    document.getElementById('checkoutCouponBtn')?.addEventListener('click', () => {
        let code = document.getElementById('checkoutCouponInput')?.value.trim();
        alert(code ? `Coupon "${code}" is not valid or has expired.` : 'Please enter a coupon code.');
    });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    initHomePage();
    initProductDetailPage();
    initShopPage();
    initProductTabs();
    initQtyInputs();
    initCheckoutPage();
});

// Sync Cart State Across Windows
window.addEventListener('pageshow', renderCart);
window.addEventListener('storage', renderCart);
