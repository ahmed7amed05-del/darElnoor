// books-logic.js – Dynamic rendering, category tabs, search & filtering
document.addEventListener('DOMContentLoaded', () => {

    // ─── Category Definitions ───
    const categories = [
        { key: 'all', label: 'الكل', icon: '📖', color: '#d4af37' },
        { key: 'روايات', label: 'الروايات', icon: '📚', color: '#e74c3c' },
        { key: 'كتب دينية', label: 'الكتب الدينية', icon: '🕋', color: '#27ae60' },
        { key: 'تنمية بشرية', label: 'تنمية بشرية', icon: '🎯', color: '#f39c12' },
        { key: 'تاريخ', label: 'التاريخ', icon: '⏳', color: '#8e44ad' },
        { key: 'علوم', label: 'العلوم', icon: '🧠', color: '#2980b9' },
        { key: 'أدب وشعر', label: 'الأدب والشعر', icon: '✒️', color: '#e67e22' }
    ];

    let activeCategory = 'all';

    // ─── DOM References ───
    const categoryTabsContainer = document.getElementById('category-tabs');
    const booksGrid = document.getElementById('books-grid');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const priceSelect = document.getElementById('price-select');
    const searchBtn = document.getElementById('search-btn');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    // ─── Generate Stars HTML ───
    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        return stars;
    }

    // ─── Create Book Card HTML ───
    function createBookCard(book, delay) {
        return `
        <div class="col-6 col-md-6 col-lg-3 book-item" data-aos="fade-up" data-aos-delay="${delay}" data-categories='${JSON.stringify(book.categories)}'>
            <div class="card book-card">
                <div class="book-img-wrapper">
                    ${book.discount ? `<div class="book-badge">خصم ${book.discount}</div>` : ''}
                    <img src="${book.image}" alt="${book.title}" loading="lazy">
                    <div class="book-overlay">
                        <a href="book-detail.html?id=${book.id}" class="overlay-btn"><i class="fas fa-eye"></i> معاينة</a>
                    </div>
                </div>
                <div class="book-info">
                    <div>
                        <h5>${book.title}</h5>
                        <p class="author"><i class="fas fa-pen-nib me-1"></i>${book.author}</p>
                        <div class="stars">${generateStars(book.rating)}</div>
                        <div class="price-row">
                            <span class="price">${book.price}</span>
                            ${book.oldPrice ? `<span class="old-price">${book.oldPrice}</span>` : ''}
                        </div>
                    </div>
                    <div class="action-buttons d-flex justify-content-between mt-3 mb-2 gap-2">
                        <button class="btn btn-sm btn-outline-primary flex-fill btn-add-cart" data-id="${book.id}" title="أضف للسلة" style="border-radius: 8px;"><i class="fas fa-shopping-cart"></i></button>
                        <button class="btn btn-sm btn-outline-danger flex-fill btn-favorite" data-id="${book.id}" title="أضف للمفضلة" style="border-radius: 8px;"><i class="far fa-heart"></i></button>
                        <button class="btn btn-sm btn-outline-success flex-fill btn-read" data-id="${book.id}" title="قراءة الكتاب" style="border-radius: 8px;"><i class="fas fa-book-reader"></i></button>
                    </div>
                    <a href="book-detail.html?id=${book.id}" class="btn btn-custom w-100">عرض التفاصيل</a>
                </div>
            </div>
        </div>`;
    }

    // ─── Attach Card Buttons ───
    function attachCardButtons() {
        // Add to Cart
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;

                if (getQuantity(id) === 0) {
                    addToCart(id);
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-primary');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                    }, 1500);
                } else {
                    removeFromCart(id);
                    btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-primary');
                }
            });

            // Initial state
            const id = btn.dataset.id;
            if (getQuantity(id) > 0) {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-primary');
            }
        });

        // Favorite
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;
                let fav = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (fav.includes(id)) {
                    fav = fav.filter(i => i !== id);
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                    btn.classList.remove('btn-danger');
                    btn.classList.add('btn-outline-danger');
                } else {
                    fav.push(id);
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                    btn.classList.remove('btn-outline-danger');
                    btn.classList.add('btn-danger');
                }
                localStorage.setItem('favorites', JSON.stringify(fav));
            });

            // Initial state
            const id = btn.dataset.id;
            let fav = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (fav.includes(id)) {
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                btn.classList.remove('btn-outline-danger');
                btn.classList.add('btn-danger');
            }
        });

        // Read Book
        document.querySelectorAll('.btn-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;
                window.location.href = `book-detail.html?id=${id}&read=true`;
            });
        });
    }

    // ─── Render Category Tabs ───
    function renderCategoryTabs() {
        if (!categoryTabsContainer) return;
        let html = '';
        categories.forEach(cat => {
            const count = cat.key === 'all'
                ? booksData.length
                : booksData.filter(b => b.categories.includes(cat.key)).length;
            html += `
            <button class="category-tab ${cat.key === activeCategory ? 'active' : ''}" 
                    data-category="${cat.key}" 
                    style="--tab-color: ${cat.color}">
                <span class="tab-icon">${cat.icon}</span>
                <span class="tab-label">${cat.label}</span>
                <span class="tab-count">${count}</span>
            </button>`;
        });
        categoryTabsContainer.innerHTML = html;

        // Attach click events
        categoryTabsContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeCategory = tab.dataset.category;
                // Sync the select dropdown too
                if (categorySelect) {
                    categorySelect.value = activeCategory === 'all' ? 'جميع الفئات' : activeCategory;
                }
                renderCategoryTabs();
                filterAndRender();
            });
        });
    }

    // ─── Filter & Render Books ───
    function filterAndRender() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedCat = activeCategory;
        const selectedPrice = priceSelect ? priceSelect.value : 'الكل';

        let filtered = booksData.filter(book => {
            // Search: title or author
            const matchesSearch = !searchTerm ||
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm);

            // Category
            const matchesCat = selectedCat === 'all' || book.categories.includes(selectedCat);

            // Price
            const priceNum = parseInt(book.price.replace(/[^0-9]/g, ''));
            let matchesPrice = true;
            if (selectedPrice === 'أقل من 50 جنيه') matchesPrice = priceNum < 50;
            else if (selectedPrice === '50 - 100 جنيه') matchesPrice = priceNum >= 50 && priceNum <= 100;
            else if (selectedPrice === 'أكثر من 100 جنيه') matchesPrice = priceNum > 100;

            return matchesSearch && matchesCat && matchesPrice;
        });

        // Render
        if (!booksGrid) return;

        if (filtered.length === 0) {
            booksGrid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
        } else {
            if (noResults) noResults.style.display = 'none';
            let html = '';
            filtered.forEach((book, i) => {
                html += createBookCard(book, (i % 8) * 50);
            });
            booksGrid.innerHTML = html;
            attachCardButtons();
        }

        // Update count
        if (resultsCount) {
            resultsCount.textContent = `عرض ${filtered.length} من ${booksData.length} كتاب`;
        }

        // Re-init AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    }

    // ─── Event Listeners ───
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterAndRender();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
        // Enter key search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterAndRender();
            }
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            const val = categorySelect.value;
            activeCategory = val === 'جميع الفئات' ? 'all' : val;
            renderCategoryTabs();
            filterAndRender();
        });
    }

    if (priceSelect) {
        priceSelect.addEventListener('change', filterAndRender);
    }

    // ─── Hero Search Bar (home page) ───
    const heroSearchInput = document.querySelector('.hero .search-box input');
    const heroSearchBtn = document.querySelector('.hero .search-box .btn');
    if (heroSearchInput && heroSearchBtn) {
        heroSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = heroSearchInput.value.trim();
            if (query) {
                window.location.href = `books.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'books.html';
            }
        });
        heroSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                heroSearchBtn.click();
            }
        });
    }

    // ─── Handle URL search parameter ───
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
    }
    const catQuery = urlParams.get('category');
    if (catQuery) {
        activeCategory = catQuery;
        if (categorySelect) {
            categorySelect.value = catQuery === 'all' ? 'جميع الفئات' : catQuery;
        }
    }

    // ─── Category Cards on Home Page ───
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => {
            const text = card.querySelector('h3').textContent.trim();
            let catKey = '';
            if (text.includes('الروايات')) catKey = 'روايات';
            else if (text.includes('الكتب الدينية')) catKey = 'كتب دينية';
            else if (text.includes('تنمية بشرية')) catKey = 'تنمية بشرية';
            else if (text.includes('التاريخ')) catKey = 'تاريخ';
            else if (text.includes('العلوم')) catKey = 'علوم';
            else if (text.includes('الأدب والشعر')) catKey = 'أدب وشعر';

            if (catKey) {
                window.location.href = `books.html?category=${encodeURIComponent(catKey)}`;
            }
        });
    });

    // ─── Initialize ───
    renderCategoryTabs();
    filterAndRender();
});
