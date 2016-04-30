jQuery(document).ready(function($) {


  // SCROLLTO FUNCTION
  function scrollTo(ziel, time) {
    var yOffset = $('.top-bar-wrapper').height();
    $('html,body').animate({
      scrollTop:$(ziel).offset().top - yOffset
    }, time);
  }

  $('a[href^=#]').bind("click", function(scroller) {
    scroller.preventDefault();
    var ziel = $(this).attr("href");
    scrollTo(ziel, 800);
  });


});
