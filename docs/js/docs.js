(function($){

	$(function(){

		$('.list-group-detailed')
			.children('.list-group-detail').on('transitionEnd webkitTransitionEnd transitionend oTransitionEnd msTransitionEnd', function(){
				var $this = $(this);
				if($this.hasClass('active')){
					$this.css('max-height', 9999);
				}
			}).end()
			.children('.list-group-item').on('click', function(e){
				if ($(e.target).closest(".anchor-link").length === 0){
					e.preventDefault();
					var $item = $(this), $detail = $item.next();
					if ($detail.hasClass('list-group-detail')){
						$item.add($detail).toggleClass('active');
						$detail.contentHeight = $detail.outerHeight();
						if ($detail.hasClass('active')){
							$detail.contentHeight += $detail.children('.list-group-detail-inner').outerHeight();
							$detail.addClass('transitions').css({
								'max-height': $detail.contentHeight
							});
						} else {
							$detail.removeClass('transitions').css('max-height', $detail.contentHeight);
							setTimeout(function(){
								$detail.addClass('transitions').css({
									'max-height': 0
								});
							}, 10);
						}
					}
				}
			});

	});

})(jQuery);