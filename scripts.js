const desktopSite = window.matchMedia("(min-width: 58.1em)");

window.onload = () => { fadeIn(); }
function fadeIn() {
  document.body.className -= ' fade-out';
}

let sticky = navbar.offsetTop;
window.onscroll = () => { stickyNav(); }
function stickyNav() {
    const navbar = document.getElementById("navbar");
    if (desktopSite.matches) {
        if (window.pageYOffset > sticky) {
            navbar.classList.add("sticky");
        } else {
            navbar.classList.remove("sticky");
        }
    }
}