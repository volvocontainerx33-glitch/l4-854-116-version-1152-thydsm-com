import { H as Hls } from './hls-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const initMobileMenu = () => {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
};

const initHero = () => {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
};

const initFilters = () => {
  const list = document.querySelector('[data-movie-list]');

  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('[data-movie-card]'));
  const search = document.querySelector('[data-movie-search]');
  const region = document.querySelector('[data-filter-region]');
  const type = document.querySelector('[data-filter-type]');
  const year = document.querySelector('[data-filter-year]');
  const counter = document.querySelector('[data-result-count]');

  const apply = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const selectedRegion = region?.value || '';
    const selectedType = type?.value || '';
    const selectedYear = year?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const text = card.dataset.search || '';
      const matchesQuery = !query || text.includes(query);
      const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
      const matchesType = !selectedType || card.dataset.type === selectedType;
      const matchesYear = !selectedYear || card.dataset.year === selectedYear;
      const matches = matchesQuery && matchesRegion && matchesType && matchesYear;

      card.style.display = matches ? '' : 'none';

      if (matches) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = `${visible} 部影片`;
    }
  };

  search?.addEventListener('input', apply);
  region?.addEventListener('change', apply);
  type?.addEventListener('change', apply);
  year?.addEventListener('change', apply);

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (query && search) {
    search.value = query;
  }

  apply();
};

const initPlayers = () => {
  const buttons = Array.from(document.querySelectorAll('[data-play-button]'));

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const targetId = button.dataset.target;
      const src = button.dataset.src;
      const card = button.closest('[data-player-card]');
      const status = card?.querySelector('[data-player-status]');
      const video = targetId ? document.getElementById(targetId) : null;

      if (!video || !src) {
        if (status) {
          status.textContent = '播放源未找到。';
        }
        return;
      }

      button.classList.add('hidden');

      if (status) {
        status.textContent = '正在加载播放源...';
      }

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          await video.play();
          if (status) {
            status.textContent = '正在播放。';
          }
          return;
        }

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            try {
              await video.play();
              if (status) {
                status.textContent = '正在播放。';
              }
            } catch (error) {
              if (status) {
                status.textContent = '浏览器阻止自动播放，请点击播放器继续。';
              }
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (status && data?.fatal) {
              status.textContent = '播放加载异常，请刷新后重试。';
            }
          });
        } else {
          video.src = src;
          await video.play();
          if (status) {
            status.textContent = '正在播放。';
          }
        }
      } catch (error) {
        button.classList.remove('hidden');
        if (status) {
          status.textContent = '播放初始化失败，请检查网络或播放源。';
        }
      }
    });
  });
};

ready(() => {
  initMobileMenu();
  initHero();
  initFilters();
  initPlayers();
});
