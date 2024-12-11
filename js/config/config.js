export const realtime = firebase.database().ref();
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

export const tokens = realtime.child("TokenSession");
export const snap_tarifas = realtime.child("Info_Tarifas");
export const snap_flag_rates = realtime.child("Info_Tarifas/Banderas");
export const tarifasRef = realtime.child("Info_Tarifas/SLP");

export const getAllRoles = async () => {
  return await firestore
    .collection("roles")
    .get()
    .then((snapshot) => {
      const array = [];
      snapshot.forEach((document) => {
        array.push({ uid: document.id, ...document.data() });
      });
      console.log(array);
      return array;
    });
};

export const createUserAndSaveData = async (elements, collection, isConcesionario = false) => {
  try {
    let firestoreData = {};
    elements?.forEach((i) => {
      firestoreData = { ...firestoreData, ...i };
    });

    const snapshot = await firestore
      .collection("conductores")
      .where("numGafeteSCT", "==", firestoreData.numGafeteSCT)
      .get();
    if (snapshot?.docs[0]?.exists) {
      window.alert(
        `Ya se encuentra registrado un usuario con el gafete: ${firestoreData.numGafeteSCT}, intente con otro.`
      );
      return false;
    }
    firestoreData = { ...firestoreData, fechaAlta: new Date().toISOString() };

    const { status, code, user } = await firebase
      .auth()
      .createUserWithEmailAndPassword(firestoreData.correoElectronico, "1234abcd")
      .then((user) => {
        return { status: 200, user: user.user };
      })
      .catch((error) => {
        console.log({ catcherror: error });
        if (error.code === "auth/email-already-in-use") {
          window.alert("ERROR: El correo electrónico ya se encuentra registrado con otro usuario.");
        }
        return { status: 500, code: error.code };
      });
    if (status === 200) {
      firestoreData = { ...firestoreData, uid: user.uid };
      await resetPasswordToUser(firestoreData.correoElectronico);
      await firestore.collection(collection).doc(user.uid).set(firestoreData);
      if (isConcesionario === true) {
        await firestore.collection("conductores").doc(user.uid).set(firestoreData);
      }

      if (collection === "conductores" || isConcesionario === true) {
      //CAMBIOS DE ABDIEL
        const obligatoryUserFields = {
          banderaMensajeI: "N/A",
          delegacionID: "N/A",
          estatus: "N/A",
          gafete: "N/A",
          genero: "N/A",
          image: "N/A",
          last_gps_location: "N/A",
          noLicencia_chofer: "N/A",
          nombre_chofer: "N/A",
          numero_economico: "N/A",
          proceso: "N/A",
          psw: "N/A",
          resenas: "N/A",
          tarjeton_ciudad: "N/A",
          tipo: "N/A",
          user_id: "N/A",
        }
        await insertIntoRealTime({...firestoreData, obligatoryUserFields});
      }
      window.alert("Se ha guardado el registro con exito.");
      return true;
    }
    if (status === 500) {
      switch (code) {
        case "auth/email-already-in-use":
          let otherCollection = "";
          if (collection === "concesionarios") {
            otherCollection = "conductores";
          } else if (collection === "conductores") {
            otherCollection = "concesionarios";
          } else {
            otherCollection = otherCollection;
          }

          const [{ uid: existingUserUID }] = await getUserDataByEmail(firestoreData.correoElectronico, otherCollection);

          firestoreData = { ...firestoreData, uid: existingUserUID };
          await firestore.collection(collection).doc(existingUserUID).set(firestoreData);
          await insertIntoRealTime(firestoreData);
          window.alert("Se ha guardado el registro con exito.");
          break;
        case "auth/invalid-email":
          window.alert("Corréo invalido, pruebe con otro.");
          break;
        case "auth/operation-not-allowed":
          window.alert("Se ha presentado un error en el registro, favor de verificar con un administrador.");
          break;
        default:
          window.alert("Se ha presentado un error, favor de verificar los datos introducidos.");
          break;
      }
      return false;
    }
  } catch (error) {
    console.error("Se ha presentado un error al crear el registro. ", error);
    return false;
  }
};
const getUserDataByEmail = async (email, collection) => {
  try {
    return await firestore
      .collection("concesionarios")
      .where("correoElectronico", "==", email)
      .get()
      .then((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ uid: doc.id, ...doc.data() });
        });
        return res;
      })
      .catch((err) => {
        console.error({ err });
      });
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getDocumentsFromCollection = async (collection) => {
  return await firestore
    .collection(collection)
    .get()
    .catch((error) => false);
};

