export function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.url;
    var started = false;
    var hlsInstance = null;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (started) {
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attachSource();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('click', function () {
        if (!started) {
            play();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
