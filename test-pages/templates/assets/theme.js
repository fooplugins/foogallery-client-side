(function($){

    var pageSpeedInsightsUrl = "https://developers.google.com/speed/pagespeed/insights/?url=" + encodeURIComponent(window.location.href);

    $(function(){
        $("header button").on("click", function(e){
            e.preventDefault();
            window.open(pageSpeedInsightsUrl, '_blank');
        });
    });

})(jQuery);