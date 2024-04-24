import { firestore } from "./config.js";

const rolesPermission = async () => {
  try {
    const uid = sessionStorage.getItem("rol") || "";
    if (uid === "") {
      return;
    }

    const role = await firestore
      .collection("roles")
      .doc(uid)
      .get()
      .then((snap) => {
        if (snap.exists) {
          return snap.data();
        } else {
          return null;
        }
      });
    if (role) {
      console.log(role);
    }
  } catch (error) {
    console.error("No se pudieron obtener datos de roles", error);
  }
};

await rolesPermission();
