// import { snap_admins, tokens, generateTemporalToken } from "./config.js";
import { storeAccesos } from "./firestore-config.js";

const auth = firebase.auth();

const getUserData = (user) => {
  const {
    email,
    displayName,
    emailVerified,
    phoneNumber,
    photoUrl,
    za: token,
    uid,
    metadata,
  } = user;
  const userData = {
    email,
    displayName,
    emailVerified,
    phoneNumber,
    photoUrl,
    token,
    uid,
    lastLogin: metadata.b,
  };
  return userData;

  // return snap_admins
  //   .once("value")
  //   .then((snap) => {
  //     let object_data = {};
  //     const snapshot_array = Object.values(snap.val());

  //     for (let i = 0; i < snapshot_array.length; i++) {
  //       if (snapshot_array[i].email === em) {
  //         object_data = {
  //           id: snapshot_array[i].id,
  //           user: snapshot_array[i].usuario,
  //           name: snapshot_array[i].name,
  //           email: snapshot_array[i].email,
  //           rol: snapshot_array[i].rol,
  //         };
  //       }
  //     }

  //     return Object.entries(object_data).length >= 1 ? object_data : null;
  //   })
  //   .catch((error) => {
  //     console.log("ERROR getUserData, ", error);
  //     return null;
  //   });
};

const getErrorCode = (exCode) => {
  let message = "";
  switch (exCode) {
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

const setSession = async (user) => {
  localStorage.setItem("uid", user.uid);
  localStorage.setItem("name", user.displayName);
  localStorage.setItem("contact", user.email);
  localStorage.setItem("session", user.token);
  // localStorage.setItem("level", obx.rol);
  localStorage.setItem("sessionTime", user.lastLogin);
  return;
};

export const logInWithEmail = (em, pw) => {
  try {
    auth
      .signInWithEmailAndPassword(em, pw)
      .then(async (userCredential) => {
        const user = getUserData(userCredential.user);

        // if (user === null) {
        //   alert("No se encuentra usuario en la base de datos");
        //   return;
        // }
        storeAccesos
          .add({
            user: user.email,
            uid: user.uid,
            lastLogin: user.lastLogin,
          })
          .then(async (docRef) => {
            // const token = await generateTemporalToken();
            console.log(docRef);
            await setSession(user);
            // tokens.child(user.id).set({
            //   id: user.id,
            //   token: token,
            //   isConnected: true,
            //   timestamp: timestamp,
            // });
            // window.location.replace("./docs/main.html");
            console.log();
          })
          .catch((error) => {
            console.log(error);
            alert(error.message);
            localStorage.clear();
            // window.location.reload();
          });
      })
      .catch((error) => {
        console.log(error.code);
        const message_error = getErrorCode(error.code);
        alert(message_error);
        localStorage.clear();
        // window.location.reload();
      });
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
    alert(
      "Se ha presentado un error, favor de verificarlo con el Administrador."
    );
    localStorage.clear();
    // window.location.reload();
  }
};

export default auth;
