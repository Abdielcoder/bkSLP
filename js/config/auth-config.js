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
  if (window.location.pathname === "/index.html") return;

  if (document.querySelector("div#root") !== null) {
    document.querySelector("div#root").classList.remove("preload");
  }
};
const renderMenus = () => {
  const vehiculosMenu = document.querySelector("#vehiculos-menu-li");
  const conductoresMenu = document.querySelector("#conductores-menu-li");
  const concesionarioMenu = document.querySelector("#concesionario-menu-li");
  const mapaMenu = document.querySelector("#mapa-menu-li");
  const adminMenu = document.querySelector("#admin-menu-li");
  const rolesMenu = document.querySelector("#roles-menu-li");

  const renderMap = sessionStorage.getItem("mapaPermission");
  const renderConcesionarios = sessionStorage.getItem(
    "concesionariosPermission"
  );
  const renderConductores = sessionStorage.getItem("conductoresPermission");
  const renderVehiculos = sessionStorage.getItem("vehiculosPermission");
  const renderAdmis = sessionStorage.getItem("adminsPermission");
  const renderRoles = sessionStorage.getItem("rolesPermission");

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

  // console.log(g({
  //   renderMap,
  //   concesionariosPermission,
  //   conductoresPermission,
  //   vehiculosPermission,
  //   adminsPermission,
  //   rolesPermission,
  // });

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
    if (conductoresPermission == 1 && vehiculosPermission === 1) {
      vehiculosMenu.remove();
      conductoresMenu.remove();
      document.querySelector("li#conductores-submenu-li").style.display =
        "block";
      document.querySelector("li#vehiculos-submenu-li").style.display = "block";
      return;
    }
    if (conductoresPermission == 0) {
      document.querySelector("li#conductores-submenu-li").remove();
    } else {
      document.querySelector("li#conductores-submenu-li").style.display =
        "block";
    }
    if (vehiculosPermission == 0) {
      document.querySelector("li#vehiculos-submenu-li").remove();
    } else {
      document.querySelector("li#vehiculos-submenu-li").style.display = "block";
    }
  }
};

const checkStatus = (array) => {
  const destructuringArray = array
    .split("$")
    .map((item) => parseInt(item.split(",")[1]));
  // console.log(g({ destructuringArray });

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
