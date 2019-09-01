(function($, _, _utils, _is, _fn){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(element, options){
			this._super(element, options);
			/**
			 *
			 * @type {?HTMLStyleElement}
			 */
			this.style = null;

			this.fullWidth = false;
		},
		/**
		 * @summary Creates or gets the CSS stylesheet element for this template instance.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function getStylesheet
		 * @returns {StyleSheet}
		 */
		getStylesheet: function(){
			var self = this;
			if (self.style === null){
				self.style = document.createElement("style");
				self.style.appendChild(document.createTextNode(""));
				document.head.appendChild(self.style);
			}
			return self.style.sheet;
		},
		onPreInit: function(event, self){
			self.appendCSS();
		},
		onPostInit: function(event, self){
			self.checkCSS();
			$(window).on("resize" + self.namespace, {self: self}, _fn.debounce(self.onWindowResize, 50));
		},
		onDestroy: function(event, self){
			self.removeCSS();
			$(window).off("resize" + self.namespace);
		},
		onWindowResize: function(e){
			e.data.self.checkCSS();
		},
		checkCSS: function(){
			var self = this, maxWidth = self.getContainerWidth(), current = maxWidth < self.template.columnWidth;
			if (current !== self.fullWidth){
				self.appendCSS(maxWidth);
			}
		},
		appendCSS: function(maxWidth){
			var self = this;
			maxWidth = _is.number(maxWidth) ? maxWidth : self.getContainerWidth();

			self.removeCSS();

			var sheet = self.getStylesheet(), rule,
				container = '#' + self.id + self.sel.container,
				item = container + ' ' + self.sel.item.elem,
				width = self.template.columnWidth,
				gutter = Math.ceil(self.template.gutter / 2);

			switch (self.template.align) {
				case "center":
					rule = container + ' { justify-content: center; }';
					sheet.insertRule(rule , 0);
					break;
				case "left":
					rule = container + ' { justify-content: flex-start; }';
					sheet.insertRule(rule , 0);
					break;
				case "right":
					rule = container + ' { justify-content: flex-end; }';
					sheet.insertRule(rule , 0);
					break;
			}
			self.fullWidth = maxWidth < width;
			if (self.fullWidth){
				rule = item + ' { max-width: 100%; margin: ' + gutter + 'px; }';
				sheet.insertRule(rule , 0);
			} else {
				rule = item + ' { max-width: ' + width + 'px; min-width: ' + width + 'px; margin: ' + gutter + 'px; }';
				sheet.insertRule(rule , 0);
			}
		},
		removeCSS: function(){
			var self = this;
			if (self.style && self.style.parentNode){
				self.style.parentNode.removeChild(self.style);
				self.style = null;
				self.fullWidth = false;
			}
		}
	});

	_.template.register("simple_portfolio", _.PortfolioTemplate, {
		template: {
			gutter: 40,
			align: "center",
			columnWidth: 250
		}
	}, {
		container: "foogallery fg-simple_portfolio"
	});

})(
		FooGallery.$,
		FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);