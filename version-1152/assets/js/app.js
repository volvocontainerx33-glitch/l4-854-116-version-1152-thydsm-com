(function () {
    var mobileButton = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
        });
    });

    var hero = document.querySelector('[data-hero-carousel]');
    var heroDots = document.querySelectorAll('[data-hero-dot]');

    if (hero && heroDots.length) {
        var slides = hero.querySelectorAll('.hero-slide');
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            heroDots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        heroDots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    var list = document.querySelector('.movie-list');
    var searchInput = document.querySelector('.local-search-input');
    var yearFilter = document.querySelector('.year-filter');
    var regionFilter = document.querySelector('.region-filter');

    if (list) {
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get('q') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }

        var applyFilters = function () {
            var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            list.querySelectorAll('.movie-card').forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matchedText = !text || haystack.indexOf(text) !== -1;
                var matchedYear = !year || cardYear === year;
                var matchedRegion = !region || cardRegion === region;
                card.classList.toggle('is-hidden-card', !(matchedText && matchedYear && matchedRegion));
            });
        };

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }
        if (regionFilter) {
            regionFilter.addEventListener('change', applyFilters);
        }
        applyFilters();
    }
})();

function initVideoPlayer(videoId, layerId, url) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !url) {
        return;
    }

    var start = function () {
        if (!loaded) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            video.setAttribute('controls', 'controls');
            loaded = true;
        }

        if (layer) {
            layer.classList.add('is-hidden');
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    if (layer) {
        layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
