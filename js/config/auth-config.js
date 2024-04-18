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

const redirectToIndex = () => window.location.replace("../index.html");
const isAuthenticated = () => sessionStorage.getItem("user");
const navigateTo = (page) => window.location.replace(page);
 
window.onload = async function () {
  if (window.location.pathname === "/index.html") return;

  const session = isAuthenticated();
  if (session === null) { 
    navigateTo("../index.html");
  }

  const reference = firebase.firestore().collection("administradores"); 
  const user = await reference.where("uuid", "==", session).limit(1).get();
  if (user.empty) { 
    redirectToIndex();
    return;
  }

  const signOutButton = document.querySelector("div#root");
  if (signOutButton !== null) {
    signOutButton.classList.remove("preload");
  } 
};
