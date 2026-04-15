// about.js – builds the “About Site” content dynamically
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('about-content');

    // Data object for the About page
    const siteInfo = {
        title: 'عن مكتبة دار النور',
        subtitle: 'نور المعرفة بين يديك',
        description: 'مكتبة دار النور هي منصة إلكترونية رائدة تهدف إلى نشر الثقافة والقراءة في العالم العربي. نحن نؤمن بأن الكتاب هو خير جليس، وأن الوصول إلى المعرفة يجب أن يكون سهلاً ومتاحاً للجميع.',
        mission: 'توفير تجربة تسوق فريدة ومميزة لمحبي القراءة، وتقديم تشكيلة واسعة من الكتب في مختلف المجالات بأفضل الأسعار.',
        vision: 'أن نكون المكتبة الإلكترونية الأولى والخيار المفضل للقراء في المنطقة العربية، والمساهمة الفعالة في بناء مجتمع قارئ ومثقف.',
        values: [
            { icon: 'fas fa-book-open', title: 'تنوع المحتوى', text: 'نحرص على توفير كتب في مختلف التصنيفات العلمية، الأدبية، والتاريخية.' },
            { icon: 'fas fa-shield-alt', title: 'الأمان والموثوقية', text: 'نضمن لعملائنا تجربة تسوق آمنة وحماية كاملة لبياناتهم.' },
            { icon: 'fas fa-shipping-fast', title: 'سرعة التوصيل', text: 'نعمل جاهدين لتوصيل مشترياتكم في أسرع وقت ممكن وبكل عناية.' },
            { icon: 'fas fa-headset', title: 'دعم متواصل', text: 'فريقنا متاح دائماً للإجابة على استفساراتكم ومساعدتكم في اختيار الأنسب.' }
        ],
        stats: [
            { label: 'كتاب متوفر', value: '+5,000' },
            { label: 'قارئ سعيد', value: '+10,000' },
            { label: 'دار نشر', value: '+200' },
            { label: 'سنة من الخبرة', value: '10' }
        ]
    };

    // Build the sections
    let html = `
        <div class="row mb-5">
            <div class="col-lg-6">
                <h1 class="section-divider mb-4">${siteInfo.title}</h1>
                <h4 class="text-secondary mb-3">${siteInfo.subtitle}</h4>
                <p class="text-muted fs-5" style="line-height: 1.8;">${siteInfo.description}</p>
            </div>
            <div class="col-lg-6 text-center mt-4 mt-lg-0">
                <img src="BOKS/pexels-stasknop-1340588.jpg" alt="About Dar Noor" class="img-fluid rounded-4 shadow-lg" style="max-height: 400px; object-fit: cover;">
            </div>
        </div>

        <div class="row g-4 mb-5">
            <div class="col-md-6">
                <div class="p-4 rounded-4 bg-light h-100 shadow-sm">
                    <h3 class="fw-bold mb-3"><i class="fas fa-bullseye me-2 text-primary"></i>رسالتنا</h3>
                    <p class="text-muted mb-0">${siteInfo.mission}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-4 rounded-4 bg-light h-100 shadow-sm">
                    <h3 class="fw-bold mb-3"><i class="fas fa-eye me-2 text-primary"></i>رؤيتنا</h3>
                    <p class="text-muted mb-0">${siteInfo.vision}</p>
                </div>
            </div>
        </div>

        <h2 class="section-divider text-center mb-5">قيمنا الجوهرية</h2>
        <div class="row g-4 mb-5">
            ${siteInfo.values.map(val => `
                <div class="col-md-6 col-lg-3">
                    <div class="text-center p-4 border rounded-4 hover-shadow transition-all h-100">
                        <i class="${val.icon} fa-3x mb-3 text-secondary"></i>
                        <h5 class="fw-bold">${val.title}</h5>
                        <p class="text-muted small">${val.text}</p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="row g-4 mb-5 text-center">
            ${siteInfo.stats.map(stat => `
                <div class="col-6 col-md-3">
                    <div class="p-3">
                        <h2 class="fw-bold text-primary mb-0">${stat.value}</h2>
                        <span class="text-muted">${stat.label}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
});
