(function($, _, _utils, _is, _str){

	_.Template = _.Component.extend({
		construct: function(gallery){
			this._super(gallery);
			this.options = this.fg.opt.template;
			this.eventNamespace = ".foogallery";
		},
		raise: function (eventName, args) {
			args = _is.array(args) ? args : [];
			var self = this,
				name = _str.contains(eventName, ".") ? eventName : eventName + self.eventNamespace,
				event = $.Event(name);
			if (self.fg.opt.debug) console.log(self.fg.id + ":" + name, args);
			self.fg.$el.trigger(event, args);
			return event;
		},
		onpreinit: function(){
			this.raise("preinit");
		},
		oninit: function(){
			this.raise("init");
		},
		onpostinit: function(){
			this.raise("postinit");
		},
		ondestroy: function(){
			this.raise("destroy");
		},
		onpredraw: function(){
			this.raise("predraw");
		},
		ondraw: function(){
			this.raise("draw");
		},
		onpostdraw: function(){
			this.raise("postdraw");
		},
		onitemparse: function(element){
			this.raise("item-parse", [element]);
			var item = _.components.make("item", this.fg);
			if (item.parseDOM(element)){
				return item.fix();
			}
			return null;
		},
		onitemsparsed: function(items){
			this.raise("items-parsed", [items]);
		},
		onitemmake: function(definition){
			this.raise("item-make", [definition]);
			return _.components.make("item", this.fg, definition);
		},
		onitemsmade: function(items){
			this.raise("items-made", [items]);
		},
		onitemcreate: function(item){
			this.raise("item-create", [item]);
			item.createDOM();
		},
		onitemscreated: function(items){
			this.raise("items-created", [items]);
		},
		onitemappend: function(item){
			this.raise("item-append", [item]);
			item.append().fix();
		},
		onitemsappended: function(items){
			this.raise("items-appended", [items]);
		},
		onitemdetach: function(item){
			this.raise("item-detach", [item]);
			item.detach().unfix();
		},
		onitemsdetached: function(items){
			this.raise("items-detached", [items]);
		},
		onitemsload: function(items){
			this.raise("items-load", [items]);
		},
		onitemloading: function(item){
			this.raise("item-loading", [item]);
			item.setLoading();
		},
		onitemloaded: function(item){
			this.raise("item-loaded", [item]);
			item.setLoaded().unfix();
		},
		onitemerror: function(item){
			this.raise("item-error", [item]);
			item.setError();
		},
		onitemsloaded: function(items){
			this.raise("items-loaded", [items]);
		}
	});

	_.template.register("default", _.Template, function($element){
		return $element.is(".foogallery");
	}, 1000);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.str
);