(function($, _, _utils, _is){

	_.Paging = _.Component.extend({
		construct: function(template){
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.Paging#
			 * @function _super
			 */
			self._super(template);
			self.opt = self.tmpl.opt.paging;
			self.cls = self.tmpl.cls.paging;
			self.il8n = self.tmpl.il8n.paging;
			self.sel = self.tmpl.sel.paging;
			self.pushOrReplace = self.opt.pushOrReplace;
			self.type = self.opt.type;
			self.theme = self.opt.theme;
			self.size = self.opt.size;
			self.position = self.opt.position;
			self.scrollToTop = self.opt.scrollToTop;
			self.current = 0;
			self.total = 0;
			self.ctrls = [];
			self._arr = [];
		},
		destroy: function(){
			var self = this;
			self._arr.splice(0, self._arr.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function(i, control){
				control.destroy();
			});
			self._super();
		},
		build: function(){
			var self = this, items = self.tmpl.items.available();
			self.total = self.size > 0 && items.length > 0 ? Math.ceil(items.length / self.size) : 1;
			if (self.total <= 1){
				self._arr.push(items);
			} else {
				for (var i = 0; i < self.total; i++){
					self._arr.push(items.splice(0, self.size));
				}
			}
			if (_.paging.hasCtrl(self.type)){
				var pos = self.position, top, bottom;
				if (pos === "both" || pos === "top"){
					top = _.paging.makeCtrl(self.type, self.tmpl, self, "top");
					if (top.create()){
						top.append();
						self.ctrls.push(top);
					}
				}
				if (pos === "both" || pos === "bottom"){
					bottom = _.paging.makeCtrl(self.type, self.tmpl, self, "bottom");
					if (bottom.create()){
						bottom.append();
						self.ctrls.push(bottom);
					}
				}
			}
		},
		rebuild: function(){
			var self = this;
			self.current = 0;
			self.total = 0;
			self._arr.splice(0, self._arr.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function(i, control){
				control.destroy();
			});
			self.build();
		},
		all: function(){
			return this._arr.slice();
		},
		available: function(){
			return this.get(this.current);
		},
		controls: function(pageNumber){
			var self = this;
			if (self.isValid(pageNumber)){
				$.each(self.ctrls, function(i, control){
					control.update(pageNumber);
				});
			}
		},
		isValid: function(pageNumber){
			return _is.number(pageNumber) && pageNumber > 0 && pageNumber <= this.total;
		},
		number: function(value){
			return this.isValid(value) ? value : (this.current === 0 ? 1 : this.current);
		},
		create: function(pageNumber){
			var self = this;
			pageNumber = self.number(pageNumber);
			for (var i = 0, l = self._arr.length, index = pageNumber - 1; i < l; i++) {
				if (i === index) self.tmpl.items.create(self._arr[i], true);
				else self.tmpl.items.detach(self._arr[i]);
			}
			self.current = pageNumber;
		},
		get: function(pageNumber){
			var self = this;
			if (self.isValid(pageNumber)){
				pageNumber = self.number(pageNumber);
				return self._arr[pageNumber - 1];
			}
			return [];
		},
		set: function(pageNumber, scroll, updateState){
			var self = this;
			if (self.isValid(pageNumber)){
				self.controls(pageNumber);
				var num = self.number(pageNumber), state;
				if (num !== self.current) {
					updateState = _is.boolean(updateState) ? updateState : true;
					if (updateState && self.current === 1 && !self.tmpl.state.exists()){
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}
					self.create(num);
					if (updateState){
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}
					if (self.scrollToTop && _is.boolean(scroll) ? scroll : false) {
						var page = self.get(self.current);
						if (page.length > 0){
							page[0].scrollTo("top");
						}
					}
					return true;
				}
			}
			return false;
		},
		find: function(item){
			var self = this;
			for (var i = 0, l = self._arr.length; i < l; i++) {
				if ($.inArray(item, self._arr[i]) !== -1) {
					return i + 1;
				}
			}
			return 0;
		},
		contains: function(pageNumber, item){
			var items = this.get(pageNumber);
			return $.inArray(item, items) !== -1;
		},
		first: function(){
			this.goto(1);
		},
		last: function(){
			this.goto(this._arr.length);
		},
		prev: function(){
			this.goto(this.current - 1);
		},
		next: function(){
			this.goto(this.current + 1);
		},
		goto: function(pageNumber){
			var self = this;
			if (self.set(pageNumber, true)){
				self.tmpl.loadAvailable();
			}
		}
	});

	_.PagingControl = _.Component.extend({
		construct: function(template, parent, position){
			var self = this;
			self._super(template);
			self.pages = parent;
			self.position = position;
			self.$container = null;
		},
		create: function(){
			var self = this;
			self.$container = $("<nav/>", {"class": self.pages.cls.container}).addClass(self.pages.theme);
			return true;
		},
		destroy: function(){
			var self = this;
			self.$container.remove();
			self.$container = null;
		},
		append: function(){
			var self = this;
			if (self.position === "top"){
				self.$container.insertBefore(self.tmpl.$el);
			} else {
				self.$container.insertAfter(self.tmpl.$el);
			}
		},
		update: function(pageNumber){}
	});

	_.paging.register("default", _.Paging, null, {
		type: "none",
		theme: "fg-light",
		size: 30,
		pushOrReplace: "push",
		position: "none",
		scrollToTop: true
	}, {
		container: "fg-paging-container"
	}, null, -100);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);