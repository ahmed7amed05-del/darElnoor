// auth.js
// Handles user authentication state

const auth = {
    // Check if user is logged in
    isLoggedIn: function () {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get current user info
    getUser: function () {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Login user
    login: function (email, password) {
        // Simple simulation: check if user exists in a "users" array in localStorage
        let users = JSON.parse(localStorage.getItem('users') || '[]');

        // Add demo user if none exist
        if (users.length === 0) {
            users.push({ fullname: 'مستخدم تجريبي', email: 'test@test.com', password: '123' });
            localStorage.setItem('users', JSON.stringify(users));
        }

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    },

    // Register user
    register: function (fullname, email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Add a demo user if empty
        if (users.length === 0) {
            users.push({ fullname: 'مستخدم تجريبي', email: 'test@test.com', password: '123' });
        }

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'البريد الإلكتروني مسجل بالفعل' };
        }

        const newUser = { fullname, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login after registration (optional, but let's follow user's flow)
        // User said: "يوديني لصفحه تسجيل الدخول لازم اعمل ايميل"
        // So we might redirect to login, or just log them in. 
        // Let's redirect to login for now as per their sign.html logic.

        return { success: true };
    },

    // Logout user
    logout: function () {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.reload();
    }
};

// Update UI based on auth state
function updateAuthUI() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (auth.isLoggedIn()) {
        const user = auth.getUser();
        // Replace "Login" and "New Account" with Account Dropdown
        navActions.innerHTML = `
            <a href="#" class="nav-icon position-relative" data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas" title="سلة المشتريات">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle"
                    style="font-size: 0.6rem; display: none;">0</span>
            </a>
            <div class="dropdown">
                <button class="btn btn-nav-primary dropdown-toggle d-flex align-items-center gap-2" type="button" id="accountDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="padding: 8px 20px;">
                    <i class="fas fa-user-circle fs-5"></i>
                    <span>حسابي</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" aria-labelledby="accountDropdown" style="border-radius: 15px; min-width: 220px; padding: 10px;">
                    <li class="px-3 py-2 mb-2 border-bottom">
                        <p class="mb-0 fw-bold text-primary">${user.fullname}</p>
                        <small class="text-muted">${user.email}</small>
                    </li>
                    <li><a class="dropdown-item rounded-3 py-2 mb-1" href="#" onclick="showAccountData()"><i class="fas fa-id-card ms-2"></i> بيانات الحساب</a></li>
                    <li><a class="dropdown-item rounded-3 py-2 mb-1" href="#" onclick="showSettings()"><i class="fas fa-cog ms-2"></i> الإعدادات</a></li>
                    <li>
                        <label class="dropdown-item rounded-3 py-2 mb-1 d-flex justify-content-between align-items-center" onclick="event.stopPropagation();" style="cursor: pointer;">
                            <span><i class="fas fa-moon ms-2"></i> وضع دارك مود</span>
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" id="darkModeToggle" ${document.body.classList.contains('dark-theme') ? 'checked' : ''} onchange="toggleDarkMode()">
                            </div>
                        </label>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item rounded-3 py-2 text-danger" href="#" onclick="auth.logout()"><i class="fas fa-sign-out-alt ms-2"></i> تسجيل خروج</a></li>
                </ul>
            </div>
        `;
        // Re-run updateCartBadge because we just replaced the innerHTML
        if (typeof updateCartBadge === 'function') updateCartBadge();
    }
}

// Dark Mode Toggle Logic
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', isDark);

    // Sync the checkbox state if it exists
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = isDark;
}

// Apply Dark Mode on load
(function applyInitialTheme() {
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-theme');
    }
})();

// Helper Functions for Modals
function showAccountData() {
    const user = auth.getUser();
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '📅 بيانات الحساب',
            html: `
                <div class="text-start">
                    <p class="mb-2"><strong>الاسم:</strong> ${user.fullname}</p>
                    <p class="mb-2"><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                    <p class="mb-0"><strong>تاريخ الانضمام:</strong> 2025</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'حسناً',
            confirmButtonColor: 'var(--primary-color)'
        });
    } else {
        alert(`📅 بيانات الحساب:\n\nالاسم: ${user.fullname}\nالبريد الإلكتروني: ${user.email}\nتاريخ الانضمام: 2025`);
    }
}

function showSettings() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '⚙️ الإعدادات',
            text: 'الإعدادات قيد التطوير حالياً في هذه النسخة التجريبية.',
            icon: 'warning',
            confirmButtonText: 'فهمت',
            confirmButtonColor: 'var(--primary-color)'
        });
    } else {
        alert('⚙️ الإعدادات قيد التطوير حالياً في هذه النسخة التجريبية.');
    }
}


// Smooth scrolling for anchor links (like #about)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hash && link.hash === '#about' && window.location.pathname.includes('home.html' || window.location.pathname === '/')) {
        const target = document.querySelector(link.hash);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});
