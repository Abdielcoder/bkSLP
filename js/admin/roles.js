import { firestore, getDocumentsFromCollection } from "../config/config.js";

const ROLES_COLLECTION = "roles";
const ROLES_TABLE = document.querySelector("table#roles");
const FORM_ROLES = document.querySelector("form#roles");
const BUTTON_ADD = document.querySelector("#button-add");
const MODAL_DIALOG = document.querySelector("div#modalDialog");
const MODAL_DIALOG_SUBMIT_BUTTOM = document.querySelector(
  "button#modal-dialog-submit"
);
let GLOBAL_DATA = [];

const checkSuccessIcon = `
  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#12822e"></path> 
    </g>
  </svg>
  `;
const checkFailureIcon = `
  <svg width="20px" height="20px" fill="#ad1f1f" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ad1f1f">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <title>cancel</title> 
      <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path> 
    </g>
  </svg>
  `;
const checkNullIcon = `
  <svg width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path fill="#db9600" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z"></path>
    </g>
  </svg>
  `;
const updateIcon = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c88528" d="M2.85 10.907l-.672 1.407L.033 17.26a.535.535 0 0 0 0 .368.917.917 0 0 0 .155.184.917.917 0 0 0 .184.155A.54.54 0 0 0 .56 18a.48.48 0 0 0 .18-.033l4.946-2.145 1.407-.672 8.53-8.53-4.244-4.243zM4.857 14l-1.515.657L4 13.143l.508-1.064 1.415 1.413zM16.707 5.537l-4.244-4.244.707-.707a2 2 0 0 1 2.83 0L17.414 2a2 2 0 0 1 0 2.83z"></path> </g></svg>`;

const createAndRenderDataTable = async () => {
  const snapshot = await getDocumentsFromCollection(ROLES_COLLECTION);
  GLOBAL_DATA = [];
  ROLES_TABLE.lastElementChild.innerHTML = "";
  if (snapshot !== false) {
    snapshot.forEach((document) => {
      const data = document.data();
      GLOBAL_DATA.push({ ...data, uid: document.id });
      const array = [
        ["nombre", data.nombre],
        ["short", data.short],
        ["concesionarios", data.concesionarios],
        ["conductores", data.conductores],
        ["vehiculos", data.vehiculos],
        ["mapa", data.mapa],
        ["admin", data.admin],
        ["fechaAlta", formatDateFromIsoString(data.fechaAlta)],
      ];
      const rowElementHTML = createRowElement(array, document.id);
      ROLES_TABLE.lastElementChild.insertAdjacentElement(
        "beforeend",
        rowElementHTML
      );
    });
  }
  console.log({ GLOBAL_DATA });
  new DataTable(ROLES_TABLE);
};

const createRowElement = (data, uid) => {
  try {
    const rowElement = document.createElement("TR");
    data.forEach((cell) => {
      const cellElement = document.createElement("TD");
      if (typeof cell[1] === "boolean") {
        cellElement.insertAdjacentHTML(
          "beforeend",
          cell[1] ? checkSuccessIcon : checkFailureIcon
        );
      }
      if (typeof cell[1] === "string") {
        cellElement.innerText = cell[1];
      }
      cellElement.setAttribute("name", cell[0]);
      rowElement.insertAdjacentElement("beforeend", cellElement);
    });
    const toolsElement = createActionToolsToRow(uid);
    rowElement.insertAdjacentElement("beforeend", toolsElement);
    return rowElement;
  } catch (error) {
    console.error("Se ha presentado un error al crear elemento, ", error);
  }
};

const createActionToolsToRow = (uid) => {
  const cellElement = document.createElement("TD");
  const boxElement = document.createElement("DIV");
  const updateButtonElement = document.createElement("BUTTON");

  updateButtonElement.innerHTML = updateIcon;
  updateButtonElement.setAttribute("type", "button");
  updateButtonElement.addEventListener("click", () =>
    showModalDialog(uid, "update")
  );
  boxElement.insertAdjacentElement("beforeend", updateButtonElement);
  boxElement.setAttribute("class", "tool-actions");
  boxElement.setAttribute("data-reference", uid);
  cellElement.insertAdjacentElement("beforeend", boxElement);

  return cellElement;
};

