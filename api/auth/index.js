import auth from "../firebase/auth.js";
import firestore from "../firebase/firestore.js";

import {
  getAuthErrorMessages,
  getUserDataFromCredentials,
  setSession,
} from "../../utilities/authUtilities.js";

export const signIn = (email, pass) => {
  try {
    auth
      .signInWithEmailAndPassword(email, pass)
      .then(async (userCredential) => {
        const user = getUserDataFromCredentials(userCredential.user);
        setSession(user);

        const logResponse = await firestore
          .collection("loginAccesos")
          .add({
            user: user.email,
            uid: user.uid,
            loginTimestamp: user.lastLogin,
            loginDateString: new Date(parseInt(user.lastLogin)).toJSON(),
            name: user.displayName,
          })
          .then(() => true)
          .catch((error) => {
            alert(error.message);
            localStorage.clear();
            return false;
          });
        if (logResponse === true) {
          window.location.replace("../../backoffice/index.html");
        }
      })
      .catch((error) => {
        const messageError = getAuthErrorMessages(error.code);
        console.error(messageError);
        alert(messageError);
        localStorage.clear();
      });
  } catch (err) {
    console.error({ code: err.code, message: err.message });
    alert(
      "Se ha presentado un error, favor de verificarlo con el Administrador."
    );
    localStorage.clear();
  }
};
