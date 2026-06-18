let hlsConstructorPromise = null;

function getHlsConstructor() {
    if (!hlsConstructorPromise) {
        hlsConstructorPromise = import("./hls-vendor-dru42stk.js").then((module) => module.H);
    }
    return hlsConstructorPromise;
}

function setupMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", () => {
        panel.classList.toggle("is-open");
    });
}

function setupHeroCarousel() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
        return;
    }

    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            activate(index);
            start();
        });
    });

    const hero = document.querySelector(".hero");
    if (hero) {
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
    }

    activate(0);
    start();
}

function setupCategoryTools() {
    const grid = document.querySelector("[data-card-grid]");
    const filterInput = document.querySelector("[data-filter-input]");
    const sortButtons = Array.from(document.querySelectorAll("[data-sort]"));

    if (!grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    const applyFilter = () => {
        const query = filterInput ? filterInput.value.trim().toLowerCase() : "";

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(" ").toLowerCase();

            card.style.display = !query || haystack.includes(query) ? "" : "none";
        });
    };

    const applySort = (mode) => {
        const sortedCards = [...cards].sort((a, b) => {
            if (mode === "year") {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }

            if (mode === "title") {
                return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
            }

            return 0;
        });

        sortedCards.forEach((card) => grid.appendChild(card));

        sortButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.sort === mode);
        });

        applyFilter();
    };

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }

    sortButtons.forEach((button) => {
        button.addEventListener("click", () => applySort(button.dataset.sort || "default"));
    });
}

function movieCardHtml(movie, prefix) {
    const tags = (movie.tags || []).slice(0, 3).join(" ");
    const safe = (value) => String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    return `
        <article class="movie-card" data-title="${safe(movie.title)}" data-year="${safe(movie.year)}" data-region="${safe(movie.region)}" data-genre="${safe(movie.genreRaw)}" data-tags="${safe(tags)}">
            <a href="${prefix}movies/${safe(movie.id)}.html" class="movie-card-link">
                <div class="poster-wrap">
                    <img src="${prefix}${safe(movie.coverNum)}.jpg" alt="${safe(movie.title)}" loading="lazy" onerror="this.classList.add('image-missing')">
                    <span class="pill region-pill">${safe(movie.region)}</span>
                    <span class="pill year-pill">${safe(movie.year)}</span>
                    <span class="play-float">▶</span>
                </div>
                <div class="movie-card-body">
                    <h3>${safe(movie.title)}</h3>
                    <p class="card-genre">${safe(movie.genreRaw)}</p>
                    <p class="card-line">${safe(movie.oneLine)}</p>
                </div>
            </a>
        </article>
    `;
}

function setupSearchPage() {
    const resultBox = document.querySelector("[data-search-results]");
    const titleBox = document.querySelector("[data-search-title]");

    if (!resultBox || !window.MOVIE_DATA) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const prefix = resultBox.dataset.prefix || "";

    if (titleBox) {
        titleBox.textContent = query ? `搜索：${query}` : "影片搜索";
    }

    if (!query) {
        resultBox.innerHTML = `<div class="empty-state">输入片名、类型、地区或标签后即可搜索全站影片。</div>`;
        return;
    }

    const lowerQuery = query.toLowerCase();
    const results = window.MOVIE_DATA.filter((movie) => {
        const haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genreRaw,
            (movie.tags || []).join(" "),
            movie.oneLine,
            movie.categoryName
        ].join(" ").toLowerCase();

        return haystack.includes(lowerQuery);
    });

    if (!results.length) {
        resultBox.innerHTML = `<div class="empty-state">没有找到与“${query}”匹配的影片，请尝试更短的关键词。</div>`;
        return;
    }

    resultBox.innerHTML = results
        .slice(0, 240)
        .map((movie) => movieCardHtml(movie, prefix))
        .join("");

    const note = document.querySelector("[data-search-note]");
    if (note) {
        note.textContent = `共找到 ${results.length} 部影片，当前展示前 ${Math.min(results.length, 240)} 部。`;
    }
}

async function attachHls(video, sourceUrl, status) {
    if (!sourceUrl) {
        if (status) {
            status.textContent = "当前影片暂未绑定播放源。";
        }
        return false;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return true;
    }

    const Hls = await getHlsConstructor();

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (status) {
                status.textContent = "播放源已加载，可以开始观看。";
            }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
            }

            if (status) {
                status.textContent = "播放源加载失败，请稍后重试。";
            }

            hls.destroy();
        });

        video._hlsInstance = hls;
        return true;
    }

    if (status) {
        status.textContent = "当前浏览器不支持 HLS 播放。";
    }

    return false;
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach((wrapper) => {
        const video = wrapper.querySelector("video");
        const overlay = wrapper.querySelector("[data-play-overlay]");
        const button = wrapper.querySelector("[data-play-button]");
        const status = wrapper.querySelector("[data-player-status]");
        const sourceUrl = wrapper.dataset.src;
        let initialized = false;

        const startPlayback = async () => {
            if (!video) {
                return;
            }

            if (!initialized) {
                initialized = await attachHls(video, sourceUrl, status);
            }

            if (initialized) {
                video.controls = true;

                try {
                    await video.play();
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                } catch (error) {
                    if (status) {
                        status.textContent = "浏览器阻止了自动播放，请再次点击播放按钮。";
                    }
                }
            }
        };

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", () => {
                if (!initialized || video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupHeroCarousel();
    setupCategoryTools();
    setupSearchPage();
    setupPlayers();
});
