document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('book-container');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');

    // Get the book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = parseInt(urlParams.get('id'));

    // Find the book data
    const book = booksData.find(b => b.id === bookId);

    if (!book) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                <h2>عذراً، الكتاب غير موجود</h2>
                <a href="books.html" class="btn btn-primary mt-3">العودة لصفحة الكتب</a>
            </div>
        `;
        return;
    }

    // Update breadcrumb
    breadcrumbTitle.textContent = book.title;

    // Build categories badges
    const badges = book.categories.map(cat => `
        <span class="badge rounded-pill px-3 py-2" style="background:var(--secondary-color);font-size:.9rem; margin-left: 5px;">${cat}</span>
    `).join('');

    // ─── Rating data (combine static + extra user ratings) ───
    const extraRatings = JSON.parse(localStorage.getItem('extraBookRatings') || '{}');
    const extra = extraRatings[book.id] || { total: 0, count: 0 };

    const baseCount = book.reviews || 0;
    const baseTotal = (book.rating || 0) * baseCount;

    const totalCount = baseCount + extra.count;
    const totalSum = baseTotal + extra.total;
    const averageRating = totalCount > 0 ? totalSum / totalCount : 0;
    const roundedAvg = Math.round(averageRating || 0);

    // Build stars based on current average
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= roundedAvg ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }

    // Dynamic HTML content
    const html = `
        <div class="book-details-card" data-aos="fade-up">
            <div class="row align-items-center g-5">
                <div class="col-md-4 text-center" data-aos="fade-left" data-aos-delay="100">
                    <img src="${book.image}" alt="${book.title}" class="book-cover img-fluid">
                    <div class="mt-4 d-flex justify-content-center gap-2 flex-wrap text-center w-100">
                        <button class="btn btn-cart flex-fill" id="detail-btn-cart" data-id="${book.id}"><i class="fas fa-shopping-cart me-2"></i>أضف للسلة</button>
                        <button class="btn btn-fav" id="detail-btn-fav" data-id="${book.id}" style="padding: 13px 25px;"><i class="far fa-heart"></i></button>
                    </div>
                    <div class="mt-3 text-center">
                        <button class="btn btn-success w-100 py-3 rounded-pill fw-bold pulse-animation" id="btn-read-book" data-id="${book.id}"><i class="fas fa-book-reader me-2"></i>قراءة الكتاب</button>
                    </div>
                </div>
                <div class="col-md-8" data-aos="fade-right" data-aos-delay="200">
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        ${badges}
                    </div>
                    <h1 class="book-title mb-2">${book.title}</h1>
                    <a href="#" class="book-author-link"><i class="fas fa-pen-nib me-2"></i>${book.author}</a>
                    <div class="d-flex align-items-center gap-2 my-3">
                        <span style="color:#ffc107;font-size:1.2rem;">
                            ${starsHtml}
                        </span>
                        <span class="text-muted" id="rating-summary">(${totalCount} تقييم، متوسط ${averageRating.toFixed(1)} من 5)</span>
                    </div>
                    <p class="text-muted" style="line-height:2;font-size:1.05rem;">
                        ${book.description}
                    </p>
                    <div class="price-box">
                        <span class="price-current">${book.price}</span>
                        ${book.oldPrice ? `<span class="price-old me-3 text-decoration-line-through">${book.oldPrice}</span>` : ''}
                        ${book.discount ? `<span class="badge bg-danger ms-2">خصم ${book.discount}</span>` : ''}
                    </div>
                    <div class="mt-4">
                        <h3 class="section-divider">التقييمات</h3>
                        <div class="mb-2">
                            <small class="text-muted">يمكنك تعديل تقييمك في أي وقت، وسيتم حفظه في هذا المتصفح فقط.</small>
                        </div>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span>قيّم هذا الكتاب:</span>
                            <div id="user-rating-stars" class="d-inline-flex" style="cursor:pointer; color:#ffc107; font-size:1.5rem;">
                                <i class="far fa-star" data-value="1"></i>
                                <i class="far fa-star" data-value="2"></i>
                                <i class="far fa-star" data-value="3"></i>
                                <i class="far fa-star" data-value="4"></i>
                                <i class="far fa-star" data-value="5"></i>
                            </div>
                            <button id="save-rating-btn" class="btn btn-sm btn-outline-primary rounded-pill px-3">حفظ التقييم</button>
                        </div>
                        <p id="user-rating-message" class="mt-2 mb-0 text-muted small"></p>
                    </div>
                    <div class="mt-4">
                        <div class="info-row"><span>الناشر</span><span>${book.publisher}</span></div>
                        <div class="info-row"><span>عدد الصفحات</span><span>${book.pages} صفحة</span></div>
                        <div class="info-row"><span>سنة النشر</span><span>${book.year}</span></div>
                        <div class="info-row"><span>اللغة</span><span>${book.language}</span></div>
                        <div class="info-row" style="border:none;"><span>رقم ISBN</span><span>${book.isbn}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Cart Button Logic
    const cartBtn = document.getElementById('detail-btn-cart');
    if (getQuantity(book.id) > 0) {
        cartBtn.innerHTML = '<i class="fas fa-check me-2"></i>مضاف للسلة';
        cartBtn.classList.add('btn-secondary');
        cartBtn.classList.remove('btn-cart');
    }

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (getQuantity(book.id) === 0) {
            addToCart(book.id);
            cartBtn.innerHTML = '<i class="fas fa-check me-2"></i>مضاف للسلة';
            cartBtn.classList.add('btn-secondary');
            cartBtn.classList.remove('btn-cart');
        } else {
            removeFromCart(book.id);
            cartBtn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>أضف للسلة';
            cartBtn.classList.add('btn-cart');
            cartBtn.classList.remove('btn-secondary');
        }
    });

    // Favorite Button Logic
    const favBtn = document.getElementById('detail-btn-fav');
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(book.id.toString())) {
        favBtn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
        favBtn.classList.add('border-danger');
    }

    favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        const idStr = book.id.toString();

        if (favs.includes(idStr)) {
            favs = favs.filter(i => i !== idStr);
            favBtn.innerHTML = '<i class="far fa-heart"></i>';
            favBtn.classList.remove('border-danger');
        } else {
            favs.push(idStr);
            favBtn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            favBtn.classList.add('border-danger');
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
    });

    // Read Book Button Logic
    const readBtn = document.getElementById('btn-read-book');
    readBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openReader(book);
    });

    // Auto open read model if 'read' param is true
    if (urlParams.get('read') === 'true') {
        setTimeout(() => openReader(book), 500);
    }

    // ─── User Rating Logic ───
    const starsContainer = document.getElementById('user-rating-stars');
    const saveRatingBtn = document.getElementById('save-rating-btn');
    const userMsg = document.getElementById('user-rating-message');
    const ratingSummary = document.getElementById('rating-summary');

    const userRatings = JSON.parse(localStorage.getItem('userBookRatings') || '{}');
    let selectedRating = userRatings[book.id] || 0;

    function renderUserStars(hoverValue = 0) {
        const current = hoverValue || selectedRating;
        starsContainer.querySelectorAll('i').forEach(star => {
            const value = parseInt(star.getAttribute('data-value'));
            if (current >= value) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Initial render for user stars
    renderUserStars();
    if (selectedRating) {
        userMsg.textContent = `تقييمك الحالي: ${selectedRating} من 5 نجوم`;
    }

    starsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('i[data-value]')) {
            selectedRating = parseInt(target.getAttribute('data-value'));
            renderUserStars();
        }
    });

    starsContainer.addEventListener('mousemove', (e) => {
        const target = e.target;
        if (target.matches('i[data-value]')) {
            const hoverVal = parseInt(target.getAttribute('data-value'));
            renderUserStars(hoverVal);
        }
    });

    starsContainer.addEventListener('mouseleave', () => {
        renderUserStars();
    });

    saveRatingBtn.addEventListener('click', () => {
        if (!selectedRating) {
            userMsg.textContent = 'من فضلك اختر عدد النجوم أولاً.';
            return;
        }

        const extraRatingsAll = JSON.parse(localStorage.getItem('extraBookRatings') || '{}');
        const currentExtra = extraRatingsAll[book.id] || { total: 0, count: 0 };

        const previousUserRating = userRatings[book.id] || 0;

        if (previousUserRating) {
            // تعديل تقييم قديم لنفس المستخدم
            currentExtra.total = (currentExtra.total || 0) - previousUserRating + selectedRating;
        } else {
            // إضافة تقييم جديد
            currentExtra.total = (currentExtra.total || 0) + selectedRating;
            currentExtra.count = (currentExtra.count || 0) + 1;
        }

        extraRatingsAll[book.id] = currentExtra;
        localStorage.setItem('extraBookRatings', JSON.stringify(extraRatingsAll));

        userRatings[book.id] = selectedRating;
        localStorage.setItem('userBookRatings', JSON.stringify(userRatings));

        // تحديث الملخص العام
        const newTotalCount = baseCount + currentExtra.count;
        const newTotalSum = baseTotal + currentExtra.total;
        const newAvg = newTotalCount > 0 ? newTotalSum / newTotalCount : 0;

        ratingSummary.textContent = `(${newTotalCount} تقييم، متوسط ${newAvg.toFixed(1)} من 5)`;

        // تحديث النجوم العامة أعلى التقييم
        let newStarsHtml = '';
        const newRounded = Math.round(newAvg || 0);
        for (let i = 1; i <= 5; i++) {
            newStarsHtml += i <= newRounded ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }
        // استبدال النجوم في نفس العنصر
        const starsWrapper = ratingSummary.previousElementSibling;
        if (starsWrapper) {
            starsWrapper.innerHTML = newStarsHtml;
        }

        userMsg.textContent = `تم حفظ تقييمك: ${selectedRating} من 5 نجوم`;
    });
});

