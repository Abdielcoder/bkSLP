import { firestore, storage } from "../config/config.js";

var modalDialog = document.querySelector("div.modal-dialog[aria-modal='true'");
var modalTitle = document.getElementById("modal-dialog-title");
var submitText = document.getElementById("button-submit-text");
var vehicleForm = document.getElementById("form-vehiculo");
var vehiclesTable = null;
var formEntries = Object.values(vehicleForm).filter(item => (item.type !== "button" && item.type !== "submit"));

const createActionButtons = (uid) => {

  const tableCell = document.createElement("td");

  const updateButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  const updateAttrs = { type: "button", class: "cellButtonTool", "data-type": "update", "data-uid": uid, title: "Actualizar" };
  const deleteAttrs = { type: "button", class: "cellButtonTool", "data-type": "delete", "data-uid": uid, title: "Eliminar" };

  elementSetAttributes(updateButton, updateAttrs);
  elementSetAttributes(deleteButton, deleteAttrs);
  elementSetAttributes(tableCell, { "data-type": "tools" });

  updateButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c88528" d="M2.85 10.907l-.672 1.407L.033 17.26a.535.535 0 0 0 0 .368.917.917 0 0 0 .155.184.917.917 0 0 0 .184.155A.54.54 0 0 0 .56 18a.48.48 0 0 0 .18-.033l4.946-2.145 1.407-.672 8.53-8.53-4.244-4.243zM4.857 14l-1.515.657L4 13.143l.508-1.064 1.415 1.413zM16.707 5.537l-4.244-4.244.707-.707a2 2 0 0 1 2.83 0L17.414 2a2 2 0 0 1 0 2.83z"></path> </g></svg>`;
  deleteButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c84028" d="M13 18H5a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2zm3-15a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1z"></path> </g></svg>`;

  updateButton.addEventListener("click", (e) => handleUpdateVehicle(e));
  deleteButton.addEventListener("click", (e) => handleDeleteVehicle(e, e.currentTarget.parentNode));

  tableCell.insertAdjacentElement("beforeend", updateButton);
  tableCell.insertAdjacentElement("beforeend", deleteButton);

  return tableCell;
}

const insertDataToTableBody = (i) => {
  console.log(i)
  const tableRow = document.createElement("TR");
  const CELL_LIST = [i.placa, i.numeroEconomico, i.marca, i.modelo, i.color, i.tipoVehiculo, i.tipo];
  CELL_LIST.forEach(item => {
    const rowCell = document.createElement("TD");
    rowCell.textContent = item.toLowerCase();
    tableRow.appendChild(rowCell);
  });

  const tools = createActionButtons(i.uid)
  tableRow.setAttribute("data-reference", i.uid);
  tableRow.appendChild(tools)

  document.querySelector("table#vehicle-list tbody").insertAdjacentElement("beforeend", tableRow);
};

const getAllVehicles = async () => {
  try {
    const querySnapshot = await firestore.collection("VehiculosSLP").get();

    if (!querySnapshot.empty) {
      const informationData = querySnapshot.docs.map(doc => {
        return { ...doc.data(), uid: doc.id };
      });
      return informationData;
    } else {
      console.log("No se encontraron vehículos.");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    alert("Se ha presentado un error al obtener vehículo.");
    return false;
  }
};

const getVehicleByID = async (uid) => {
  try {
    console.log(uid);
    const response = await firestore.collection("VehiculosSLP").doc(uid).get();

    const storageReference = storage.ref().child("VehiculosSLP/" + uid);
    const result = await storageReference.listAll();

    const urls = await Promise.all(result.items.map(async (item) => {
      try {
        return await item.getDownloadURL();
      } catch (error) {
        console.error("Error obteniendo URL: ", error);
        return null;
      }
    }));


    if (response.exists) {
      document.querySelectorAll("img.previewImage").forEach((element, index) => {
        element.src = urls[index] || "../assets/img/nopic.png"
      });

      formEntries.forEach(element => {
        const { name } = element;
        const data = response.data()[name] || "";
        element.value = data;
      });

    } else {
      throw new Error("El usuario no existe en la base de datos.");
    }
  } catch (error) {
    console.error("No se ha podido obtener información del usuario: ", error);
    return false;
  }
};

const updateVehicleByID = async () => {
  try {
    const uid = document.querySelector("div.modal-dialog").getAttribute("data-reference");
    const formObject = {};

    formEntries.forEach(item => { Object.assign(formObject, { [item.name]: item.value }); });

    const objectValues = { uid, fechaActualizacion: new Date().toISOString() }
    Object.assign(formObject, objectValues);

    const response = await firestore
      .collection("VehiculosSLP")
      .doc(uid)
      .update(formObject)
      .catch(error => false);
    if (response !== false) {
      alert("Se ha actualizado el usuario de manera corrrecta.");
      await handleRefetch();
      hideDialog();
      return true;
    }
    throw new Error();

  } catch (error) {
    console.error("Se ha presentado un error al actualizar el registro, ", error);
    return false
  }
};

const deleteVehicleByID = async (uid) => {
  try {
    const response = await firestore
      .collection("VehiculosSLP")
      .doc(uid)
      .delete()
      .then(response => true)
      .catch(error => false);

    if (response) {
      alert("Se ha eliminado el vehículo seleccionado, de manera correcta.");
      await handleRefetch();
      return true;
    }

  } catch (error) {
    console.error("Se ha presentado un error al intentar eliminar el vehiculo seleccionado, ", error);
    alert("Se ha presentado un error al intentar eliminar el vehiculo seleccionado.");
    return false;
  }
};

const createNewVehicle = async () => {
  try {
    const formObject = formEntries.reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {});

    const todayDate = new Date().toISOString();

    formObject.fechaAlta = todayDate;
    formObject.fechaActualizacion = todayDate;

    const vehicleRef = await firestore.collection("VehiculosSLP").add(formObject);

    if (vehicleRef) {
      console.log("Vehículo creado:", vehicleRef.id);

      const uploadSuccess = await uploadImages(vehicleRef.id);

      if (uploadSuccess) {
        console.log("La carga de imágenes ha sido satisfactoria.");
      } else {
        console.log("Se ha presentado un error al cargar las imágenes.");
      }

      alert("Se ha creado el vehículo correctamente.");
      await handleRefetch();
      hideDialog();
      return;
    } else {
      throw new Error("No se pudo obtener referencia al vehículo creado.");
    }
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    alert("Se ha presentado un error al crear el vehículo.");
  }
};

