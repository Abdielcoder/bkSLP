import { firestore } from "./config.js";

const auth = firebase.auth();
const logAccesos = firestore.collection("loginAccesos");

const getUserData = async (uid) => {
  try {
    const reference = firestore.collection("administradores");
    const user = await reference.where("uuid", "==", uid).limit(1).get();
    if (user.empty) {
      console.error("Usuario no existe");
      return null;
    }
    const data = user.docs[0].data();
    return {
      uid,
      name: data.nombre,
      user: data.usuario,
      departamento: data.departamento,
      email: data.email,
      rol: data.rolClave,
      id: user.docs[0].id,
    };
  } catch (error) {
    console.error("Error obteniendo el registro, ", error);
    return null;
  }
};

const getErrorCode = (code) => {
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

const setSession = async (user, timestamp) => {
  sessionStorage.setItem("user", user.uid);
  sessionStorage.setItem("username", user.name);
  sessionStorage.setItem("email", user.email);
  sessionStorage.setItem("auth", user.token);
  sessionStorage.setItem("rol", user.rol);
  sessionStorage.setItem("lastLogin", timestamp);
  return;
};

export const logInWithEmail = (email, password) => {
  try {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = await getUserData(userCredential.user.uid);
        await setSessionToken({ ...user, token: userCredential.user.za });
      })
      .catch((error) => {
        console.error(error);
        const messageError = getErrorCode(error.code);
        alert(messageError);
        sessionStorage.clear();
        window.location.reload();
      });
  } catch (err) {
    alert("Error, favor de verificarlo con el Administrador.");
    console.error(err);
    sessionStorage.clear();
    window.location.reload();
  }
};

const setSessionToken = async (credentials) => {
  try {
    const { email, user, rol, uid } = credentials;
    const timestamp = new Date().toISOString();
    const documentData = {
      email,
      username: user,
      rol,
      uid,
      timestamp,
    };
    await logAccesos.add(documentData).then(async () => { 
      await setSession(credentials, timestamp);
      window.location.replace("./docs/main.html");
    });
  } catch (error) {
    console.error(error);
    alert(error.message);
    sessionStorage.clear();
    window.location.reload();
  }
};

export default auth;
