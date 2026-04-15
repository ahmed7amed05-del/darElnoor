// cart.js
// Handles all cart operations using LocalStorage

// Helper to get cart from localStorage
function getCart() {
    let cart = localStorage.getItem('cart');
    if (!cart) return [];
    try {
        let parsed = JSON.parse(cart);
        // Migration: If it was array of strings, convert to objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
            parsed = parsed.map(id => ({ id: id.toString(), qty: 1 }));
            localStorage.setItem('cart', JSON.stringify(parsed));
        }
        return parsed;
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function addToCart(id) {
    let cart = getCart();
    let item = cart.find(i => i.id == id);
    if (item) {
        item.qty += 1;
    } else {
        cart.push({ id: id.toString(), qty: 1 });
    }
    saveCart(cart);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id != id);
    saveCart(cart);
}

function updateQuantity(id, qty) {
    let cart = getCart();
    let item = cart.find(i => i.id == id);
    if (item) {
        if (qty <= 0) {
            cart = cart.filter(i => i.id != id);
        } else {
            item.qty = qty;
        }
        saveCart(cart);
    }
}

function getQuantity(id) {
    let cart = getCart();
    let item = cart.find(i => i.id == id);
    return item ? item.qty : 0;
}

function getTotalItems() {
    let cart = getCart();
    return cart.reduce((total, item) => total + item.qty, 0);
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    let totalItems = getTotalItems();
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';

        // Remove old position classes and use standard Bootstrap relative positioning on the parent wrapper if needed
        // Assuming navbar icon is relative and this badge has position-absolute
    });
}

function renderCart() {
    const listBody = document.getElementById('cart-items-list');
    const totalElement = document.getElementById('cart-total-price');
    if (!listBody) return;

    let cart = getCart();

    if (cart.length === 0) {
        listBody.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-shopping-basket fa-3x mb-3"></i><p>السلة فارغة حاليا</p></div>';
        if (totalElement) totalElement.textContent = '0 جنيه';
        return;
    }

    // Check if booksData is loaded
    if (typeof booksData === 'undefined') {
        listBody.innerHTML = '<p class="text-error">حدث خطأ في تحميل البيانات</p>';
        return;
    }

    let html = '';
    let totalPrice = 0;

    cart.forEach(item => {
        let book = booksData.find(b => b.id == item.id);
        if (book) {
            let priceNum = parseInt(book.price.replace(/[^0-9]/g, ''));
            let itemTotal = priceNum * item.qty;
            totalPrice += itemTotal;

            html += `
                <div class="cart-item d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img src="${book.image}" alt="${book.title}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 5px;" class="me-3">
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-1">${book.title}</h6>
                        <div class="text-muted small mb-2">${book.price}</div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0 ms-2" onclick="updateQuantity('${item.id}', ${item.qty - 1})">-</button>
                            <span class="qty px-2">${item.qty}</span>
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0 me-2" onclick="updateQuantity('${item.id}', ${item.qty + 1})">+</button>
                        </div>
                    </div>
                    <div class="ms-auto text-end">
                        <div class="fw-bold mb-2">${itemTotal} جنيه</div>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }
    });

    listBody.innerHTML = html;
    if (totalElement) totalElement.textContent = totalPrice + ' جنيه';
}

// Custom trigger so things inside logic logic scripts can re-bind or know cart initialized
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart(); // If on a page with cart offcanvas open by default or just ready

    // Setup checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'السلة فارغة!',
                        text: 'يجب إضافة بعض الكتب إلى السلة أولاً.',
                        icon: 'warning',
                        confirmButtonText: 'اذهب للتسوق',
                        confirmButtonColor: 'var(--primary-color)'
                    });
                } else {
                    alert('سلة المشتريات فارغة!');
                }
                return;
            }

            if (typeof auth !== 'undefined' && !auth.isLoggedIn()) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'تحتاج لتسجيل الدخول',
                        text: 'يجب تسجيل الدخول أولاً لإتمام عملية الشراء',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'تسجيل الدخول',
                        cancelButtonText: 'إلغاء',
                        confirmButtonColor: 'var(--primary-color)',
                        cancelButtonColor: '#aaa'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.setItem('redirectAfterLogin', 'cart');
                            window.location.href = 'login.html';
                        }
                    });
                } else {
                    alert('يجب تسجيل الدخول أولاً لإتمام عملية الشراء');
                    localStorage.setItem('redirectAfterLogin', 'cart');
                    window.location.href = 'login.html';
                }
                return;
            }


            // If logged in, proceed to checkout
            window.location.href = 'checkout.html';
        });
    }
});
