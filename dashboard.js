// dashboard.js – Ratings & books analytics dashboard

document.addEventListener('DOMContentLoaded', () => {
    if (typeof booksData === 'undefined') return;

    const totalBooksEl = document.getElementById('total-books');
    const totalRatingsEl = document.getElementById('total-ratings');
    const globalAvgEl = document.getElementById('global-avg');
    const topBooksBody = document.getElementById('top-books-body');
    const topBooksCount = document.getElementById('top-books-count');
    const categoryStatsBody = document.getElementById('category-stats-body');
    const recentRatedBody = document.getElementById('recent-rated-body');

    const extraRatingsAll = JSON.parse(localStorage.getItem('extraBookRatings') || '{}');
    const userRatings = JSON.parse(localStorage.getItem('userBookRatings') || '{}');

    // Helper: aggregate rating for a single book
    function getAggregatedRating(book) {
        const baseCount = book.reviews || 0;
        const baseTotal = (book.rating || 0) * baseCount;

        const extra = extraRatingsAll[book.id] || { total: 0, count: 0 };
        const totalCount = baseCount + (extra.count || 0);
        const totalSum = baseTotal + (extra.total || 0);

        const avg = totalCount > 0 ? totalSum / totalCount : 0;
        return { avg, count: totalCount, sum: totalSum };
    }

    // Overall stats
    const totalBooks = booksData.length;
    let allRatingsCount = 0;
    let allRatingsSum = 0;

    const booksWithStats = booksData.map(b => {
        const stats = getAggregatedRating(b);
        allRatingsCount += stats.count;
        allRatingsSum += stats.sum;
        return { book: b, ...stats };
    });

    const globalAvg = allRatingsCount > 0 ? allRatingsSum / allRatingsCount : 0;

    totalBooksEl.textContent = totalBooks.toString();
    totalRatingsEl.textContent = allRatingsCount.toString();
    globalAvgEl.textContent = globalAvg > 0 ? `${globalAvg.toFixed(2)} من 5` : '-';

    // Top rated books (by average, then by count)
    const topBooks = booksWithStats
        .filter(b => b.count > 0)
        .sort((a, b) => {
            if (b.avg !== a.avg) return b.avg - a.avg;
            return b.count - a.count;
        })
        .slice(0, 5);

    topBooksCount.textContent = `${topBooks.length} كتاب`;

    if (topBooks.length === 0) {
        topBooksBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">لا توجد تقييمات كافية لعرض أفضل الكتب.</td>
            </tr>
        `;
    } else {
        topBooksBody.innerHTML = topBooks.map(item => {
            const { book, avg, count } = item;
            const mainCategory = (book.categories && book.categories[0]) || '-';
            return `
                <tr>
                    <td>
                        <a href="book-detail.html?id=${book.id}" class="text-decoration-none fw-bold">
                            ${book.title}
                        </a>
                    </td>
                    <td>${book.author}</td>
                    <td>${mainCategory}</td>
                    <td>
                        <span class="fw-bold">${avg.toFixed(2)}</span>
                        <span class="text-warning ms-1"><i class="fas fa-star"></i></span>
                    </td>
                    <td>${count}</td>
                </tr>
            `;
        }).join('');
    }

    // Category stats
    const categoryMap = {};
    booksWithStats.forEach(item => {
        const { book, avg, count } = item;
        (book.categories || []).forEach(cat => {
            if (!categoryMap[cat]) {
                categoryMap[cat] = { books: 0, totalCount: 0, totalSum: 0 };
            }
            categoryMap[cat].books += 1;
            categoryMap[cat].totalCount += count;
            categoryMap[cat].totalSum += avg * count;
        });
    });

    const categoryEntries = Object.entries(categoryMap).sort((a, b) => {
        // Sort by total ratings count desc
        return b[1].totalCount - a[1].totalCount;
    });

    if (categoryEntries.length === 0) {
        categoryStatsBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-3">لا توجد بيانات بعد</td>
            </tr>
        `;
    } else {
        categoryStatsBody.innerHTML = categoryEntries.map(([cat, data]) => {
            const avgCat = data.totalCount > 0 ? data.totalSum / data.totalCount : 0;
            return `
                <tr>
                    <td>${cat}</td>
                    <td>${data.books}</td>
                    <td>${avgCat > 0 ? avgCat.toFixed(2) + ' من 5' : '-'}</td>
                </tr>
            `;
        }).join('');
    }

    // Recent / user rated books (local to this browser)
    const ratedIds = Object.keys(userRatings);
    if (ratedIds.length === 0) {
        recentRatedBody.innerHTML = `
            <li class="list-group-item text-center text-muted py-3">
                لم تقم بتقييم أي كتاب بعد.
            </li>
        `;
    } else {
        // No timestamp, so just show first up to 6 items
        const limitedIds = ratedIds.slice(0, 6);
        recentRatedBody.innerHTML = limitedIds.map(idStr => {
            const id = parseInt(idStr, 10);
            const book = booksData.find(b => b.id === id);
            if (!book) return '';
            const userRating = userRatings[id] || 0;
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="text-end">
                        <div class="fw-bold">
                            <a href="book-detail.html?id=${book.id}" class="text-decoration-none">
                                ${book.title}
                            </a>
                        </div>
                        <small class="text-muted">${book.author}</small>
                    </div>
                    <div class="text-start" style="color:#ffc107;">
                        ${'★'.repeat(userRating)}${'☆'.repeat(5 - userRating)}
                    </div>
                </li>
            `;
        }).join('');
    }
});