export const deleteDocumentByUid = async (uid, collection) => {
  const result = await firestore
    .collection(collection)
    .doc(uid)
    .delete()
    .then((response) => response)
    .catch((error) => false);

  if (result !== false) {
    window.alert("Se ha eliminado el registro con exito.");
    // Eliminar conductores asignados de concesionarios
    await firestore
      .collection("concesionarios")
      .get()
      .then((concesionarios) => {
        concesionarios.docs.forEach(async (concesionario) => {
          const verifyIfExists = await firestore
            .collection("concesionarios")
            .doc(concesionario.id)
            .collection("conductores")
            .doc(uid)
            .get();

          if (verifyIfExists) {
            await firestore
              .collection("concesionarios")
              .doc(concesionario.id)
              .collection("conductores")
              .doc(uid)
              .delete();
          }
        });
      });
    return true;
  }
  window.alert("Se ha presentado un error!");
  return false;
};

export const getDocumentByUid = async (uid, collection) => {
  const result = await firestore
    .collection(collection)
    .doc(uid)
    .get()
    .then((response) => {
      if (response.exists) {
        return response.data();
      }
    })
    .catch((error) => false);

  return result;
};

export const updateDocumentByUid = async (elements, uid, collection) => {
  let data = {};
  elements?.forEach((item) => {
    Object.assign(data, item);
  });
  data = Object.assign(data, { fechaActualizacion: new Date().toISOString() });
  delete data.fechaAlta;

  const response = await firestore
    .collection(collection)
    .doc(uid)
    .update(data)
    .catch((error) => false);
  if (response !== false) {
    alert("Se ha actualizado el usuario de manera corrrecta.");
    return true;
  }
  alert("Se ha presentado un error, favor de verificar.");
  return false;
};

export const resetPasswordToUser = async (email) => {
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    alert(
      "Se le ha enviado un correo de validacion y restablecimiento de contraseña al usuario, se requiere verificar su bandeja de entrada."
    );
    return true;
  } catch (error) {
    alert("Se ha presentado un error, favor de verificar");
    return false;
  }
};


export const getVehiclesFromInnerDocumentCollection = async (concesionarioUID, collection) => {
  try {
    return await firestore
      .collection(collection)
      .doc(concesionarioUID)
      .collection("vehiculos")
      .get()
      .then((snapshot) => {
        const documentsArray = [];
        snapshot.forEach((document) => {
          documentsArray.push({ uid: document.id, ...document.data() });
        });
        return documentsArray;
      });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return [];
  }
};

export const getConductoresromInnerDocumentCollection = async (concesionarioUID, collection) => {
  try {
    return await firestore
      .collection(collection)
      .doc(concesionarioUID)
      .collection("conductores")
      .get()
      .then((snapshot) => {
        const documentsArray = [];
        snapshot.forEach((document) => {
          documentsArray.push({ uid: document.id, ...document.data() });
        });
        return documentsArray;
      });
  } catch (error) {
    console.error("Error al obtener conductores:", error);
    return [];
  }
};

