(function($, _, _is, _obj){

	function CoreTestPage(templates) {
		if (!(this instanceof CoreTestPage)) return new CoreTestPage();
		this.templates = templates;
		this.types = {
			classes: ["caption","hover-effect","loaded-effect","loading-icon","item-style","border-size","drop-shadow","inset-shadow","rounded-corners"],
			bool: [
				"lazy", "background",
				"paging-enabled","paging-showPrevNext","paging-showFirstLast","paging-showPrevNextMore",
				"infinite-enabled","infinite-auto"
			],
			int: [
				"throttle","distance",
				"paging-limit","paging-size",
				"infinite-threshold","infinite-size","infinite-distance"
			]
		};
	}

	CoreTestPage.prototype._init = function(){
		this.$options = $("#options");
		this.$templates = $("#template");
		this.$generate = $("#generate");
		this.$clear = $("#clear");
		this.$infiniteThreshold = $("#infinite-threshold");
		this.$infiniteAuto = $("#infinite-auto");
		this.$pagingOptionsFieldSet = $("#paging-options");
		this.$pagingEnabled = $("#paging-enabled");
		this.$infiniteOptionsFieldSet = $("#infinite-options");
		this.$infiniteEnabled = $("#infinite-enabled");
		this.$lazyEnabled = $("#lazy");
		this.$lazyOptionsFieldSet = $("#lazy-options");
		this.$borderStyle = $("[name=border-style]");
		this.$borderStyleOptionsFieldSet = $("#border-style-options");
		this.$output = $("#output");
		this.$current = $();
		this.$viewport = $("#viewport");
		this.$infiniteArea = $("#infinite-area");
	};

	CoreTestPage.prototype.formData = function(data){
		var inputs = $(':input', this.$options).get();
		if (_is.hash(data)) {
			$.each(inputs, function() {
				var input = $(this), value = data[this.name];
				if (data.hasOwnProperty(this.name)) {
					switch (this.type) {
						case 'checkbox':
							input.prop('checked', value !== null && value);
							break;
						case 'radio':
							if (value === null) {
								input.prop('checked', false);
							} else if (input.val() == value) {
								input.prop("checked", true);
							}
							break;
						default:
							input.val(value);
					}
				}
			});
		} else {
			data = {};
			$.each(inputs, function() {
				var input = $(this), value;
				switch (this.type) {
					case 'checkbox':
					case 'radio':
						value = input.is(':checked') ? input.val() : (!_is.undef(data[this.name]) ? data[this.name] : null);
						break;
					default:
						value = $(this).val();
				}
				data[this.name] = value;
			});
			return data;
		}
	};

	CoreTestPage.prototype.clear = function(){
		localStorage.removeItem("optionsFormData");
		location.reload(true);
	};

	CoreTestPage.prototype.generate = function(){
		var formData = this.formData();
		localStorage.setItem("optionsFormData", JSON.stringify(formData));
		location.reload(true);
	};

	CoreTestPage.prototype.init = function(){
		var self = this;
		self._init();
		self.$templates.empty();
		$.each(self.templates, function(name, options){
			self.$templates.append($("<option/>", {"value": name, "text": options.title}));
		});
		self.initFormData();
		self.$generate.on("click", function(e){
			e.preventDefault();
			self.generate();
		});
		self.$clear.on("click", function(e){
			e.preventDefault();
			self.clear();
		});
		self.$borderStyle.on("change", function(){
			self.updateBorderStylesFieldSets();
		});
		self.$lazyEnabled.on("change", function(){
			self.updateLazyFieldSets();
		});
		self.$pagingEnabled.add(self.$infiniteEnabled).on("change", function(){
			self.updatePagingAndInfiniteDisabled();
		});
		self.$infiniteThreshold.on("change", function(){
			self.updateInfiniteAutoDisabled();
		});
	};

	CoreTestPage.prototype.initFormInputs = function(){
		this.updateLazyFieldSets();
		this.updatePagingAndInfiniteDisabled();
		this.updateInfiniteAutoDisabled();
		this.updateBorderStylesFieldSets();
	};

	CoreTestPage.prototype.initFormData = function(){
		var formData = JSON.parse(localStorage.getItem("optionsFormData"));
		if (_is.hash(formData)){
			this.formData(formData);
			this.initFormInputs();

			var json = this.toJSON(), template = this.templates[json.template];
			if (_is.string(template.items)) json.options.items = template.items;

			console.log("generating:", json);

			this.$current = $($.parseHTML($.trim($(template.selector).text())));
			var options = $.extend(true, {}, this.$current.data("foogallery"), json.options);

			this.$current.addClass(json.classes.join(' '));
			this.$output.empty().append(this.$current);

			this.setViewportArea(json.options);
			this.setInfiniteArea(json.options.infinite);

			if (json.dark){
				$("body").addClass("dark");
			}

			if (_is.fn(template.ready)){
				template.ready.call(this, options);
			} else {
				_.init(this.$current, options);
			}
		} else {
			this.setViewportArea();
			this.setInfiniteArea();

			this.initFormInputs();
		}
	};

	CoreTestPage.prototype.setViewportArea = function(options){
		if (_is.hash(options) && _is.number(options.distance) && options.distance < 0){
			var $win = $(window), diff = options.distance * 2;
			this.$viewport.css({
				top: -(options.distance),
				left: -(options.distance),
				width: $win.width() + diff,
				height: $win.height() + diff
			});
		} else {
			this.$viewport.hide();
		}
	};

	CoreTestPage.prototype.setInfiniteArea = function(options){
		if (_is.hash(options) && _is.number(options.distance) && options.distance < 0){
			var $win = $(window), diff = options.distance * 2;
			$("body").addClass("infinite-tracked");
			this.$infiniteArea.css({
				top: -(options.distance),
				left: -(options.distance),
				width: $win.width() + diff,
				height: $win.height() + diff
			});
		} else {
			this.$infiniteArea.hide();
		}
	};

	CoreTestPage.prototype.toArray = function(){
		var array = this.$options.serializeArray();
		return array.concat(this.$options.find("input[type=checkbox]:not(:checked,:disabled)").map(function(){
			return {"name":this.name, "value": false};
		}).get());
	};

	CoreTestPage.prototype.toJSON = function(){
		var self = this, optionsArray = self.toArray(), obj = {
			classes: [],
			options: {
				items: "items.json",
				paging: {},
				infinite: {}
			},
			template: "",
			dark: false
		};
		// turn the array into a flat object and parse predefined basic values
		$.each(optionsArray, function(i, option){
			if ($.inArray(option.name, self.types.bool) !== -1){
				option.value = !!option.value;
			} else if ($.inArray(option.name, self.types.int) !== -1){
				option.value = parseInt(option.value);
			}
			obj.options[option.name] = option.value;
		});

		obj.template = self.getTemplate(obj.options);
		obj.dark = self.getDark(obj.options);

		obj.classes.push.apply(obj.classes, this.getCSSClassesFromOptions(obj.options));

		// then convert into a multi level object
		$.each(obj.options, function (name, value) {
			if (/-/g.test(name)){
				delete obj.options[name];
				_obj.prop(obj.options, name.replace(/-/g, "."), value);
			}
		});
		return obj;
	};

	CoreTestPage.prototype.updatePagingAndInfiniteDisabled = function(){
		var pagingChecked = this.$pagingEnabled.prop("checked"),
			infiniteChecked = this.$infiniteEnabled.prop("checked");

		if (pagingChecked){
			this.$infiniteEnabled.prop("checked", false).prop("disabled", true);
			this.$infiniteOptionsFieldSet.prop("disabled", true);
			this.$pagingOptionsFieldSet.prop("disabled", false);
		} else {
			this.$infiniteEnabled.prop("disabled", false);
			this.$pagingOptionsFieldSet.prop("disabled", true);
		}
		if (infiniteChecked){
			this.$pagingEnabled.prop("checked", false).prop("disabled", true);
			this.$pagingOptionsFieldSet.prop("disabled", true);
			this.$infiniteOptionsFieldSet.prop("disabled", false);
		} else {
			this.$pagingEnabled.prop("disabled", false);
			this.$infiniteOptionsFieldSet.prop("disabled", true);
		}
	};

	CoreTestPage.prototype.updateInfiniteAutoDisabled = function(){
		var threshold = parseInt(this.$infiniteThreshold.val());
		this.$infiniteAuto.prop("disabled", isNaN(threshold) || threshold <= 0);
	};

	CoreTestPage.prototype.updateLazyFieldSets = function(){
		var enabled = this.$lazyEnabled.prop("checked");
		this.$lazyOptionsFieldSet.prop("disabled", !enabled);
	};

	CoreTestPage.prototype.updateBorderStylesFieldSets = function(){
		var value = this.$borderStyle.filter(":checked").val();
		this.$borderStyleOptionsFieldSet.prop("disabled", _is.empty(value));
	};

	CoreTestPage.prototype.getTemplate = function(options){
		var template = options.template;
		delete options.template;
		return template;
	};

	CoreTestPage.prototype.getDark = function(options){
		var dark = options.dark;
		delete options.dark;
		return dark;
	};

	CoreTestPage.prototype.getCSSClasses = function(options, name){
		var classes = [];
		if (!_is.empty(options[name])){
			classes.push.apply(classes, options[name].split(/\s/g));
			delete options[name];
		}
		return classes;
	};

	CoreTestPage.prototype.getCSSClassesFromOptions = function(options){
		var self = this;
		return $.map(self.types.classes, function(name){
			return self.getCSSClasses(options, name);
		});
	};

	window.CoreTestPage = CoreTestPage;

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.obj
);


// jQuery(function($){
//
// 	var templates = {};
//
// 	templates.masonry = function(options){
// 		var template = $("#masonry").text();
// 		console.log(options);
// 	};
//
// 	var presets = {};
//
// 	presets.none = function (options) {
// 		return options;
// 	};
//
// 	presets.paging = function (options) {
// 		options.paging = {
// 			enabled: true
// 		};
// 		$.each(options, function(name, value){
// 			if (name.substr(0, options.preset.length + 1) === "paging-"){
// 				options.paging[name.substr(options.preset.length + 1)] = value;
// 				delete options[name];
// 			}
// 		});
// 		return options;
// 	};
//
// 	presets.infinite = function (options) {
// 		options.infinite = {
// 			enabled: true
// 		};
// 		$.each(options, function(name, value){
// 			if (name.substr(0, options.preset.length + 1) === "infinite-"){
// 				options.infinite[name.substr(options.preset.length + 1)] = value;
// 				delete options[name];
// 			}
// 		});
// 		return options;
// 	};
//
// 	function getOptions(){
// 		var optionsArray = $("#options").serializeArray(), options = {
// 			classes: []
// 		};
// 		$.each(optionsArray, function(i, option){
// 			if ($.inArray(option.name, ["lazy","paging-showPrevNext","paging-showFirstLast","paging-showPrevNextMore"]) !== -1){
// 				options[option.name] = !!option.value;
// 			} else if ($.inArray(option.name, ["paging-limit","paging-size"]) !== -1){
// 				options[option.name] = parseInt(option.value);
// 			} else {
// 				options[option.name] = option.value;
// 			}
// 		});
//
// 		var type, name, hover_effect;
// 		if (type = options["hover-effect-type"]){
// 			name = "hover-effect-" + type;
// 			if (hover_effect = options[name]){
// 				options.classes.push.apply(options.classes, hover_effect.split(/\s/g));
// 				delete options[name];
// 			}
// 			delete options["hover-effect-type"];
// 		}
//
// 		if (presets[options.preset]){
// 			options = presets[options.preset](options);
// 		}
// 		return options;
// 	}
//
// 	function applyOptions(){
// 		var options = getOptions();
// 		if (templates[options.template]){
// 			templates[options.template](options);
// 		}
// 	}
//
// 	$("#generate").on("click", function(e){
// 		e.preventDefault();
// 		applyOptions();
// 	});
//
// 	$("#template").on("change", applyOptions);
//
//
//
// 	$("#paging-enabled").on("change", function(e){
// 		if ($(this).prop("checked")){
//
// 		}
// 	});
//
// });