const adminMenu = document.querySelector("#administracion");
const historicoMenu = document.querySelector("a#historico");
const adminSubmenu = document.querySelector("#administracion-submenu");
const historicoSubmenu = document.querySelector("#historico-submenu");

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

historicoMenu.onmouseenter = function (e) {
  historicoSubmenu.setAttribute("data-displayed", "visible");
};

historicoMenu.onmouseleave = function (e) {
  historicoSubmenu.setAttribute("data-displayed", "hidden");
};

historicoSubmenu.onmouseleave = function (e) {
  e.currentTarget.setAttribute("data-displayed", "hidden"); 
};

historicoSubmenu.onmouseenter = function (e) {
  e.currentTarget.setAttribute("data-displayed", "visible"); 
};

window.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  document.querySelector("#copyrightFooter").textContent = "\u00A9 " + year + " Copyright, Tu Taxi.";
});

document.querySelector("button#signout-button").addEventListener("click", function () {
  firebase.auth().signOut();
  sessionStorage.clear();
  window.location.replace("https://tutaxislp.com.mx");
});
