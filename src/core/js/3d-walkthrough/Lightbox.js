(function($, _, _is, _fn, _obj){
    if (!_ || !_.Item || !_.Panel || !_.Panel.Media || !_.Panel.media){
        return;
    }

    var DEFAULT_SETTINGS = {
        version: 2,
        tonemapping: "none",
        highPrecisionRendering: false,
        background: {
            color: [0, 0, 0]
        },
        postEffectSettings: {
            sharpness: { enabled: false, amount: 0 },
            bloom: { enabled: false, intensity: 1, blurLevel: 2 },
            grading: { enabled: false, brightness: 0, contrast: 1, saturation: 1, tint: [1, 1, 1] },
            vignette: { enabled: false, intensity: 0.5, inner: 0.3, outer: 0.75, curvature: 1 },
            fringing: { enabled: false, intensity: 0.5 }
        },
        animTracks: [],
        cameras: [],
        annotations: [],
        startMode: "default"
    };

    var splatItemDefaults = {
        splatUrl: "",
        splatViewerUrl: "",
        splatPosterUrl: "",
        splatSettingsUrl: "",
        splatSettingsData: null,
        splatConfig: null,
        splatMode: "",
        splatShowUI: true
    };

    var isVector3 = function(value){
        return _is.array(value) && value.length === 3 && value.every(function(entry){
            return _is.number(entry);
        });
    };

    var parseJSON = function(value){
        if (_is.hash(value) || _is.array(value)) return value;
        if (!_is.string(value) || value.length === 0) return null;
        try {
            return JSON.parse(value);
        } catch (err){
            return null;
        }
    };

    var splatParseJSON = function(value){
        if (_is.hash(value) || _is.array(value)) return value;
        if (!_is.string(value) || value.length === 0) return value;
        try {
            return JSON.parse(value);
        } catch (err){
            return value;
        }
    };

    var splatParseBoolean = function(value, fallback){
        if (_is.boolean(value)) return value;
        if (!_is.string(value)) return fallback;
        switch (value.toLowerCase()){
            case "1":
            case "true":
            case "yes":
            case "on":
                return true;
            case "0":
            case "false":
            case "no":
            case "off":
                return false;
        }
        return fallback;
    };

    var splatDataValue = function($el, data, keys, attrs){
        var i, value;
        if (_is.hash(data)){
            for (i = 0; i < keys.length; i++){
                value = data[keys[i]];
                if (!_is.empty(value)) return value;
            }
        }
        if ($el && $el.length){
            for (i = 0; i < attrs.length; i++){
                value = $el.attr(attrs[i]);
                if (!_is.empty(value)) return value;
            }
        }
        return null;
    };

    var encodeSettingsData = function(settings){
        if (!_is.hash(settings)) return "";
        var json = JSON.stringify(settings),
            binary = unescape(encodeURIComponent(json));
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    var getFirst = function(){
        for (var i = 0; i < arguments.length; i++){
            if (!_is.empty(arguments[i])) return arguments[i];
        }
        return null;
    };

    var getFlag = function(config, name, alternate){
        var value = getFirst(config[name], alternate ? config[alternate] : null);
        if (_is.boolean(value)) return value;
        if (_is.string(value)){
            return ["1", "true", "yes", "on"].indexOf(value.toLowerCase()) !== -1;
        }
        return false;
    };

    var createCamera = function(cameraConfig){
        if (!_is.hash(cameraConfig) || !isVector3(cameraConfig.position) || !isVector3(cameraConfig.target)){
            return null;
        }
        return {
            initial: {
                position: cameraConfig.position,
                target: cameraConfig.target,
                fov: _is.number(cameraConfig.fov) ? cameraConfig.fov : 60
            }
        };
    };

    var normalizeLegacySettings = function(settings){
        settings = _obj.extend({}, settings);
        if (!_is.hash(settings.background)){
            settings.background = { color: [0, 0, 0] };
        }
        if (!_is.array(settings.animTracks)){
            settings.animTracks = [];
        }
        return settings;
    };

    var normalizeSettings = function(settings, item, config){
        var cameraConfig;

        settings = _obj.extend({}, DEFAULT_SETTINGS, _is.hash(settings) ? settings : {});

        if (!_is.array(settings.cameras) || settings.cameras.length === 0){
            cameraConfig = getFirst(settings.camera, config.camera, config.initialCamera);
            settings.cameras = [];

            var camera = createCamera(cameraConfig);
            if (camera){
                settings.cameras.push(camera);
            }
        }

        settings.animTracks = _is.array(settings.animTracks) ? settings.animTracks : [];
        settings.annotations = _is.array(settings.annotations) ? settings.annotations : [];
        settings.startMode = getFirst(settings.startMode, item.splatMode, config.mode, DEFAULT_SETTINGS.startMode);

        cameraConfig = getFirst(settings.camera, config.camera, config.initialCamera);
        if (settings.animTracks.length > 0 && _is.hash(cameraConfig) && getFirst(cameraConfig.startAnim, cameraConfig.animTrack) === "animTrack"){
            settings.startMode = "animTrack";
        }

        return settings;
    };

    var createSettings = function(item, config){
        config = _is.hash(config) ? config : {};

        if (_is.hash(config.settings)){
            if (!_is.number(config.settings.version) && _is.hash(config.settings.camera)){
                return normalizeLegacySettings(config.settings);
            }
            return normalizeSettings(config.settings, item, config);
        }

        if (_is.number(config.version) && _is.array(config.cameras)){
            return normalizeSettings(config, item, config);
        }

        var initialCamera = _is.hash(config.initialCamera) ? config.initialCamera : {},
            settings = _obj.extend({}, DEFAULT_SETTINGS);

        if (_is.array(config.cameras)){
            settings.cameras = config.cameras;
        } else if (isVector3(initialCamera.position) && isVector3(initialCamera.target)){
            var camera = createCamera(initialCamera);
            settings.cameras = [camera];
        }

        settings.tonemapping = getFirst(config.tonemapping, settings.tonemapping);
        settings.highPrecisionRendering = !!getFirst(config.highPrecisionRendering, settings.highPrecisionRendering);
        settings.background = _is.hash(config.background) ? config.background : settings.background;
        settings.postEffectSettings = _is.hash(config.postEffectSettings) ? config.postEffectSettings : settings.postEffectSettings;
        settings.animTracks = _is.array(config.animTracks) ? config.animTracks : settings.animTracks;
        settings.annotations = _is.array(config.annotations) ? config.annotations : settings.annotations;
        settings.startMode = getFirst(config.startMode, item.splatMode, config.mode, settings.startMode);

        if (!settings.cameras.length && !_is.array(config.annotations) && !_is.array(config.animTracks)){
            return null;
        }

        return normalizeSettings(settings, item, config);
    };

    var setParam = function(url, name, value){
        if (!_is.empty(value)){
            url.searchParams.set(name, value);
        }
    };

    var setFlag = function(url, name, enabled){
        if (enabled){
            url.searchParams.set(name, "1");
        }
    };

    var applySplatDefaults = function(item){
        Object.keys(splatItemDefaults).forEach(function(key){
            var value = item.opt && !_is.undef(item.opt[key]) ? item.opt[key] : splatItemDefaults[key];
            if (_is.undef(item[key]) || item[key] === null || item[key] === ""){
                item[key] = value;
            }
        });
    };

    var parseSplatData = function(item){
        var data = item.$anchor.data() || {};
        item.splatUrl = splatDataValue(item.$anchor, data, ["splatUrl", "sceneUrl", "foogallery3dSceneUrl", "fg3dSceneUrl"], ["data-splat-url", "data-scene-url", "data-foogallery-3d-scene-url", "data-fg3d-scene-url"]) || item.splatUrl;
        item.splatViewerUrl = splatDataValue(item.$anchor, data, ["splatViewerUrl", "viewerUrl", "foogallery3dViewerUrl", "fg3dViewerUrl"], ["data-splat-viewer-url", "data-viewer-url", "data-foogallery-3d-viewer-url", "data-fg3d-viewer-url"]) || item.splatViewerUrl;
        item.splatPosterUrl = splatDataValue(item.$anchor, data, ["splatPosterUrl", "posterUrl", "foogallery3dPosterUrl", "fg3dPosterUrl"], ["data-splat-poster-url", "data-poster-url", "data-foogallery-3d-poster-url", "data-fg3d-poster-url"]) || item.splatPosterUrl;
        item.splatSettingsUrl = splatDataValue(item.$anchor, data, ["splatSettingsUrl", "settingsUrl", "foogallery3dSettingsUrl", "fg3dSettingsUrl"], ["data-splat-settings-url", "data-settings-url", "data-foogallery-3d-settings-url", "data-fg3d-settings-url"]) || item.splatSettingsUrl;
        item.splatSettingsData = splatParseJSON(splatDataValue(item.$anchor, data, ["splatSettingsData", "settingsData", "foogallery3dSettingsData", "fg3dSettingsData"], ["data-splat-settings-data", "data-settings-data", "data-foogallery-3d-settings-data", "data-fg3d-settings-data"]) || item.splatSettingsData);
        item.splatConfig = splatParseJSON(splatDataValue(item.$anchor, data, ["splatConfig", "sceneConfig", "foogallery3dConfig", "fg3dConfig"], ["data-splat-config", "data-scene-config", "data-foogallery-3d-config", "data-fg3d-config"]) || item.splatConfig);
        item.splatMode = splatDataValue(item.$anchor, data, ["splatMode", "mode", "foogallery3dMode", "fg3dMode"], ["data-splat-mode", "data-mode", "data-foogallery-3d-mode", "data-fg3d-mode"]) || item.splatMode;
        item.splatShowUI = splatParseBoolean(splatDataValue(item.$anchor, data, ["splatShowUI", "splatShowUi", "showUI", "showUi", "foogallery3dShowUi", "fg3dShowUi"], ["data-splat-show-ui", "data-show-ui", "data-foogallery-3d-show-ui", "data-fg3d-show-ui"]), item.splatShowUI);
    };

    var writeSplatData = function(item){
        if (!item.$anchor || !item.$anchor.length || !_is.fn(item._setAttributes)){
            return;
        }
        item._setAttributes(item.$anchor.get(0), {
            "data-splat-url": item.splatUrl,
            "data-splat-viewer-url": item.splatViewerUrl,
            "data-splat-poster-url": item.splatPosterUrl,
            "data-splat-settings-url": item.splatSettingsUrl,
            "data-splat-settings-data": item.splatSettingsData,
            "data-splat-config": item.splatConfig,
            "data-splat-mode": item.splatMode,
            "data-splat-show-ui": _is.boolean(item.splatShowUI) ? (item.splatShowUI ? "true" : "false") : item.splatShowUI
        });
    };

    _.template.configure("core", {
        item: splatItemDefaults
    }, {});

    _.Item.prototype.hasSplat = function(){
        return _is.string(this.splatUrl) && this.splatUrl.length > 0;
    };

    _.Item.override("construct", function(template, options){
        this._super(template, options);
        applySplatDefaults(this);
    });

    _.Item.override("doParseItem", function($el){
        var result = this._super($el);
        if (result){
            parseSplatData(this);
        }
        return result;
    });

    _.Item.override("doCreateItem", function(){
        var result = this._super();
        if (result){
            writeSplatData(this);
        }
        return result;
    });

    _.Item.override("toJSON", function(){
        var json = this._super();
        return _obj.extend(json, {
            splatUrl: this.splatUrl,
            splatViewerUrl: this.splatViewerUrl,
            splatPosterUrl: this.splatPosterUrl,
            splatSettingsUrl: this.splatSettingsUrl,
            splatSettingsData: this.splatSettingsData,
            splatConfig: this.splatConfig,
            splatMode: this.splatMode,
            splatShowUI: this.splatShowUI
        });
    });

    _.Panel.override("getMedia", function(item){
        if (!(item instanceof _.Item)) return null;

        var type = _is.fn(item.hasSplat) && item.hasSplat() && _.Panel.media.contains("splat") ? "splat" : item.type,
            id = item.id + ":" + type;

        if (this.__media.hasOwnProperty(id)) return this.__media[id];
        return this.__media[id] = _.Panel.media.make(type, this, item);
    });

    _.Panel.Splat = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.splat || {});
            _obj.extend(this.cls, panel.cls.splat || {});
            _obj.extend(this.sel, panel.sel.splat || {});
        },
        doCreateContent: function(){
            return $("<iframe/>").attr(this.opt.attrs);
        },
        getViewerUrl: function(){
            var self = this,
                config = parseJSON(self.item.splatConfig) || {},
                viewerUrl = getFirst(self.item.splatViewerUrl, self.opt.viewerUrl, self.item.href),
                sceneUrl = getFirst(self.item.splatUrl, config.splatUrl, config.sceneUrl, config.contentUrl),
                url = new URL(viewerUrl, window.location.href),
                settings = parseJSON(self.item.splatSettingsData) || createSettings(self.item, config);

            setParam(url, "content", sceneUrl);
            setParam(url, "poster", getFirst(self.item.splatPosterUrl, config.posterImage, config.posterUrl, self.item.src));
            setParam(url, "skybox", getFirst(config.skyboxUrl, config.skybox));
            setParam(url, "collision", getFirst(config.collisionUrl, config.collision, config.voxelUrl, config.voxel));
            setParam(url, "budget", config.budget);
            setParam(url, "mode", getFirst(self.item.splatMode, config.mode));

            if (_is.string(self.item.splatSettingsUrl) && self.item.splatSettingsUrl.length > 0){
                setParam(url, "settings", self.item.splatSettingsUrl);
            } else if (_is.string(config.settingsUrl) && config.settingsUrl.length > 0){
                setParam(url, "settings", config.settingsUrl);
            } else if (_is.hash(settings)){
                setParam(url, "settingsData", encodeSettingsData(settings));
            }

            setFlag(url, "webgpu", getFlag(config, "webgpu"));
            setFlag(url, "aa", getFlag(config, "aa", "antialias"));
            setFlag(url, "hpr", getFlag(config, "hpr", "highPrecisionRendering"));
            setFlag(url, "noanim", getFlag(config, "noanim", "noAnim"));
            setFlag(url, "nofx", getFlag(config, "nofx", "noFx"));
            setFlag(url, "fullload", getFlag(config, "fullload", "fullLoad"));
            setFlag(url, "ministats", getFlag(config, "ministats", "miniStats"));
            setFlag(url, "colorize", getFlag(config, "colorize"));
            setFlag(url, "heatmap", getFlag(config, "heatmap"));
            setFlag(url, "noui", self.item.splatShowUI === false || config.showUI === false || config.showUi === false);

            return url.toString();
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                self.$content.off("load error").on({
                    load: function(){
                        self.$content.off("load error");
                        def.resolve(self);
                    },
                    error: function(){
                        self.$content.off("load error");
                        def.reject(self);
                    }
                });
                self.$content.attr("src", self.getViewerUrl());
            }).promise();
        },
        doUnload: function(){
            this.isLoaded = false;
            this.$content.attr("src", "about:blank");
            this.$el.removeClass(this.panel.cls.states.loaded);
            return _fn.resolved;
        }
    });

    _.Panel.media.register("splat", _.Panel.Splat);

    _.template.configure("core", {
        panel: {
            splat: {
                viewerUrl: "",
                attrs: {
                    src: "",
                    frameborder: "no",
                    allow: "autoplay; fullscreen; xr-spatial-tracking; gamepad",
                    allowfullscreen: true
                }
            }
        }
    },{
        panel: {
            splat: {
                type: "fg-media-splat"
            }
        }
    });
})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj
);
