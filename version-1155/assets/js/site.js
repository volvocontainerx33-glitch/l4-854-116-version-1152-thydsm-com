(function() {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function() {
            const isOpen = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let activeSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function() {
            setSlide(activeSlide + 1);
        }, 5200);
    }

    const filterInput = document.querySelector(".page-filter-input");
    const sortSelect = document.querySelector(".page-sort");
    const filterGrid = document.querySelector(".filter-grid");
    const emptyState = document.querySelector(".empty-state");

    function visibleText(card) {
        return [
            card.dataset.title || "",
            card.dataset.year || "",
            card.dataset.region || "",
            card.dataset.category || "",
            card.dataset.genre || ""
        ].join(" ").toLowerCase();
    }

    function applyFilter() {
        if (!filterGrid) {
            return;
        }

        const cards = Array.from(filterGrid.querySelectorAll(".movie-card"));
        const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
        let shown = 0;

        cards.forEach(function(card) {
            const match = !query || visibleText(card).includes(query);
            card.style.display = match ? "" : "none";
            if (match) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = shown ? "none" : "block";
        }
    }

    function applySort() {
        if (!filterGrid || !sortSelect) {
            return;
        }

        const cards = Array.from(filterGrid.querySelectorAll(".movie-card"));
        const mode = sortSelect.value;

        cards.sort(function(a, b) {
            if (mode === "year-desc") {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }

            if (mode === "year-asc") {
                return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
            }

            if (mode === "title") {
                return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
            }

            return 0;
        });

        cards.forEach(function(card) {
            filterGrid.appendChild(card);
        });
        applyFilter();
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", applySort);
    }

    const searchResults = document.getElementById("searchResults");
    const searchInput = document.getElementById("searchInput");
    const searchTitle = document.getElementById("searchTitle");
    const searchEmpty = document.getElementById("searchEmpty");

    function createSearchCard(movie) {
        const article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            '<a href="' + movie.file + '">',
            '<figure class="movie-poster">',
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '" loading="lazy">',
            '<span class="poster-badge badge-primary">' + movie.region + '</span>',
            '<span class="poster-badge badge-dark">' + movie.year + '</span>',
            '<span class="poster-play">▶</span>',
            '</figure>',
            '<div class="movie-card-body">',
            '<h3>' + movie.title + '</h3>',
            '<div class="movie-meta"><span>' + movie.category + '</span><span>' + movie.genre + '</span></div>',
            '<p>' + movie.oneLine + '</p>',
            '</div>',
            '</a>'
        ].join("");
        return article;
    }

    function renderSearch() {
        if (!searchResults || !window.SITE_MOVIES) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || "").trim();
        if (searchInput) {
            searchInput.value = query;
        }

        const lowered = query.toLowerCase();
        const matches = window.SITE_MOVIES.filter(function(movie) {
            const haystack = [movie.title, movie.year, movie.region, movie.category, movie.genre, movie.tags].join(" ").toLowerCase();
            return !lowered || haystack.includes(lowered);
        });

        if (searchTitle) {
            searchTitle.textContent = query ? "搜索结果：" + query : "全部可搜索影片";
        }

        searchResults.innerHTML = "";
        matches.slice(0, 240).forEach(function(movie) {
            searchResults.appendChild(createSearchCard(movie));
        });

        if (searchEmpty) {
            searchEmpty.style.display = matches.length ? "none" : "block";
        }
    }

    renderSearch();
})();
