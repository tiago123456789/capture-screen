(function () {
    class ProccessService {

        makeVideoFromImages(datas, callback) {
            axios.post("http://localhost:3000/images-to-videos", datas).then(callback);
        }
    }

    class Screenshot {

        constructor() {
            this._id = uuid.v4();
            this._pageAccessed = location.href;
            this._frames = [];
            this._intervalTimeCaptureImage = 1000;
            this._intervalProccessRunning = null;
            this._processService = new ProccessService();
        }

        initialize() {
            this._cleanDatas();
            this._intervalProccessRunning = setInterval(() => {
                html2canvas(document.body, {
                    onrendered: (canvas) => {
                        this._frames.push({
                            img: canvas.toDataURL("image/png"),
                            createdAt: new Date().toISOString()
                        });
                    }
                })
            }, this._intervalTimeCaptureImage);
        }

        stop(callback) {
            clearInterval(this._intervalProccessRunning);
            this._processService.makeVideoFromImages({
                id: this._id, pageAccessed: this._pageAccessed, frames: this._frames
            }, callback);
        }

        _cleanDatas() {
            this._id = uuid.v4();
            this._pageAccessed = location.href;
            this._frames = [];
        }
    }


    function processCapturedImagesAfterTime() {
        const TIME_FINISH_CAPTURE_INITIAL_ANOTHER = 30000;
        let screenshot = new Screenshot();
        screenshot.initialize();

        setInterval(function () {
            screenshot.stop(() => { });
            screenshot.initialize();
        }, TIME_FINISH_CAPTURE_INITIAL_ANOTHER);
    };

    processCapturedImagesAfterTime();
})();