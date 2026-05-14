(function($, _, _is, _fn, _obj){

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
                return config.settings;
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

    _.Panel.Splat = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.splat);
            _obj.extend(this.cls, panel.cls.splat);
            _obj.extend(this.sel, panel.sel.splat);
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