let currentFontSize = 1.3;
let currentTheme = 'light';

function openReader(book) {
    const overlay = document.getElementById('reader-overlay');
    const content = document.getElementById('reader-text-content');

    document.getElementById('reader-title').textContent = 'جاري القراءة: ' + book.title;
    document.getElementById('reader-page-title').textContent = book.title;
    document.getElementById('reader-page-author').textContent = 'بقلم: ' + book.author;

    // Generate some "realistic" dummy content based on book description
    let dummyText = '';
    const paragraphs = [
        book.description,
        "في هذا فصل، نغوص في أعماق الشخصيات ونستكشف الدوافع الخفية وراء تصرفاتهم. تتشابك الخيوط الدرامية لتشكل لوحة فنية تعكس واقع الحياة بتفاصيلها الدقيقة.",
        "تمضي الساعات والكلمات ترسم مسارات جديدة في مخيلة القارئ. لم يكن الطريق سهلاً، لكن الإرادة كانت أقوى من كل العقبات التي واجهت البطل في رحلته نحو الحقيقة.",
        "تحت ظلال الأشجار الوارفة، جلس يبحث عن إجابات لأسئلة طالما أرقت مضجعه. هل كان الحب كافياً؟ أم أن القدر كان يخبئ فصلاً آخر لم يكن في الحسبان؟",
        "تتوالى الأحداث وتتصاعد حدة الصراع، حيث يجد الإنسان نفسه أمام خيارات صعبة تحدد مسار مستقبله. في كل زاوية من زوايا هذا الكتاب، ستجد جزءاً من الحكاية التي لم تُروَ بعد.",
        "إن البحث عن المعرفة هو رحلة لا تنتهي، وهذا الكتاب هو بمثابة رفيق درب لكل من يسعى لفهم الذات والعالم من حوله. بكلمات بسيطة وعميقة، يفتح لنا المؤلف آفاقاً جديدة للتفكير."
    ];

    for (let i = 0; i < 15; i++) {
        dummyText += `<p>${paragraphs[i % paragraphs.length]}</p>`;
    }

    content.innerHTML = dummyText;

    // Apply default theme (Sepia/Beige)
    setTheme(currentTheme);

    // Smooth transition
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Update progress bar on scroll
    const readerBody = document.getElementById('reader-body');
    readerBody.onscroll = () => {
        const winScroll = readerBody.scrollTop;
        const height = readerBody.scrollHeight - readerBody.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('reader-progress').style.width = scrolled + "%";
    };
}

