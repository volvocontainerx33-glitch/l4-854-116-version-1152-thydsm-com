(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"card-poster\" href=\"./" + escapeHtml(movie.file) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-pill\">播放</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<a class=\"card-title\" href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            restart();
        }

        var layer = document.querySelector("[data-search-layer]");
        var results = document.querySelector("[data-search-results]");
        var close = document.querySelector("[data-search-close]");
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var movies = window.movieIndex || [];

        function openSearch(query) {
            var text = String(query || "").trim().toLowerCase();
            if (!layer || !results || !text) {
                return;
            }
            var found = movies.filter(function (movie) {
                return [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(text) !== -1;
            }).slice(0, 36);
            results.innerHTML = found.length ? found.map(movieCard).join("") : "<div class=\"empty-state\">没有找到匹配影片，可尝试更换片名、地区或类型关键词。</div>";
            layer.hidden = false;
            document.body.style.overflow = "hidden";
        }

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                openSearch(input ? input.value : "");
            });
        });

        if (close && layer) {
            close.addEventListener("click", function () {
                layer.hidden = true;
                document.body.style.overflow = "";
            });
            layer.addEventListener("click", function (event) {
                if (event.target === layer) {
                    layer.hidden = true;
                    document.body.style.overflow = "";
                }
            });
        }

        var filterBar = document.querySelector("[data-filter-bar]");
        if (filterBar) {
            var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value");
                    buttons.forEach(function (btn) {
                        btn.classList.toggle("active", btn === button);
                    });
                    cards.forEach(function (item) {
                        var type = item.getAttribute("data-type") || "";
                        item.style.display = value === "全部" || type.indexOf(value) !== -1 ? "" : "none";
                    });
                });
            });
        }
    });
}());
