import { firestore } from "./config.js";

const auth = firebase.auth();
const logAccesos = firestore.collection("loginAccesos");

const getUserData = async (uid) => {
  try {
    const reference = firestore.collection("administradores");
    const user = await reference.doc(uid).get();
    if (user.empty) {
      console.error("Usuario no existe");
      window.alert("Usuario no existe");
      return null;
    }
    const data = user.data();
    const roles = await getUserRoles(data.rolClave);
    if (roles === false) {
      window.alert(
        "Se ha presentado un error, favor de solicitar a un administrador que asigne un rol a tu cuenta de acceso."
      );
      window.location.reload();
      return;
    }

    return {
      uid,
      name: data.nombre,
      user: data.usuario,
      departamento: data.departamento,
      email: data.email,
      rol: data.rolClave,
      roles: roles.data,
      array: roles.array,
    };
  } catch (error) {
    console.error("Error obteniendo el registro, ", error);
    return null;
  }
};

const getUserRoles = async (uid) => {
  try {
    const rol = await firestore.collection("roles").doc(uid).get();
    return destructuringRoleList(rol);
  } catch (error) {
    return false;
  }
};

const destructuringRoleList = (data) => {
  const entries = Object.entries(data.data());
  let objectData = {
    conductores: [],
    admins: [],
    roles: [],
    mapa: [],
    concesionarios: [],
    vehiculos: [],
    chats: [],
    historico: [],
    clientes: []
  };
  console.log({ ...data.data(), uid: data.id });

  entries.forEach((element) => {
    const name = element[0];
    const value = element[1];
    if (name.includes("-")) {
      const split = name.split("-");
      const propertyName = split[0];
      const propertyAction = split[1];
      const objectProperty = objectData[propertyName] || [];
      objectProperty.push({ [propertyAction]: value });
    } else {
      objectData[name] = value;
    }
  });

  objectData["concesionariosStatus"] = checkStatus(objectData.concesionarios);
  objectData["conductoresStatus"] = checkStatus(objectData.conductores);
  objectData["adminsStatus"] = checkStatus(objectData.admins);
  objectData["rolesStatus"] = checkStatus(objectData.roles);
  objectData["mapaStatus"] = checkStatus(objectData.mapa);
  objectData["vehiculosStatus"] = checkStatus(objectData.vehiculos);

  const array = [
    ["concesionariosPermission", objectData.concesionarios],
    ["conductoresPermission", objectData.conductores],
    ["adminsPermission", objectData.admins],
    ["rolesPermission", objectData.roles],
    ["mapaPermission", objectData.mapa],
    ["vehiculosPermission", objectData.vehiculos],
    ["chatsPermission", objectData.chats],
    ["historicoPermission", objectData.historico],
    ["clientesPermission", objectData.clientes]
  ];

  return { data: objectData, array };
};

const setPermissionsToStorage = (array) => {
  array?.forEach((element) => {
    const arr = element[1]
      .map((item) => {
        const name = Object.keys(item)[0];
        const value = Object.values(item) == "true" ? 1 : 0;
        return name + "," + value;
      })
      .join("$");
    sessionStorage.setItem(element[0], arr); 
  });
};

const checkStatus = (array) => {
  if (array.every((item) => Object.values(item)[0] === true)) {
    return 2;
  }
  if (array.every((item) => Object.values(item)[0] === false)) {
    return 3;
  }
  if (array.some((item) => Object.values(item)[0] === false)) {
    return 1;
  }
  return null;
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
  sessionStorage.setItem("lastLogin", timestamp); 
  return;
};

export const logInWithEmail = (email, password) => {
  console.log(email, password)
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
    const { email, user, rol, uid, array } = credentials;
    console.log({ array });
    const timestamp = new Date().toISOString();
    const documentData = { email, username: user, rol, uid, timestamp };
    await logAccesos.add(documentData).then(async () => {
      await setSession(credentials, timestamp);
      await setPermissionsToStorage(array);
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