function toggleReader() {
    const overlay = document.getElementById('reader-overlay');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 500);

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('active');
}

function setTheme(theme) {
    const overlay = document.getElementById('reader-overlay');
    const contentWrapper = document.getElementById('reader-content-wrapper');

    overlay.classList.remove('reader-theme-light', 'reader-theme-sepia', 'reader-theme-dark');
    overlay.classList.add('reader-theme-' + theme);

    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.theme-' + theme).classList.add('active');

    currentTheme = theme;
}

function changeFontSize(delta) {
    currentFontSize += delta;
    if (currentFontSize < 0.8) currentFontSize = 0.8;
    if (currentFontSize > 2.5) currentFontSize = 2.5;

    document.getElementById('reader-text-content').style.fontSize = currentFontSize + 'rem';
    document.getElementById('font-size-val').textContent = Math.round(currentFontSize / 1.3 * 100) + '%';
}

function setFontFamily(family) {
    document.getElementById('reader-content-wrapper').style.fontFamily = family;
}

function resetSettings() {
    setTheme('light');
    currentFontSize = 1.3;
    changeFontSize(0);
    setFontFamily("'Cairo', sans-serif");
    document.querySelector('select').value = "'Cairo', sans-serif";
}

function toggleFullscreen() {
    const reader = document.getElementById('reader-overlay');
    if (!document.fullscreenElement) {
        reader.requestFullscreen().catch(err => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'خطأ في ملء الشاشة',
                    text: err.message,
                    icon: 'error',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: 'var(--primary-color)'
                });
            } else {
                alert(`خطأ في تفعيل ملء الشاشة: ${err.message}`);
            }
        });

    } else {
        document.exitFullscreen();
    }
}

// Navigation place holders
function nextPage() {
    const readerBody = document.getElementById('reader-body');
    readerBody.scrollBy(0, readerBody.clientHeight * 0.8);
}

function prevPage() {
    const readerBody = document.getElementById('reader-body');
    readerBody.scrollBy(0, -readerBody.clientHeight * 0.8);
}

// Reading mode toggle (hide UI when mouse is idle)
let idleTimer;
document.addEventListener('mousemove', () => {
    const overlay = document.getElementById('reader-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    overlay.classList.remove('reading-mode');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        overlay.classList.add('reading-mode');
    }, 4000);
});