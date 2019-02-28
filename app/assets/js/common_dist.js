"use strict";

(function ($) {
  'use strict';

  $(function () {
    var windowWidth = $(window).innerWidth(),
        windowHeight = $(window).height(),
        laptop = 1200,
        tabletDesktop = 992,
        largeMobDesktop = 767,
        mobileDesktop = 576,
        removeMd = $('.remove-md'),
        removeSm = $('.remove-sm'),
        removeXs = $('.remove-xs');

    if (windowWidth < tabletDesktop) {
      removeMd.remove();
    }

    if (windowWidth < largeMobDesktop) {
      removeSm.remove();
    }

    $(".loader_inner").fadeOut();
    $(".loader").delay(300).fadeOut("slow");

    var func = function func(x, y) {
      return x + y;
    };

    console.log(func(1, 5));
    console.log(func(2, 5));
  });
})(jQuery);