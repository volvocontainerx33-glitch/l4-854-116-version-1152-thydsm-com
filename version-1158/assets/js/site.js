(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".quick-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var query = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 6200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var empty = document.querySelector("[data-no-results]");

    if (input && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      var state = {
        year: "all",
        region: "all"
      };

      if (query) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var term = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var year = card.getAttribute("data-year") || "";
          var region = card.getAttribute("data-region") || "";
          var matchedTerm = !term || haystack.indexOf(term) !== -1;
          var matchedYear = state.year === "all" || year === state.year;
          var matchedRegion = state.region === "all" || region === state.region;
          var matched = matchedTerm && matchedYear && matchedRegion;

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilters);

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var type = chip.getAttribute("data-filter-type");
          var value = chip.getAttribute("data-filter-value") || "all";

          if (type === "all") {
            state.year = "all";
            state.region = "all";
            chips.forEach(function (item) {
              item.classList.toggle("active", item === chip);
            });
          } else {
            state[type] = state[type] === value ? "all" : value;
            chips.forEach(function (item) {
              var itemType = item.getAttribute("data-filter-type");
              var itemValue = item.getAttribute("data-filter-value") || "all";
              var active = itemType === type && state[type] === itemValue;
              item.classList.toggle("active", active);
              if (itemType === "all") {
                item.classList.toggle("active", state.year === "all" && state.region === "all");
              }
            });
          }

          applyFilters();
        });
      });

      applyFilters();
    }
  });
})();
