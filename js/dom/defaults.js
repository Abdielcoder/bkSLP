import { logOut } from "../config/auth-config.js";

const admin_menu = document.querySelector("li.nav-item.menu-button a.nav-link");
const sub_menu = document.querySelectorAll("li.nav-item.menu-linked");

admin_menu.addEventListener("click", (e) => {
  const menu = admin_menu.parentElement.classList;
  const isOpened = menu.contains("menu-opened");

  if (isOpened) {
    menu.remove("menu-opened");
    menu.add("menu-closed");
    sub_menu.forEach((e) => {
      e.classList.add("hidden");
    });
    return;
  }

  menu.remove("menu-closed");
  menu.add("menu-opened");
  sub_menu.forEach((e) => {
    e.classList.remove("hidden");
  });
});

const log_out = document.querySelector("button.close-app");

log_out.addEventListener("click", (e) => {
  logOut();
});
