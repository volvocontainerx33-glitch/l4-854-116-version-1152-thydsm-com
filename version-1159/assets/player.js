(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (frame) {
    var video = frame.querySelector('video');
    var startButton = frame.querySelector('[data-play-button]');
    var playToggle = frame.querySelector('[data-play-toggle]');
    var muteToggle = frame.querySelector('[data-mute-toggle]');
    var fullscreenButton = frame.querySelector('[data-fullscreen]');
    var stream = frame.getAttribute('data-stream');
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          frame.classList.add('is-playing');
        }).catch(function () {
          frame.classList.remove('is-playing');
        });
      } else {
        frame.classList.add('is-playing');
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    if (playToggle) {
      playToggle.addEventListener('click', toggleVideo);
    }

    video.addEventListener('click', toggleVideo);

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
      if (playToggle) {
        playToggle.textContent = '暂停';
      }
    });

    video.addEventListener('pause', function () {
      if (playToggle) {
        playToggle.textContent = '播放';
      }
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('is-playing');
      if (playToggle) {
        playToggle.textContent = '播放';
      }
    });

    if (muteToggle) {
      muteToggle.addEventListener('click', function () {
        video.muted = !video.muted;
        muteToggle.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (frame.requestFullscreen) {
          frame.requestFullscreen();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
