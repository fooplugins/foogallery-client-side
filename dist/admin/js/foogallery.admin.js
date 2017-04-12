(function($){

	$(function () {
		$(".foogallery-vertical-tab").on("click", function(e){
			e.preventDefault();
			var $this = $(this), $settings = $this.closest(".foogallery-settings"), name = $this.data("name");
			$settings.find(".foogallery-tab-active").removeClass("foogallery-tab-active");
			$settings.find('[data-name="'+name+'"]').addClass("foogallery-tab-active");
		});
	});

})(jQuery);