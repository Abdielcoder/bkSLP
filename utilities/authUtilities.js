export const getUserDataFromCredentials = (user) => {
  const userData = {
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    photoUrl: user.photoUrl,
    token: user.za,
    uid: user.uid,
    lastLogin: user.metadata.b,
  };
  return userData;
};

export const getAuthErrorMessages = (code) => {
  let message = "";
  switch (code) {
    case "auth/user-not-found":
      message =
        "No existe ningún registro de usuario que corresponda al identificador proporcionado.";
      break;
    case "auth/wrong-password":
      message = "La contraseña es invalida, favor de introducir correctamente.";
      break;
    case "auth/invalid-password":
      message =
        "El valor que se proporcionó para la propiedad del usuario password no es válido. Debe ser una string con al menos ocho caracteres.";
      break;
    case "auth/invalid-email":
      message =
        "El valor que se proporcionó para la propiedad del usuario email no es válido. Debe ser una dirección de correo electrónico de string. ";
      break;
    case "auth/email-already-exists":
      message =
        "Otro usuario ya está utilizando el correo electrónico proporcionado. Cada usuario debe tener un correo electrónico único. ";
      break;
    default:
      message =
        "Se ha presentado un error, favor de verificarlo con el Administrador.";
      break;
  }
  return message;
};

export const setSession = async (user) => {
  localStorage.setItem("uid", user.uid);
  localStorage.setItem("name", user.displayName);
  localStorage.setItem("user", user.email);
  localStorage.setItem("auth", user.token);
};
