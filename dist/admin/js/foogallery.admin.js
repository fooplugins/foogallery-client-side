(function($){

	$(function () {
		$(".foogallery-vertical-tab,.foogallery-vertical-child-tab").on("click", function(e){
			e.preventDefault();
			e.stopPropagation();
			var $this = $(this),
				name = $this.data("name"),
				selector = '[data-name="'+name+'"]',
				$settings = $this.closest(".foogallery-settings"),
				$content = $settings.find('.foogallery-tab-contents').find(selector),
				$parent = $this.closest(".foogallery-vertical-tab"),
				$child = $parent.find(selector);

			// first remove old active classes
			$settings.find(".foogallery-tab-active").removeClass("foogallery-tab-active");
			// now re-apply the active classes to the elements that need it
			$parent.add($child).add($content).addClass("foogallery-tab-active");
		});
	});

})(jQuery);