const config = {
  apiKey: "AIzaSyDrMy0R5emmKYAKwzrAwXtmBrj5hh67xkc",
  authDomain: "sct-slp-a23af.firebaseapp.com",
  databaseURL: "https://sct-slp-a23af-default-rtdb.firebaseio.com",
  projectId: "sct-slp-a23af",
  storageBucket: "sct-slp-a23af.appspot.com",
  messagingSenderId: "845689188477",
  appId: "1:845689188477:web:54051a45d70d0f1b8a4114",
  measurementId: "G-KQYZZY31RZ",
};

firebase.initializeApp(config);

const redirectToIndex = () => {
  if (window.location.pathname !== "/index.html") {
    window.location.replace("../../index.html");
  }
};
const isAuthenticated = () => sessionStorage.getItem("user");

window.onload = async function () {
  try {
    if (window.location.pathname === "/index.html") return;
    if (document.querySelector("div#root") !== null) {
      document.querySelector("div#root").classList.remove("preload");
    }
  } catch (error) {
    console.log({ error: error });
  }
};

const renderMenus = () => {
  const vehiculosMenu = document.querySelector("#vehiculos-menu-li");
  const conductoresMenu = document.querySelector("#conductores-menu-li");
  const concesionarioMenu = document.querySelector("#concesionario-menu-li");
  const mapaMenu = document.querySelector("#mapa-menu-li");
  const adminMenu = document.querySelector("#admin-menu-li");
  const rolesMenu = document.querySelector("#roles-menu-li");
  const chatsMenu = document.querySelector("#chats-menu-li");
  const historicoMenu = document.querySelector("#historico-menu-li");
  const clientesMenu = document.querySelector("#clientes-menu-li");

  const renderMap = sessionStorage.getItem("mapaPermission");
  const renderConcesionarios = sessionStorage.getItem(
    "concesionariosPermission"
  );
  const renderConductores = sessionStorage.getItem("conductoresPermission");
  const renderVehiculos = sessionStorage.getItem("vehiculosPermission");
  const renderAdmis = sessionStorage.getItem("adminsPermission");
  const renderRoles = sessionStorage.getItem("rolesPermission");
  const renderChats = sessionStorage.getItem("chatsPermission");
  const renderHistorico = sessionStorage.getItem("historicoPermission");
  const renderClientes = sessionStorage.getItem("clientesPermission");

  if (parseInt(renderMap.split(",")[1]) !== 1) {
    mapaMenu.remove();
  } else {
    mapaMenu.style.display = "block";
  }

  const concesionariosPermission = checkStatus(renderConcesionarios);
  const conductoresPermission = checkStatus(renderConductores);
  const vehiculosPermission = checkStatus(renderVehiculos);
  const adminsPermission = checkStatus(renderAdmis);
  const rolesPermission = checkStatus(renderRoles);
  const chatsPermission = checkStatus(renderChats);
  const historicoPermission = checkStatus(renderHistorico);
  const clientesPermission = checkStatus(renderClientes);

  if (adminsPermission == 0) {
    adminMenu.remove();
  } else {
    adminMenu.style.display = "block";
  }

  if (rolesPermission == 0) {
    rolesMenu.remove();
  } else {
    rolesMenu.style.display = "block";
  }

  if (conductoresPermission == 0) {
    conductoresMenu.remove();
  } else {
    conductoresMenu.style.display = "block";
  }

  if (vehiculosPermission == 0) {
    vehiculosMenu.remove();
  } else {
    vehiculosMenu.style.display = "block";
  }

  if (concesionariosPermission == 0) {
    concesionarioMenu.remove();
  } else {
    concesionarioMenu.style.display = "block";
  }
  if (conductoresPermission == 0) {
    conductoresMenu.remove();
  } else {
    conductoresMenu.style.display = "block";
  }
  if (vehiculosPermission == 0) {
    vehiculosMenu.remove();
  } else {
    vehiculosMenu.style.display = "block";
  }
  if (chatsPermission == 0) {
    chatsMenu.remove();
  } else {
    chatsMenu.style.display = "block";
  }
  if (historicoPermission == 0) {
    historicoMenu.remove();
  } else {
    historicoMenu.style.display = "block";
  }
  if (clientesPermission == 0) {
    clientesMenu.remove();
  } else {
    clientesMenu.style.display = "block";
  }
};

const checkStatus = (array) => {
  const destructuringArray = array
    .split("$")
    .map((item) => parseInt(item.split(",")[1]));
  if (destructuringArray.every((item) => item === 1)) return 1;
  if (destructuringArray.every((item) => item === 0)) return 0;
  if (destructuringArray.some((item) => item === 1)) return 1;
  return null;
};
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    renderMenus();
  } else {
    redirectToIndex();
  }
});
