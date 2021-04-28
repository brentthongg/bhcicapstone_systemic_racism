/* CODE TAKEN FROM: 
   https://github.com/jlongster/canvas-game-bootstrap/blob/master/js/resources.js */

class ResourceManager {

    constructor() {
        this.resourceCache = {};
        this.readyCallbacks = [];

        window.resources = { 
            load: this.load,
            _load: this._load,
            get: this.get,
            onReady: this.onReady,
            isReady: this.isReady,
            resourceCache: this.resourceCache,
            readyCallbacks: this.readyCallbacks,
        };
    }

    _load(url) {
        if ((url in this.resourceCache) && (this.resourceCache[url])) {
            return this.resourceCache[url];
        }
        else {
            var image = new Image();
            image.onload = () => {
                this.resourceCache[url] = image;
                
                if(this.isReady()) {
                    this.readyCallbacks.forEach((func) => { func(); });
                }
            };
            this.resourceCache[url] = false;
            image.src = url;
        }
    }
    
    // Load an image url or an array of image urls
    load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach((url) => { this._load(url); });
        }
        else {
            this._load(urlOrArr);
        }
    }

    

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        var ready = true;
        for (var k in this.resourceCache) {
            if (this.resourceCache.hasOwnProperty(k) &&
               !this.resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    onReady(func) {
        this.readyCallbacks.push(func);
    }
}