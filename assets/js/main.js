// Navigation

$('.hamburger').click(function(){
  $(this).toggleClass('is-active')
  $('.nav__menu').toggleClass('open')
})
// Link Clicks should also close the menu
$('.nav__menu a').click(function(){
  $('.hamburger').removeClass('is-active')
  $('.nav__menu').removeClass('open')
})

