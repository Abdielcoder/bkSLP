// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE4SmPPbYlWa0UB3RJwMQ8ZBD3ooyGWBY",
  authDomain: "tadi-bac4e.firebaseapp.com",
  databaseURL: "https://tadi-bac4e-default-rtdb.firebaseio.com",
  projectId: "tadi-bac4e",
  storageBucket: "tadi-bac4e.appspot.com",
  messagingSenderId: "22237047929",
  appId: "1:22237047929:web:542330c6772d8f9d87b8a8",
  measurementId: "G-WSXXN7B2YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;