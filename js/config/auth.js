import { auth, firestore } from "./config.js";
import { snap_admins, tokens, generateTemporalToken } from "./config.js";

// const getUserData = (em) => {
//   return snap_admins.once("value").then((snap) => {
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
//     return object_data;
//   });
// };

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

const setSession = async (obx, tx, tokx) => {
  localStorage.setItem("uid", obx.id);
  localStorage.setItem("name", obx.user);
  localStorage.setItem("contact", obx.email);
  localStorage.setItem("session", tokx);
  localStorage.setItem("level", obx.rol);
  localStorage.setItem("sessionTime", tx);
  return;
};

export const logInWithEmail = async (email, password) => {
  try {
    const response = await auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => userCredential)
      .catch((error) => {
        console.log(error);
        return false;
      });
    if (response !== false) {
      const { za: token, uid, email, metadata } = response.user;
      console.log({ token, uid, email, metadata });

      // const accessResponse = await firestore
      //   .collection("loginLogs")
      //   .doc(parseInt(metadata.a))
      //   .set({
      //     user: email,
      //     uid,
      //     loginDate: parseInt(metadata.a),
      //   })
      //   .then((snapshot) => {
      //     console.log({ snapshot });
      //     return snapshot;
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     return error;
      //   });

      // console.log(accessResponse);

      const getFirebaseData = await firestore
        .collection("accesosLogin")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            console.log(doc.id + " -- " + doc.data());
          });
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
      // accesos
      //     .add({
      //       user: user.uid,
      //       fechaHora: new Date().toISOString(),
      //     })
      //     .then(async (docRef) => {
      //       const token = await generateTemporalToken();
      //       const timestamp = new Date();

      //       await setSession(user, timestamp, token);
      //       tokens.child(user.id).set({
      //         id: user.id,
      //         token: token,
      //         isConnected: true,
      //         timestamp: timestamp,
      //       });
      //       window.location.replace("./docs/main.html");
      //     })
      //     .catch((error) => {
      //       alert(error.message);
      //       localStorage.clear();

      //       // window.location.reload();
      //     });
    }

    localStorage.clear();
    // window.location.reload();
  } catch (err) {
    console.log({err});
    // alert(
    //   "Se ha presentado un error, favor de verificarlo con el Administrador."
    // );
    // localStorage.clear();
    // window.location.reload();
  }
};

export default auth;
