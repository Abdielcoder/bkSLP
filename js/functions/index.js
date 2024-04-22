import { logInWithEmail } from "../config/auth.js";

const login_email = document.getElementById("loginEmail");
const login_password = document.getElementById("loginPassword");
const login_button = document.getElementById("loginSubmit");

login_button.addEventListener("click", (e) => {
  e.preventDefault();
  const isValid = verifyPreAccess();
  if (isValid === false) return;
  logInWithEmail(login_email.value, login_password.value);
});

document.addEventListener("keyup", (e) => {
  if (e.which !== 13) return;
  const isValid = verifyPreAccess();
  if (isValid === false) return;
  logInWithEmail(login_email.value, login_password.value);
});

document.querySelectorAll("input.form_input").forEach((e) => {
  e.addEventListener("keyup", (t) => {
    toggleInputOutline(t.target, null);
  });
  e.addEventListener("click", (t) => {
    toggleInputOutline(t.target, null);
  });
});

const verifyPreAccess = () => {
  const isEmail = validateEmail(login_email.value);

  if (
    (login_email.value === "" || isEmail === false) &&
    login_password.value === ""
  ) {
    alert("Favor de llenar los campos correctamente.");
    toggleInputOutline(login_email, false);
    toggleInputOutline(login_password, false);
    return false;
  }
  if (login_email.value === "" || isEmail === false) {
    alert("Favor de introducir su correo correctamente.");
    toggleInputOutline(login_email, false);
    return false;
  }
  if (login_password.value === "") {
    alert("Favor de introducir su contraseña correctamente.");
    toggleInputOutline(login_password, false);
    return false;
  }
  return true;
};

const toggleInputOutline = (itx, fx) => {
  if (fx === false) itx.style.outline = "1px solid #dc3545";
  if (fx === true || fx === null) itx.style.outline = "none";
  return;
};

const validateEmail = (ex) => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return pattern.test(ex);
};
