import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp({
  apiKey: "AIzaSyDrMy0R5emmKYAKwzrAwXtmBrj5hh67xkc",
  authDomain: "sct-slp-a23af.firebaseapp.com",
  databaseURL: "https://sct-slp-a23af-default-rtdb.firebaseio.com",
  projectId: "sct-slp-a23af",
  storageBucket: "sct-slp-a23af.appspot.com",
  messagingSenderId: "845689188477",
  appId: "1:845689188477:web:ec18c3e0d64758178a4114",
  measurementId: "G-FZH9CPVJF9",
});

const auth = getAuth(app);
const db = getFirestore(app);

signOut(auth);

export const login = async (email, pass) => {
  try {
    const authResponse = await signInWithEmailAndPassword(auth, email, pass);
    // const user = authResponse.user;
    // console.log({ user });

    // const firestoreResponse = await db
    //   .collection("accesosLogin")
    //   .get()
    //   .then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //       console.log(doc.id, " => ", doc.data());
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(error);

    if (errorCode === "auth/wrong-password") {
      alert("Wrong password.");
    } else {
      alert(errorMessage);
    }
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log({ user });

    await getDocs(collection(db, "loginAccessLogin")).then((querySnapshot) => {
      console.log(querySnapshot);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      });
    });
    // const firestoreResponse = await db
    //   .collection("accesosLogin")
    //   .get()
    //   .then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //       console.log(doc.id, " => ", doc.data());
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    // console.log(firestoreResponse);
  } else {
    // User is signed out
    // ...
  }
});

// .then(async (userCredential) => {
//   console.log({ userCredential });
//   const { user } = userCredential;
//   const data = {
//     displayName: user.displayName,
//     email: user.email,
//     photoURL: user.photoURL,
//     emailVerified: user.emailVerified,
//     uid: user.uid,
//     loginDate: user.metadata.lastLoginAt,
//   };
//   const logCollection = db.collection("accesosLogin");
//   const docRef = await logCollection
//     .add(data)
//     .then((snapshot) => {
//       console.log(snapshot);
//       alert("Log in successfully");
//     })
//     .catch((error) => {
//       alert(error.message);
//     });
// });

// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     // User is signed in, see docs for a list of available properties
//     // https://firebase.google.com/docs/reference/js/v8/firebase.User
//     var uid = user.uid;
//     // ...
//   } else {
//     // User is signed out
//     // ...
//   }
// });

// {
//   "uid": "hApCTZg3SGaFxSgpJu74tzfJ4043",
//   "email": "superuser@slp.com",
//   "emailVerified": false,
//   "isAnonymous": false,
//   "providerData": [
//       {
//           "providerId": "password",
//           "uid": "superuser@slp.com",
//           "displayName": null,
//           "email": "superuser@slp.com",
//           "phoneNumber": null,
//           "photoURL": null
//       }
//   ],
//   "stsTokenManager": {
//       "refreshToken": "AMf-vBwV80y7Qv4GO9Frg5JcJ9ybhFdzzFPuKmqjESWNHvziz7BF7qe6vFPbH7cvQcMaJUF2Rcw_WpGZeVKNwgqKPlrmPzYzGhWHNzt3A6JNxKt5SZRbisHuL-VYaXnO_hX0q1zu9EtLxyq2gFVoN-isEFY9TKB76Lwu8TlfVw6TpayORbfyLfawW73AykC8hGzUj1kkOeTyS4FTkoNUTJAQfRSJbbAk4g",
//       "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgwNzhkMGViNzdhMjdlNGUxMGMzMTFmZTcxZDgwM2I5MmY3NjYwZGYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2N0LXNscC1hMjNhZiIsImF1ZCI6InNjdC1zbHAtYTIzYWYiLCJhdXRoX3RpbWUiOjE3MTI3ODQ4MjIsInVzZXJfaWQiOiJoQXBDVFpnM1NHYUZ4U2dwSnU3NHR6Zko0MDQzIiwic3ViIjoiaEFwQ1RaZzNTR2FGeFNncEp1NzR0emZKNDA0MyIsImlhdCI6MTcxMjc4NDgyMiwiZXhwIjoxNzEyNzg4NDIyLCJlbWFpbCI6InN1cGVydXNlckBzbHAuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInN1cGVydXNlckBzbHAuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.alX0-Bf0YRP2TIK9rr2fCHIMrIKV33N95sX4qWtC9VjhiPH0UmsLRFzQxkzDFF33AVWVEJ1nT4A-GFnPgxRUWaNoC_KBNznP97ujwHvaZaysaIQJ9oEqER5xOxHJgNiNsB4nbMtUNW9qOPqodlczdpfgHqhOsXwzK8VOeo3MREIZBvO8Pw-aYLXo4mrDbY3s81TRQIdKq20KvYkAJm6cGXatz0OQTPmOmj0-lhrIjGQA-DxsZV8XZ4kpzS8a_gKEdyOYgcN6VrVfTjyUW0JZMutXY2U7bMdetaeX7DFUMyATfLIbYaEdafCOczHfT9ZZyIxW5X_qp8PjgJMmkbASBg",
//       "expirationTime": 1712788422133
//   },
//   "createdAt": "1712706021770",
//   "lastLoginAt": "1712784764015",
//   "apiKey": "AIzaSyDrMy0R5emmKYAKwzrAwXtmBrj5hh67xkc",
//   "appName": "[DEFAULT]"
// }
