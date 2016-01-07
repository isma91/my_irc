/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
  var body, sidedrawer, overlay, title, overlay, options;
  body = $('body');
  sidedrawer = $('#sidedrawer');
  function showSidedrawer() {
    options = {
      onclose: function() {
        sidedrawer.removeClass('active').appendTo(document.body);
      }
    };
    overlay = $(mui.overlay('on', options));
    sidedrawer.appendTo(overlay);
    setTimeout(function() {
      sidedrawer.addClass('active');
    }, 20);
  };
  function hideSidedrawer() {
    body.toggleClass('hide-sidedrawer');
  };
  $('.js-show-sidedrawer').on('click', showSidedrawer);
  $('.js-hide-sidedrawer').on('click', hideSidedrawer);
});