(function($, _, _is, _obj){

	function CoreTestPage(templates) {
		if (!(this instanceof CoreTestPage)) return new CoreTestPage();
		this.templates = templates;
		this.types = {
			classes: ["caption","hover-effect","loaded-effect","loading-icon","item-style","border-size","drop-shadow","inset-shadow","rounded-corners"],
			bool: [
				"state-enabled",
				"lazy", "background",
				"pagination-showPrevNext","pagination-showFirstLast","pagination-showPrevNextMore"
			],
			int: [
				"viewport",
				"paging-size",
				"pagination-limit",
				"infinite-distance",
				"loadMore-distance","loadMore-amount"
			]
		};
	}

	CoreTestPage.prototype._init = function(){
		this.$options = $("#options");
		this.$templates = $("#template");
		this.$generate = $("#generate");
		this.$clear = $("#clear");
		this.$pagingType = $("[name=paging-type]");
		this.$pagingOptionsFieldSet = $("#paging-options");
		this.$infiniteOptionsFieldSet = $("#infinite-options");
		this.$loadMoreOptionsFieldSet = $("#loadMore-options");
		this.$paginationOptionsFieldSet = $("#pagination-options");
		this.$dotsOptionsFieldSet = $("#dots-options");
		this.$lazyEnabled = $("#lazy");
		this.$lazyOptionsFieldSet = $("#lazy-options");
		this.$borderStyle = $("[name=border-style]");
		this.$borderStyleOptionsFieldSet = $("#border-style-options");
		this.$output = $("#output");
		this.$current = $();
		this.$viewportArea = $("#viewport-area");
		this.$infiniteArea = $("#infinite-area");
		this.$loadMoreArea = $("#loadMore-area");
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
			if (_is.string(data.tab)){
				var $settings = $(".foogallery-settings");
				$settings.find(".foogallery-tab-active").removeClass("foogallery-tab-active");
				$settings.find('[data-name="'+data.tab+'"]').addClass("foogallery-tab-active");
			}
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
			data.tab = $(".foogallery-vertical-tab.foogallery-tab-active").data("name");
			return data;
		}
	};

	CoreTestPage.prototype.clear = function(){
		localStorage.removeItem("optionsFormData");
		if (history && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
		location.reload(true);
	};

	CoreTestPage.prototype.generate = function(){
		var formData = this.formData();
		localStorage.setItem("optionsFormData", JSON.stringify(formData));
		if (history && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
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
		self.$pagingType.on("change", function(){
			self.updatePagingFieldSets();
		});
	};

	CoreTestPage.prototype.initFormInputs = function(){
		this.updateLazyFieldSets();
		this.updatePagingFieldSets();
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
			this.setLoadMoreArea(json.options.loadMore);

			if (json.dark){
				$("body").addClass("dark");
			}

			if (_is.fn(template.ready)){
				template.ready.call(this, options);
			} else {
				_.init(options, this.$current);
			}
		} else {
			this.setViewportArea();
			this.setInfiniteArea();
			this.setLoadMoreArea();

			this.initFormInputs();
		}
	};

	CoreTestPage.prototype.setViewportArea = function(options){
		if (_is.hash(options) && options.lazy && _is.number(options.viewport) && options.viewport < 0){
			var $win = $(window), diff = options.viewport * 2;
			this.$viewportArea.css({
				top: -(options.viewport),
				left: -(options.viewport),
				width: $win.width() + diff,
				height: $win.height() + diff
			});
		} else {
			this.$viewportArea.hide();
		}
	};

	CoreTestPage.prototype.setInfiniteArea = function(options){
		if (_is.hash(options) && _is.number(options.distance) && options.distance < 0){
			var $win = $(window), diff = options.distance * 2;
			$("body").addClass("gallery-tracked");
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

	CoreTestPage.prototype.setLoadMoreArea = function(options){
		if (_is.hash(options) && _is.number(options.distance) && options.distance < 0){
			var $win = $(window), diff = options.distance * 2;
			$("body").addClass("gallery-tracked");
			this.$loadMoreArea.css({
				top: -(options.distance),
				left: -(options.distance),
				width: $win.width() + diff,
				height: $win.height() + diff
			});
		} else {
			this.$loadMoreArea.hide();
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
				lazy: {},
				state: {},
				paging: {},
				dots: {},
				pagination: {},
				infinite: {},
				loadMore: {}
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

	CoreTestPage.prototype.updateLazyFieldSets = function(){
		var enabled = this.$lazyEnabled.prop("checked");
		this.$lazyOptionsFieldSet.prop("disabled", !enabled);
	};

	CoreTestPage.prototype.updateBorderStylesFieldSets = function(){
		var value = this.$borderStyle.filter(":checked").val();
		this.$borderStyleOptionsFieldSet.prop("disabled", _is.empty(value));
	};

	CoreTestPage.prototype.updatePagingFieldSets = function(){
		var value = this.$pagingType.filter(":checked").val();
		this.$pagingOptionsFieldSet.prop("disabled", _is.empty(value) || value === "none");
		this.$infiniteOptionsFieldSet.prop("disabled", value !== "infinite");
		this.$loadMoreOptionsFieldSet.prop("disabled", value !== "loadMore");
		this.$paginationOptionsFieldSet.prop("disabled", value !== "pagination");
		this.$dotsOptionsFieldSet.prop("disabled", value !== "dots");
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