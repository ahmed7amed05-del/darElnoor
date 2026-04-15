// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (typeof auth !== 'undefined') {
                const success = auth.login(email, password);
                if (success) {
                    Swal.fire({
                        title: 'مرحباً بك!',
                        text: 'تم تسجيل الدخول بنجاح!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        timerProgressBar: true
                    }).then(() => {
                        // Check if we need to redirect back to cart
                        const redirect = localStorage.getItem('redirectAfterLogin');
                        if (redirect === 'cart') {
                            localStorage.removeItem('redirectAfterLogin');
                            window.location.href = 'home.html';
                        } else {
                            window.location.href = 'home.html';
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'خطأ!',
                        text: 'خطأ في البريد الإلكتروني أو كلمة المرور!',
                        icon: 'error',
                        confirmButtonText: 'حاول مرة أخرى',
                        confirmButtonColor: 'var(--primary-color)'
                    });
                }

            }
        });
    }
});
