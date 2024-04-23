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

const redirectToIndex = () => window.location.replace("https://tutaxislp.com.mx");
const isAuthenticated = () => sessionStorage.getItem("user");
const navigateTo = (page) => window.location.replace(page);

window.onload = async function () {
  if (window.location.pathname === "/index.html") return;

  const session = isAuthenticated();
  if (session === null) {
    navigateTo("../../index.html");
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      renderMenus();
    } else {
      redirectToIndex();
    }
  });

  const renderMenus = () => {
    const vehiculosMenu = document.querySelector("#vehiculos-menu-li");
    const conductoresMenu = document.querySelector("#conductores-menu-li");
    const concesionarioMenu = document.querySelector("#concesionario-menu-li");
    const mapaMenu = document.querySelector("#mapa-menu-li");
    const adminMenu = document.querySelector("#admin-menu-li");
    const rolesMenu = document.querySelector("#roles-menu-li");

    console.log(sessionStorage);
 
    if (sessionStorage.getItem("render-mapa") == "3") {
      mapaMenu.remove();
    } else {
      mapaMenu.style.display = "block";
    }

    if (sessionStorage.getItem("render-admins") == "3") {
      adminMenu.remove();
    } else {
      adminMenu.style.display = "block";
    }

    if (sessionStorage.getItem("render-roles") == "3") {
      rolesMenu.remove();
    } else {
      rolesMenu.style.display = "block";
    }

    if(sessionStorage.getItem("render-concesionarios") != 3){
      concesionarioMenu.style.display = "block";
      conductoresMenu.remove();
      vehiculosMenu.remove();
      return;
    }
    concesionarioMenu.remove();

    if(sessionStorage.getItem("render-conductores") == 3){
      conductoresMenu.remove();      
    } else {
      conductoresMenu.style.display = "block"
    }

    if(sessionStorage.getItem("render-vehiculos") == 3){
      vehiculosMenu.remove();
    }  else {
      vehiculosMenu.style.display ="block"
    }
  }; 

  const signOutButton = document.querySelector("div#root");
  if (signOutButton !== null) {
    signOutButton.classList.remove("preload");
  }
};
