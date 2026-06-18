(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function (form) {
        var scope = form.getAttribute('data-filter-scope') || document;
        var root = scope === 'document' ? document : document.querySelector(scope);
        var cards = root ? Array.prototype.slice.call(root.querySelectorAll('[data-title]')) : [];
        var keywordInput = form.querySelector('[data-filter-keyword]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var countEl = document.querySelector(form.getAttribute('data-filter-count') || '');
        var emptyEl = document.querySelector(form.getAttribute('data-filter-empty') || '');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var visible = matchesKeyword && matchesYear && matchesType;

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (countEl) {
                countEl.textContent = '当前显示 ' + visibleCount + ' 部影片';
            }

            if (emptyEl) {
                emptyEl.classList.toggle('show', visibleCount === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        [keywordInput, yearSelect, typeSelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && keywordInput) {
            keywordInput.value = q;
        }

        applyFilter();
    });
})();