export const getDocumentsFromVehicleCollection = async (cUid, collection, vehiculos) => {
  try {
    const userInformation = await firestore
      .collection(collection)
      .doc(cUid)
      .get()
      .then((snapshot) => {
        return snapshot.exists && snapshot.data();
      });
    if (userInformation?.vehicles === undefined || userInformation?.vehicles.length === 0) {
      return null;
    }

    const vehiclesUIDFromUser = [...userInformation.vehicles.map((v) => v.vehicleUID)];
    const querySnapshot = await Promise.all(
      vehiclesUIDFromUser.map(async (vehicle) => {
        return await firestore
          .collection(vehiculos)
          .doc(vehicle)
          .get()
          .then((snapshot) => {
            return snapshot.exists && { ...snapshot.data(), uid: snapshot.id };
          });
      })
    );
    if (querySnapshot.length > 0) {
      const requiredInformationFromVehicle = querySnapshot.map((req) => {
        const { placa, modelo, marca, uid: vUid } = req;
        const vehicles = userInformation.vehicles;
        const habilitado = vehicles?.filter((i) => i.vehicleUID === vUid);
        return {
          placa,
          modelo,
          marca,
          habilitado: habilitado[0]?.habilitado || false,
          vUid,
        };
      });
      return requiredInformationFromVehicle;
    } else {
      console.log("No se encontraron vehículos.");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return false;
  }
};

export const getDocumentsFromConductoresCollection = async (cUid, collection, conductores) => {
  try {
    const userInformation = await firestore
      .collection(collection)
      .doc(cUid)
      .get()
      .then((snapshot) => {
        return snapshot.exists && snapshot.data();
      });
    if (userInformation?.conductores === undefined || userInformation?.conductores.length === 0) {
      return null;
    }

    const conductoresUIDFromUser = [...userInformation.conductores.map((v) => v.conductorUID)];
    const querySnapshot = await Promise.all(
      conductoresUIDFromUser.map(async (conductor) => {
        return await firestore
          .collection(conductores)
          .doc(conductor)
          .get()
          .then((snapshot) => {
            return snapshot.exists && { ...snapshot.data(), uid: snapshot.id };
          });
      })
    );
    if (querySnapshot.length > 0) {
      const requiredInformationFromConductor = querySnapshot.map((req) => {
        const { numGafeteSCT, nombre, apellidoPaterno, apellidoMaterno, telefono, uid: cUid } = req;
        const conductores = userInformation.conductores;
        const habilitado = conductores?.filter((i) => i.conductorUID === cUid);
        return {
          habilitado: habilitado[0]?.habilitado || false,
          numGafeteSCT,
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          telefono,
          cUid,
        };
      });
      return requiredInformationFromConductor;
    } else {
      console.log("No se encontraron conductores.");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener conductores:", error);
    return false;
  }
};

export const uploadFilesToStorage = async (uid, collection) => {
  try {
    const inputFiles = document.getElementById("operadorPic");
    const archivo = inputFiles.files[0];

    if (archivo === null || archivo === undefined) {
      return;
    }

    const reference = storage.ref().child(`${collection}/${uid}/` + archivo.name);
    await reference.put(archivo);

    const url = await reference.getDownloadURL();

    return url;
  } catch (error) {
    console.error("Error al subir imagenes, ", error);
    return false;
  }
};

const insertIntoRealTime = async (data) => {
  const {
    apellidoMaterno,
    apellidoPaterno,
    nombre,
    numeroEconomico,
    telefono,
    sexo,
    uid,
    municipio,
    correoElectronico,
    numGafeteSCT,
  } = data;

  const realtime = {
    MUNICIPIO: String(municipio).toUpperCase(),
    banderaMensajeI: "INACTIVA",
    color: "N/A",
    correo: correoElectronico,
    resenas: "5.0 (123 reñas)",
    delegacionID: "SIN ID",
    estatus: "ACTIVO",
    gafete: numGafeteSCT,
    genero: sexo,
    id: uid,
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg",
    last_gps_location: "32.446237013348124, -116.84971051461638",
    marca: "N/A",
    modelo: "N/A",
    noLicencia_chofer: "N/A",
    nombre_chofer: [nombre, apellidoPaterno, apellidoMaterno].join(" "),
    numero_economico: numeroEconomico || "",
    placa: "N/A",
    proceso: "NIGUNO",
    psw: "NINGUNO",
    tarjeton_ciudad: "NINGUNO",
    telefono: telefono,
    tipo: "N/A",
    tipo_vehiculo: "N/A",
    user_id: "3335",
  };
  const isUpdated = await firebase
    .database()
    .ref()
    .child(`Users/Drivers/${uid}`)
    .update(realtime)
    .then(() => true)
    .catch(() => false);

  if (isUpdated) {
    window.alert("Se ha insertado datos del conductor a la base de datos.");
  } else {
    window.alert("Se ha presentado un error.");
  }
};
