const consesionarioMenu = document.querySelector("#consesionario");
const consesionarioSubmenu = document.querySelector("#consesionario-submenu");
const adminMenu = document.querySelector("#administracion");
const adminSubmenu = document.querySelector("#administracion-submenu");

consesionarioMenu.onmouseenter = function (e) {
  consesionarioSubmenu.setAttribute("data-displayed", "visible");
};

consesionarioMenu.onmouseleave = function (e) {
  consesionarioSubmenu.setAttribute("data-displayed", "hidden");
};

consesionarioSubmenu.onmouseleave = function (e) {
  e.currentTarget.setAttribute("data-displayed", "hidden");
};

consesionarioSubmenu.onmouseenter = function (e) {
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
