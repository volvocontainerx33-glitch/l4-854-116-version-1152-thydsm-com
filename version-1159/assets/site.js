(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showHero(dotIndex);
      });
    });

    setInterval(function () {
      showHero(current + 1);
    }, 6000);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    var panel = input.closest('.search-panel') || document;
    var scope = panel.parentElement || document;
    var list = scope.querySelector('[data-movie-list]') || document.querySelector('[data-movie-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
    var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var empty = scope.querySelector('[data-no-result]');
    var activeFilter = '';

    function updateCards() {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var visible = matchKeyword && matchFilter;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    input.addEventListener('input', updateCards);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter-value') || '';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        updateCards();
      });
    });
  });
})();
