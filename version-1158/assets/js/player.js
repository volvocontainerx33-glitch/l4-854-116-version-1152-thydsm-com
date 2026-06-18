(function () {
  function initPlayer(playerId, streamUrl) {
    var root = document.getElementById(playerId);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var playLayer = root.querySelector(".play-layer");
    var playButton = root.querySelector(".play-toggle");
    var muteButton = root.querySelector(".mute-toggle");
    var fullButton = root.querySelector(".full-toggle");
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded || !video) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function setPlayingLabel() {
      if (!playButton || !video) {
        return;
      }
      playButton.textContent = video.paused ? "播放" : "暂停";
    }

    function beginPlay() {
      if (!video) {
        return;
      }

      loadStream();

      if (playLayer) {
        playLayer.classList.add("hidden");
      }

      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (playLayer) {
            playLayer.classList.remove("hidden");
          }
        });
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }

      if (video.paused) {
        beginPlay();
      } else {
        video.pause();
      }
    }

    if (playLayer) {
      playLayer.addEventListener("click", beginPlay);
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    if (video) {
      video.addEventListener("play", setPlayingLabel);
      video.addEventListener("pause", setPlayingLabel);
      video.addEventListener("click", function () {
        if (loaded) {
          togglePlay();
        }
      });
    }

    if (muteButton && video) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullButton && video) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;
})();
