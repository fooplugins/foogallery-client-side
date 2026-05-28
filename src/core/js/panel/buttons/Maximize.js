(function($, _, _is){

    var root = document.documentElement;
    var scrollKeys = {
        " ": true,
        ArrowDown: true,
        ArrowLeft: true,
        ArrowRight: true,
        ArrowUp: true,
        End: true,
        Home: true,
        PageDown: true,
        PageUp: true
    };

    function prevent( event ) {
        event.preventDefault();
    }

    function isEditable( target ) {
        return target && (
            target.isContentEditable ||
            (target.tagName && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test( target.tagName.toUpperCase() ))
        );
    }

    function preventKey( event ) {
        if ( scrollKeys[ event.key ] && !isEditable( event.target ) ) event.preventDefault();
    }

    _.Panel.Maximize = _.Panel.Button.extend({
        construct: function(panel){
            this._super(panel, "maximize", {
                icon: "maximize",
                label: panel.il8n.buttons.maximize,
                toggle: true
            });
            this._scrollState = null;
            this.$placeholder = $("<span/>");
        },
        click: function(){
            this.set(!this.panel.isMaximized);
            this._super();
        },
        close: function(){
            this.exit();
            this._super();
        },
        set: function(maximized, visible){
            if (maximized) this.enter();
            else this.exit();
            visible = _is.boolean(visible) ? visible : this.isVisible;
            this.toggle(visible);
        },
        lockScroll: function(){
            var body = document.body;
            if (!body || this._scrollState) return;

            var pageHeight = Math.max(root.scrollHeight, body.scrollHeight, root.clientHeight);
            var state = this._scrollState = {
                x: window.scrollX,
                y: window.scrollY,
                rootMinHeight: root.style.minHeight,
                bodyPosition: body.style.position,
                bodyTop: body.style.top,
                bodyLeft: body.style.left,
                bodyRight: body.style.right,
                bodyWidth: body.style.width
            };

            root.classList.add(this.panel.cls.noScrollbars);
            root.style.minHeight = pageHeight + "px";
            body.style.position = "fixed";
            body.style.top = -state.y + "px";
            body.style.left = -state.x + "px";
            body.style.right = "0";
            body.style.width = "100%";

            document.addEventListener("wheel", prevent, {capture: true, passive: false});
            document.addEventListener("touchmove", prevent, {capture: true, passive: false});
            document.addEventListener("keydown", preventKey, true);
        },
        unlockScroll: function(){
            var state = this._scrollState, body = document.body;
            if (!state || !body) return;

            document.removeEventListener("wheel", prevent, {capture: true});
            document.removeEventListener("touchmove", prevent, {capture: true});
            document.removeEventListener("keydown", preventKey, true);

            root.classList.remove(this.panel.cls.noScrollbars);
            root.style.minHeight = state.rootMinHeight;
            body.style.position = state.bodyPosition;
            body.style.top = state.bodyTop;
            body.style.left = state.bodyLeft;
            body.style.right = state.bodyRight;
            body.style.width = state.bodyWidth;

            this._scrollState = null;
            window.scrollTo(state.x, state.y);
        },
        enter: function(){
            if (this.panel.isMaximized) return;
            this.panel.isMaximized = true;
            this.$placeholder.insertAfter(this.panel.$el);
            this.panel.$el.appendTo("body").addClass(this.panel.cls.maximized).attr({
                'role': 'dialog',
                'aria-modal': true
            }).trigger('focus');
            this.panel.buttons.press('maximize', true);
            this.panel.trapFocus();
            if (this.panel.opt.noScrollbars){
                this.lockScroll();
            }
        },
        exit: function(){
            if (!this.panel.isMaximized) return;
            this.panel.isMaximized = false;
            this.panel.$el.removeClass(this.panel.cls.maximized).attr({
                'role': null,
                'aria-modal': null
            }).insertBefore(this.$placeholder);
            if (this.panel.isInline) this.panel.$el.trigger('focus');
            this.$placeholder.detach();
            this.panel.buttons.press('maximize', false);
            this.panel.releaseFocus();
            if (this.panel.opt.noScrollbars){
                this.unlockScroll();
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);
