const concesionarioMenu = document.querySelector("#concesionario");
const concesionarioSubmenu = document.querySelector("#concesionario-submenu");
const adminMenu = document.querySelector("#administracion");
const adminSubmenu = document.querySelector("#administracion-submenu");

concesionarioMenu.onmouseenter = function (e) {
  concesionarioSubmenu.setAttribute("data-displayed", "visible");
};

concesionarioMenu.onmouseleave = function (e) {
  concesionarioSubmenu.setAttribute("data-displayed", "hidden");
};

concesionarioSubmenu.onmouseleave = function (e) {
  e.currentTarget.setAttribute("data-displayed", "hidden");
};

concesionarioSubmenu.onmouseenter = function (e) {
  e.currentTarget.setAttribute("data-displayed", "visible");
};

adminMenu.onmouseenter = function (e) {
  adminSubmenu.setAttribute("data-displayed", "visible");
};

adminMenu.onmouseleave = function (e) {
  adminSubmenu.setAttribute("data-displayed", "hidden");
};

adminSubmenu.onmouseleave = function (e) {
  e.currentTarget.setAttribute("data-displayed", "hidden");
};

adminSubmenu.onmouseenter = function (e) {
  e.currentTarget.setAttribute("data-displayed", "visible");
};

window.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  document.querySelector("#copyrightFooter").textContent =
    "\u00A9 " + year + " Copyright, Tu Taxi.";
});
