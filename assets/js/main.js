/* *** Navigation *** */

var $navBtn   = document.querySelector('.hamburger'),
    $navMenu  = document.querySelector('.nav__menu'),
    $navLinks = document.querySelectorAll('.nav__menu a')

// Toggle Hamburger menu
$navBtn.onclick = function(){
  $navBtn.classList.toggle('is-active')
  $navMenu.classList.toggle('open')
}

// Close menu when clicking links
$navLinks.forEach(function($link){
  $link.addEventListener('click', function(){
    $navBtn.classList.remove('is-active')
    $navMenu.classList.remove('open')
  })
})


/* *** Search *** */
