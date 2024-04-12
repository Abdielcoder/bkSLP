import { firestore } from "../config/firebase";

const CONDUCTORES = firestore.collection("conductores");

const createAndSaveUser = async (req) => {
  try {
    let firestoreData = {};
    req?.forEach((i) => {
      firestoreData = Object.assign(firestoreData, i);
    });

    firestoreData = Object.assign(firestoreData, {
      fechaAlta: new Date().toISOString(),
    });

    const { status, code, user } = await firebase
      .auth()
      .createUserWithEmailAndPassword(
        firestoreData.correoElectronico,
        "1234abcd"
      )
      .then((user) => {
        return {
          status: 200,
          user: user.user,
        };
      })
      .catch((error) => {
        return {
          status: 500,
          code: error.code,
        };
      });
    if (status === 200) {
      firestoreData = Object.assign(firestoreData, { uid: user.uid });
      window.alert("Se ha guardado el operador con exito.");
      await resetPassword(firestoreData.correoElectronico);

      const response = await CONDUCTORES.doc(user.uid).set(firestoreData);

      const uploadSuccess = await uploadImagesFromUserByUid(user.uid);

      return true;
    }
    if (status === 500) {
      switch (code) {
        case "auth/email-already-in-use":
          window.alert(
            "El correo '" +
              firestoreData.correoElectronico +
              "' ya se encuentra registrado en el sistema, favor de introducir un correo distinto."
          );
          break;
        case "auth/invalid-email":
          window.alert("Corréo invalido, pruebe con otro.");
          break;
        case "auth/operation-not-allowed":
          window.alert(
            "Se ha presentado un error en el registro, favor de verificar con un administrador."
          );
          break;
        default:
          window.alert(
            "Se ha presentado un error, favor de verificar los datos introducidos."
          );
          break;
      }
      return false;
    }
  } catch (error) {
    console.error(
      "Se ha presentado un error al crear el usuario conductor. ",
      error
    );
    return false;
  }
};

const getAllUsersFromCollection = async () => {
  return await CONDUCTORES.get().catch((error) => false);
};

const deleteUserByUid = async (uid, email) => {
  const result = await CONDUCTORES.doc(uid)
    .delete()
    .then(() => true)
    .catch(() => false);

  if (result !== false) {
    window.alert("Se ha eliminado el operador con exito.");
    return true;
  }
  window.alert("Se ha presentado un error!");
  return false;
};

const getUserByUid = async (res) => {
  const result = await CONDUCTORES.doc(res)
    .get()
    .then((response) => {
      if (response.exists) {
        return response.data();
      }
    })
    .catch((error) => false);

  return result;
};

const updateUserByUid = async (res, uid) => {
  let data = {};
  res?.forEach((item) => {
    Object.assign(data, item);
  });
  data = Object.assign(data, { fechaActualizacion: new Date().toISOString() });
  const response = await CONDUCTORES.doc(uid)
    .update(data)
    .catch((error) => false);
  if (response !== false) {
    alert("Se ha actualizado el usuario de manera corrrecta.");
    return true;
  }
  alert("Se ha presentado un error, favor de verificar.");
  return false;
};

const uploadImagesFromUserByUid = async (uid, input) => {
  try {
    // const inputFiles = document.querySelector("#operadorPic");
    const archivo = input.files[0];

    if (archivo === null || archivo === undefined) {
      return;
    }

    const reference = storage.ref().child(`conductores/${uid}/` + archivo.name);
    await reference.put(archivo);

    const url = await reference.getDownloadURL();

    return url;
  } catch (error) {
    console.error("Error al subir imagenes, ", error);
    return false;
  }
};

export {
  createAndSaveUser,
  getAllUsersFromCollection,
  deleteUserByUid,
  getUserByUid,
  updateUserByUid,
  uploadImagesFromUserByUid,
};