const handleRefetch = async () => {
  cleanDataFromTable();
  await fetchingData();
};

const clearFormData = () => {
  formEntries.forEach(element => {
    element.value = "";
  })
};

vehicleForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const type = document.getElementById("form-button-submit").getAttribute("data-type");

  if (type === "add") {
    await createNewVehicle();
  }
  if (type === "update") {
    await updateVehicleByID();
  }
});

document.getElementById("form-button-cancel").addEventListener("click", () => hideDialog());
document.getElementById("button-add").addEventListener("click", () => showDialog("add"));

function showDialog(type) {
  if (type === "add") {
    modalTitle.innerText = "Alta de vehículo";
    submitText.innerText = "Dar de alta";
    document.getElementById("form-button-submit").setAttribute("data-type", "add");
    document.getElementById("form-dates").setAttribute("data-display", "none");
  } else {
    modalTitle.innerText = "Actualizar datos del vehículo";
    submitText.innerText = "Actualizar";
    document.getElementById("form-button-submit").setAttribute("data-type", "update");
    document.getElementById("form-dates").setAttribute("data-display", "block")
  }
  modalDialog.setAttribute("data-visibility", "visible");
};

function hideDialog() {
  modalDialog.setAttribute("data-visibility", "hidden");
  modalTitle.innerText = "";
  submitText.innerText = "";
  clearFormData();
  document.querySelectorAll("img.previewImage").forEach((element) => {
    element.src = "../assets/img/nopic.png"
  });
  modalDialog.setAttribute("data-reference", "");
  document.getElementById("form-dates").setAttribute("data-display", "none")
}

async function fetchingData() {
  const elements = await getAllVehicles();
  if (elements) {
    elements.forEach(e => {
      insertDataToTableBody(e);
    });

    vehiclesTable = new DataTable("#vehicle-list", {
      dom: "Bfrtip",
      buttons: [{
        "extend": "collection",
        "text": "Exportar",
        "buttons": ["excelHtml5", "pdfHtml5", "print"]
      }],
      "oLanguage": {
        "sSearch": "Busqueda:",
        "oPaginate": {
          "sFirst": "Primera",
          "sPrevious": "Anterior",
          "sNext": "Siguiente",
          "sLast": "Ultima"
        },
      },
      "language": {
        "info": "Se muestran los registros _START_ al _END_ de _TOTAL_. ",
        "infoEmpty": "No se muestran registros.",
        "emptyTable": "No se registran datos en la tabla.",
        "infoFiltered": "(Filtrado de _MAX_ registros)."
      }
    });
  }
};

const uploadImages = async (uid) => {
  try {
    const inputFiles = document.querySelectorAll("input[type='file'][name='urlfoto']");
    const imageList = [];

    for (let index = 0; index < inputFiles.length; index++) {
      const element = inputFiles[index];
      const archivo = element.files[0];

      if (archivo === null || archivo === undefined) {
        continue;
      }

      const reference = storage.ref().child(`VehiculosSLP/${uid}/` + archivo.name);
      await reference.put(archivo); 

      const url = await reference.getDownloadURL();  
      imageList.push(url);  
    }
 
    return imageList; 
  } catch (error) {
    console.error("Error al subir imagenes, ", error);
    return false;
  }
};

async function handleUpdateVehicle(e) {
  const uid = e.currentTarget.getAttribute("data-uid");
  modalDialog.setAttribute("data-reference", uid);
  showDialog();
  getVehicleByID(uid);
};

async function handleDeleteVehicle(e) {
  const uid = e.currentTarget.getAttribute("data-uid");
  await deleteVehicleByID(uid);
};

function cleanDataFromTable() {
  vehiclesTable.clear().destroy();
};

function elementSetAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};


document.querySelectorAll("input[type='file'][name='urlfoto']")
  .forEach((element, index) => {
    element.addEventListener("change", function () {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        const url = event.target.result;
        const dom = `previewfoto${index + 1}`
        document.getElementById(dom).src = url;
      }
      reader.readAsDataURL(file);
    })
  });

fetchingData(); 