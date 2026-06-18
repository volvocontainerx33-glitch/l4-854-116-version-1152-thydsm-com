(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function prepare(video, url) {
        if (!video || !url) {
            return null;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return hls;
        }
        video.src = url;
        return null;
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var url = video ? video.getAttribute("data-video-url") : "";
            var hls = null;
            var started = false;

            function start() {
                if (!video) {
                    return;
                }
                if (!started) {
                    hls = prepare(video, url);
                    started = true;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
}());