const showModalDialog = (uid, type) => {
  MODAL_DIALOG.setAttribute("data-visibility", "visible");
  if (type === "update") {
    MODAL_DIALOG.setAttribute("data-reference", uid);
    MODAL_DIALOG.setAttribute("data-type", "update");
    MODAL_DIALOG_SUBMIT_BUTTOM.children[0].textContent = "ACTUALIZAR";
    getDataAndRenderIntoModal(uid);
    return;
  }
  MODAL_DIALOG.setAttribute("data-type", "add");
  MODAL_DIALOG_SUBMIT_BUTTOM.children[0].textContent = "AGREGAR";
};

const hideModalDialog = async (reset = false) => {
  MODAL_DIALOG.setAttribute("data-visibility", "hidden");
  MODAL_DIALOG.setAttribute("data-reference", null);
  MODAL_DIALOG.setAttribute("data-type", null);

  Object.values(FORM_ROLES).forEach((element) => {
    if (element.type === "button" || element.type === "submit") return;
    if (element.type == "checkbox") {
      element.checked = false;
      return;
    }
    element.value = "";
  });
  if (reset) {
    await createAndRenderDataTable();
  }
};

createAndRenderDataTable();

BUTTON_ADD.addEventListener("click", function () {
  showModalDialog(null, "create");
});

const getDataAndRenderIntoModal = async (uid) => {
  const selectedData = GLOBAL_DATA.filter((item) => item.uid === uid)[0];
  let formEntries = Object.values(FORM_ROLES).filter(
    (item) => item.type !== "button" && item.type !== "submit"
  );

  formEntries.forEach((element) => {
    const { name, type } = element;
    if (type === "text") {
      element.value = selectedData[name] || "";
      return;
    }
    element.checked = selectedData[name];
  });
};

FORM_ROLES.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = getEstructuredDataFromForm(e.target);
  const type = MODAL_DIALOG.getAttribute("data-type");
  const uid = MODAL_DIALOG.getAttribute("data-reference");
  if (type === "add") {
    addDocumentToCollection(data);
    return;
  }
  updateDocumentData(data, uid);
});

const addDocumentToCollection = async (data) => {
  try {
    const objectData = {};
    Object.values(data).forEach((element) => {
      const { name, checked, value, type } = element;
      if (type === "text") {
        objectData[name] = value;
        return;
      }
      objectData[name] = checked;
    });
    objectData.fechaAlta = new Date().toISOString();

    const response = await firestore
      .collection(ROLES_COLLECTION)
      .add(objectData)
      .catch(() => false);
    if (response !== false) {
      alert("Se ha generado un registro nuevo.");
      await hideModalDialog(true);
    }
  } catch (error) {
    console.error("Se ha presentado un error al crear registro, ", error);
    alert("Se ha presentado un error al crear registro, ");
  }
};

const updateDocumentData = async (data, uid) => {
  try {
    const objectData = {};
    Object.values(data).forEach((element) => {
      const { name, checked, value, type } = element;
      if (type === "text") {
        objectData[name] = value;
        return;
      }
      objectData[name] = checked;
    });

    const response = await firestore
      .collection(ROLES_COLLECTION)
      .doc(uid)
      .update(objectData)
      .catch(() => false);
    if (response !== false) {
      alert("Se ha actualizado de manera correcta.");
      await hideModalDialog(true);
    }
  } catch (error) {
    console.error("Se ha presentado un error al actualizar, ", error);
    alert("Se ha presentado un error al actualizar");
  }
};

const formatDateFromIsoString = (value) => {
  const dateValue = new Date(value);
  const [day, month, year] = dateValue.toLocaleDateString("es-MX").split("/");
  const time = dateValue.toLocaleTimeString("es-MX", { hour12: true });
  // const [hours, min, seg] = time.split(".")[0].split(":");
  const monthsString = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${day}/${monthsString[parseInt(month) - 1]}/${year} ${time}`;
};

document
  .querySelector("button#modal-dialog-close")
  .addEventListener("click", hideModalDialog);

const getEstructuredDataFromForm = (data) => {
  let ObjectData = {};
  Object.entries(data).forEach((element) => {
    if (element[1].type === "submit" || element[1].type === "button") return;
    ObjectData[element[0]] = element[1];
  });
  return ObjectData;
};
