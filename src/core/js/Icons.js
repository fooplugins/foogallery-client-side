(function($, _, _utils, _is, _obj){

    _.Icons = _utils.Class.extend({
        construct: function(){
            this.className = "fg-icon";
            this.registered = {
                "default": {
                    "close": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M13.957 3.457l-1.414-1.414-4.543 4.543-4.543-4.543-1.414 1.414 4.543 4.543-4.543 4.543 1.414 1.414 4.543-4.543 4.543 4.543 1.414-1.414-4.543-4.543z"></path></svg>',
                    "arrow-left": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M10.5 16l1.5-1.5-6.5-6.5 6.5-6.5-1.5-1.5-8 8 8 8z"></path></svg>',
                    "arrow-right": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M5.5 0l-1.5 1.5 6.5 6.5-6.5 6.5 1.5 1.5 8-8-8-8z"></path></svg>',
                    "maximize": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 2v4h-2v-5c0-0.552 0.448-1 1-1h14c0.552 0 1 0.448 1 1v14c0 0.552-0.448 1-1 1h-14c-0.552 0-1-0.448-1-1v-9h9c0.552 0 1 0.448 1 1v7h4v-12h-12z"/></svg>',
                    "expand": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 5h-2v-4c0-0.552 0.448-1 1-1h4v2h-3v3z"></path><path d="M16 5h-2v-3h-3v-2h4c0.552 0 1 0.448 1 1v4z"></path><path d="M15 16h-4v-2h3v-3h2v4c0 0.552-0.448 1-1 1z"></path><path d="M5 16h-4c-0.552 0-1-0.448-1-1v-4h2v3h3v2z"></path></svg>',
                    "shrink": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 0h2v4c0 0.552-0.448 1-1 1h-4v-2h3v-3z"></path><path d="M11 0h2v3h3v2h-4c-0.552 0-1-0.448-1-1v-4z"></path><path d="M12 11h4v2h-3v3h-2v-4c0-0.552 0.448-1 1-1z"></path><path d="M0 11h4c0.552 0 1 0.448 1 1v4h-2v-3h-3v-2z"></path></svg>',
                    "info": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M7 4.75c0-0.412 0.338-0.75 0.75-0.75h0.5c0.412 0 0.75 0.338 0.75 0.75v0.5c0 0.412-0.338 0.75-0.75 0.75h-0.5c-0.412 0-0.75-0.338-0.75-0.75v-0.5z"></path><path d="M10 12h-4v-1h1v-3h-1v-1h3v4h1z"></path><path d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zM8 14.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"></path></svg>',
                    "comment": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1h-10zM3 6h8v1h-8zM3 8h4v1h-4zM14.5 1h-13c-0.825 0-1.5 0.675-1.5 1.5v8c0 0.825 0.675 1.5 1.5 1.5h2.5v4l4.8-4h5.7c0.825 0 1.5-0.675 1.5-1.5v-8c0-0.825-0.675-1.5-1.5-1.5zM14 10h-5.924l-3.076 2.73v-2.73h-3v-7h12v7z"></path></svg>',
                    "thumbs": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 3v10h-2v-11c0-0.552 0.448-1 1-1h12c0.552 0 1 0.448 1 1v12c0 0.552-0.448 1-1 1h-12c-0.552 0-1-0.448-1-1v-1h4v-2h-2v-2h2v-2h-2v-2h2v-2h2v10h6v-10h-10z"></path></svg>',
                    "cart": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M13.238 9c0.55 0 1.124-0.433 1.275-0.962l1.451-5.077c0.151-0.529-0.175-0.962-0.725-0.962h-10.238c0-1.105-0.895-2-2-2h-3v2h3v8.5c0 0.828 0.672 1.5 1.5 1.5h9.5c0.552 0 1-0.448 1-1s-0.448-1-1-1h-9v-1h8.238zM5 4h9.044l-0.857 3h-8.187v-3z"></path><path d="M6 14.5c0 0.828-0.672 1.5-1.5 1.5s-1.5-0.672-1.5-1.5c0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5z"></path><path d="M15 14.5c0 0.828-0.672 1.5-1.5 1.5s-1.5-0.672-1.5-1.5c0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5z"></path></svg>',
                    "circle-close": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zM8 14.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"></path><path d="M10.5 4l-2.5 2.5-2.5-2.5-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 2.5-2.5 2.5 2.5 1.5-1.5-2.5-2.5 2.5-2.5z"></path></svg>',
                    "auto-progress": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path class="[ICON_CLASS]-idle" d="M11.39 8c2.152-1.365 3.61-3.988 3.61-7 0-0.339-0.019-0.672-0.054-1h-13.891c-0.036 0.328-0.054 0.661-0.054 1 0 3.012 1.457 5.635 3.609 7-2.152 1.365-3.609 3.988-3.609 7 0 0.339 0.019 0.672 0.054 1h13.891c0.036-0.328 0.054-0.661 0.054-1 0-3.012-1.457-5.635-3.609-7zM2.5 15c0-2.921 1.253-5.397 3.5-6.214v-1.572c-2.247-0.817-3.5-3.294-3.5-6.214v0h11c0 2.921-1.253 5.397-3.5 6.214v1.572c2.247 0.817 3.5 3.294 3.5 6.214h-11zM9.462 10.462c-1.12-0.635-1.181-1.459-1.182-1.959v-1.004c0-0.5 0.059-1.327 1.184-1.963 0.602-0.349 1.122-0.88 1.516-1.537h-6.4c0.395 0.657 0.916 1.188 1.518 1.538 1.12 0.635 1.181 1.459 1.182 1.959v1.004c0 0.5-0.059 1.327-1.184 1.963-1.135 0.659-1.98 1.964-2.236 3.537h7.839c-0.256-1.574-1.102-2.879-2.238-3.538z"/><circle class="[ICON_CLASS]-circle" r="4" cx="8" cy="8"/><path class="[ICON_CLASS]-play" d="M3 2l10 6-10 6z"/><path class="[ICON_CLASS]-pause" d="M2 2h5v12h-5zM9 2h5v12h-5z"/></svg>',
                    "search": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M16 13.5l-4.695-4.695c0.444-0.837 0.695-1.792 0.695-2.805 0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.013 0 1.968-0.252 2.805-0.695l4.695 4.695 2.5-2.5zM2 6c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4z"></path></svg>',
                    "exif-aperture": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M 8,0 C 3.5876443,0 0,3.5876443 0,8 c 0,4.412356 3.5876443,8 8,8 4.412356,0 8,-3.587644 8,-8 C 16,3.5876443 12.412356,0 8,0 Z m 0,1 c 3.871916,0 7,3.1280844 7,7 0,3.871916 -3.128084,7 -7,7 C 4.1280844,15 1,11.871916 1,8 1,4.1280844 4.1280844,1 8,1 Z M 7.53125,2.0214844 A 6,6 0 0 0 3.1835938,4.4335938 H 8.9257812 Z M 8.6132812,2.03125 C 9.5587451,3.6702105 10.504247,5.3091484 11.451172,6.9472656 L 12.863281,4.5 A 6,6 0 0 0 8.6132812,2.03125 Z M 2.5957031,5.4101562 A 6,6 0 0 0 2,8 6,6 0 0 0 2.5273438,10.439453 L 5.4296875,5.4101562 Z m 10.8261719,0.033203 -2.855469,4.9433598 h 2.935547 A 6,6 0 0 0 14,8 6,6 0 0 0 13.421875,5.4433592 Z M 4.5722656,8.8945312 3.0996094,11.449219 a 6,6 0 0 0 4.40625,2.527343 z m 2.5820313,2.4707028 1.4960937,2.591797 a 6,6 0 0 0 4.3144534,-2.591797 z"></path></svg>',
                    "exif-camera": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="m 8.0000002,5 a 4,4 0 0 0 -4,4 4,4 0 0 0 4,4 A 4,4 0 0 0 12,9 4,4 0 0 0 8.0000002,5 Z m 0.019531,1.015625 a 3,2.9814477 0 0 1 2.9804688,3 l -1,-0.00586 a 2,2 0 0 0 0,-0.00976 2,2 0 0 0 -1.9863279,-2 z M 5.125,1 C 4.5,1 4,1.5 4,2.125 V 3.0000004 L 1.125,3 C 0.5,2.9999999 0,3.5 0,4.125 v 9.75 C 0,14.5 0.5,15 1.125,15 h 13.75 C 15.5,15 16,14.5 16,13.875 V 4.125 C 16,3.5 15.5,3 14.875,3 H 12 V 2.125 C 12,1.5 11.5,1 10.875,1 Z M 5.25,2.0000004 h 5.5 c 0.125,0 0.25,0.1249996 0.25,0.25 v 1.75 h 3.75 c 0.125,0 0.25,0.1249996 0.25,0.25 V 13.75 C 15,13.875 14.875,14 14.75,14 H 1.25 C 1.125,14 1,13.875 1,13.75 V 4.25 C 1,4.125 1.125,4 1.25,4 l 3.75,4e-7 v -1.75 c 0,-0.1250004 0.125,-0.25 0.25,-0.25 z"></path></svg>',
                    "exif-created-timestamp": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M 3,1 V 2 H 1 V 15 H 16 V 2 H 14 V 1 H 13 V 2 H 4 V 1 Z M 2,4 H 15 V 14 H 2 Z M 6,5 V 7 H 8 V 5 Z m 3,0 v 2 h 2 V 5 Z m 3,0 v 2 h 2 V 5 Z M 3,8 v 2 H 5 V 8 Z m 3,0 v 2 H 8 V 8 Z m 3,0 v 2 h 2 V 8 Z m 3,0 v 2 h 2 V 8 Z m -9,3 v 2 h 2 v -2 z m 3,0 v 2 h 2 v -2 z m 3,0 v 2 h 2 v -2 z"></path></svg>',
                    "exif-shutter-speed": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M 8,0 C 3.5876443,0 -2.9415707e-8,3.5876443 0,8 c 2.3532563e-7,4.412356 3.5876445,8 8,8 4.412356,0 8,-3.587644 8,-8 C 16,3.5876443 12.412356,0 8,0 Z m 0,1 c 3.871916,0 7,3.1280844 7,7 0,3.871915 -3.128085,7 -7,7 -3.8719154,0 -6.9999998,-3.128085 -7,-7 -3e-8,-3.8719156 3.1280844,-7 7,-7 z M 11.646484,3.6464844 8.6445312,6.6484375 A 1.5,1.5 0 0 0 8,6.5 1.5,1.5 0 0 0 6.5,8 1.5,1.5 0 0 0 8,9.5 1.5,1.5 0 0 0 9.5,8 1.5,1.5 0 0 0 9.3515625,7.3554688 L 12.353516,4.3535156 Z M 2,7.5 v 1 h 2 v -1 z M 7.5,12 v 2 h 1 V 12 Z M 12,7.5 v 1 h 2 v -1 z M 7.5,2 v 2 h 1 V 2 Z"></path></svg>',
                    "exif-focal-length": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="m 1,4.125 -1,0.25 v 7.25 l 1,0.25 z M 5,1 2,4 v 8 l 3,3 h 6.875 C 12.500003,15 13,14.5 13,13.875 V 2.125 C 13,1.4999986 12.5,1 11.875,1 9.576807,0.99914375 7.1414067,0.96597644 5,1 Z M 5.5,2 H 6 V 14 H 5.5 L 3,11.5 v -7 z M 7,2 h 4.75 C 11.875,2 12,2.1249997 12,2.25 v 11.5 c 0,0.125 -0.125,0.250622 -0.25,0.25 H 7 Z m 7,0 c 1,2.2 1.5,4.35 1.5,6 0,1.65 -0.5,3.8 -1.5,6"></path></svg>',
                    "exif-iso": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M 7.5,0 V 1.6015625 C 6.0969201,1.7146076 4.8392502,2.256185 3.828125,3.1210938 L 2.6035156,1.8964844 1.8964844,2.6035156 3.1210938,3.828125 C 2.256185,4.8392502 1.7146076,6.0969201 1.6015625,7.5 H 0 v 1 h 1.6015625 c 0.1130451,1.4030799 0.6546225,2.66075 1.5195313,3.671875 l -1.2246094,1.224609 0.7070312,0.707032 1.2246094,-1.22461 C 4.8392502,13.743815 6.0969201,14.285392 7.5,14.398438 V 16 h 1 v -1.601562 c 1.4030799,-0.113046 2.66075,-0.654623 3.671875,-1.519532 l 1.224609,1.22461 0.707032,-0.707032 -1.22461,-1.224609 C 13.743815,11.16075 14.285392,9.9030799 14.398438,8.5 H 16 v -1 H 14.398438 C 14.285392,6.0969201 13.743815,4.8392502 12.878906,3.828125 L 14.103516,2.6035156 13.396484,1.8964844 12.171875,3.1210938 C 11.16075,2.256185 9.9030799,1.7146076 8.5,1.6015625 V 0 Z M 8,2.5 c 3.043488,0 5.5,2.4565116 5.5,5.5 0,3.043488 -2.456512,5.5 -5.5,5.5 C 4.9565116,13.5 2.5,11.043488 2.5,8 2.5,4.9565116 4.9565116,2.5 8,2.5 Z"></path></svg>',
                    "exif-orientation": '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M 1.25,0 C 0.625,0 0,0.625 0,1.25 V 5 H 1 V 3 h 8 v 2 h 1 V 1.25 C 10,0.625 9.375,0 8.75,0 Z m 0,1 h 7.5 C 8.875,1 9,1.125 9,1.25 V 2 H 1 V 1.25 C 1,1.125 1.125,1 1.25,1 Z m 0,5 C 0.625,6 0,6.625 0,7.25 v 7.5 C 0,15.375 0.625,16 1.25,16 h 13.5 C 15.375,16 16,15.375 16,14.75 V 7.25 C 16,6.625 15.375,6 14.75,6 Z m 0,1 H 2 v 3 H 1 V 7.25 C 1,7.125 1.125,7 1.25,7 Z M 3,7 h 10 v 8 H 3 Z m 11,0 h 0.75 C 14.875,7 15,7.125 15,7.25 v 7.5 C 15,14.875 14.875,15 14.75,15 H 14 Z M 1,12 h 1 v 3 H 1.25 C 1.125,15 1,14.875 1,14.75 Z"></path></svg>'
                }
            };
        },
        register: function(setName, icons){
            if (_is.empty(setName) || _is.empty(icons) || !_is.string(setName) || !_is.hash(icons)) return false;
            this.registered[setName] = _obj.extend({}, this.registered.default, icons);
            return true;
        },
        get: function(name, setNameOrObject){
            var self = this, setName = "default",
                icons = _obj.extend({}, self.registered.default);

            if (_is.string(setNameOrObject) && setNameOrObject !== "default"){
                setName = setNameOrObject;
                icons = _obj.extend(icons, self.registered[setNameOrObject]);
            } else if (_is.hash(setNameOrObject)){
                setName = "custom";
                icons = _obj.extend(icons, setNameOrObject);
            }

            var icon = _is.string(name) && icons.hasOwnProperty(name) ? icons[name].replace(/\[ICON_CLASS]/g, self.className + "-" + name) : null,
                classNames = [false, name, setName].map(function(val){
                    return val === false ? self.className : self.className + "-" + val;
                }).join(" ");

            return $(icon).addClass(classNames);
        },
        element: function(name, setNameOrObject){
            const self = this;

            let setName = "default",
                icons = _obj.extend({}, self.registered.default);

            if (_is.string(setNameOrObject) && setNameOrObject !== "default"){
                setName = setNameOrObject;
                icons = _obj.extend(icons, self.registered[setNameOrObject]);
            } else if (_is.hash(setNameOrObject)){
                setName = "custom";
                icons = _obj.extend(icons, setNameOrObject);
            }

            const iconString = _is.string(name) && icons.hasOwnProperty(name) ? icons[name].replace(/\[ICON_CLASS]/g, self.className + "-" + name) : null;
            if ( iconString !== null ){
                const fragment = document.createRange().createContextualFragment(iconString);
                const svg = fragment.querySelector("svg");
                if ( svg ){
                    ["", "-" + name, "-" + setName].forEach(function(suffix){
                        svg.classList.add(self.className + suffix);
                    });
                    return svg;
                }
            }
            return null;
        }
    });

    /**
     * @summary Icon manager for FooGallery.
     * @memberof FooGallery
     * @name icons
     * @type {FooGallery.Icons}
     */
    _.icons = new _.Icons();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj
);