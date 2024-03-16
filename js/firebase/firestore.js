import app from "./config";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const db = getFirestore();

export const guardaOperador = async (req) => {

  const response = await addDoc(collection(db, "OperadoresSLP"), req);
  console.log(response);

}