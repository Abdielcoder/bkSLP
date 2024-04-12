import {
  getOperatorsList,
  guardaOperador,
  eliminaOperador,
  verOperador,
  actualizaOperador,
  getVehicles,
  resetPassword,
  firestore,
  storage
} from "../../js/config/config.js";

const monthStrings = [
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
  "Diciembre"
];

// Main Table
var usersTable = document.getElementById("operatorsTable");
var usersDataTableContext = null;
// Modal Dialogs
const modalDialogAdd = document.getElementById("usuariosAltaModal");
const modalDialogEdit = document.getElementById("usuariosEditModal");
const modalDialogDelete = document.getElementById("usuariosBajaModal");
// Modal Form (Add)
const modalForm = document.querySelector("form#userAlta");
const deleteForm = document.getElementById("userBaja");
// Modal Buttons
const userAddbutton = document.querySelector("button#userAdd");
const userAddSubmitButton = document.getElementById("modalFormSubmit");
const userUpdateButton = document.getElementById("modalFormUpdateSubmit");
const deleteCancelButton = document.getElementById("modalFormDeleteCancel");
let addCancelButton = document.querySelectorAll("button.modalFormCancel");

addCancelButton.forEach(element => {
  element.addEventListener("click", async () => {
    handleViewAltaModal(false);
    // await handleRefetchingData();
  });
});

userAddbutton.addEventListener("click", () => {
  document.getElementById("modalFormSubmit").style.display = "block";
  document.getElementById("modalFormUpdateSubmit").style.display = "none";
  document.querySelectorAll("button.tab-button").forEach(element => {
    const attribute = element.getAttribute("data-tab");
    if (attribute === "files" || attribute === "accounts") {
      element.style.display = "none";
    }
  })
  handleViewAltaModal(true);
});

deleteCancelButton.addEventListener("click", async () => {
  handleViewDeleteModal(false);
  // await handleRefetchingData();
});

userUpdateButton.addEventListener("click", async (e) => {
  await handleUpdateUserInformation(e);
});

function clearDataTable() {
  usersDataTableContext.clear().destroy();
};

async function handleRefetchingData() {
  clearDataTable();
  await fetchingData();
};

// Modal Add Form Submit Event
modalForm.addEventListener("submit", async (e) => await handleSubmit(e));
deleteForm.addEventListener("submit", async (e) => await handleDeleteSubmit(e));

function handleViewAltaModal(e) {
  if (e === true) {
    modalDialogAdd.classList.add("modalViewTrue");
    return;
  }
  document.querySelector("table#vehicles-list tbody").innerHTML = "";
  document.querySelector("div#vehiculos-searched").innerHTML = "";
  document.querySelector("input#placa").value = "";
  document.getElementById("usuariosAltaModal").setAttribute("data-reference", "");
  Object.entries(modalForm).forEach(item => {
    const element = item[1];
    const type = element.type;
    if (type === "text" || type === "email" || type === "tel") { element.value = ""; return; }
    if (type === "select-one" || type === "select") { element.value = "M"; return; }
    if (type === "checkbox") { element.checked = false; return; }
    document.querySelectorAll("button.tab-button").forEach(element => {
      if (element.getAttribute("data-tab") === "data") {
        element.setAttribute("aria-selected", "true");
        return;
      }
      element.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll("div.formContainer").forEach(element => {
      if (element.getAttribute("data-tabcontainer") === "data") {
        element.setAttribute("data-visibility", "true");
        return;
      }
      element.setAttribute("data-visibility", "false");
    })
    document.querySelectorAll("img.imagePreview").forEach(element => {
      element.src = "../assets/img/nopic.png";
    })
    return;
  });

  modalDialogAdd.classList.remove("modalViewTrue");
};

function handleViewEditModal(e) {
  if (e === true) {
    modalDialogEdit.classList.add("modalViewTrue");
    return;
  }
  modalDialogEdit.classList.remove("modalViewTrue");
};

function handleViewDeleteModal(e) {
  if (e === true) {
    modalDialogDelete.classList.add("modalViewTrue");
    return;
  }
  modalDialogDelete.classList.remove("modalViewTrue");
};

async function fetchingData() {
  const querySnapshots = await getOperatorsList();
  querySnapshots.forEach((doc) => {
    const document = doc.data();
    getDataFromDriversList(document);
  });

  usersDataTableContext = new DataTable(usersTable, {
    dom: 'Bfrtip',
    buttons: [
      {
        'extend': 'collection',
        'text': 'Exportar',
        'buttons': ['excelHtml5', 'pdfHtml5', 'print']
      }
    ],
    "oLanguage": {
      "sSearch": "Busqueda:",
      "oPaginate": {
        "sFirst": "Primera", // This is the link to the first page
        "sPrevious": "Anterior", // This is the link to the previous page
        "sNext": "Siguiente", // This is the link to the next page
        "sLast": "Ultima" // This is the link to the last page
      },
    },
    "language": {
      "info": "Se muestran los registros _START_ al _END_ de _TOTAL_. ",
      "infoEmpty": "No se muestran registros.",
      "emptyTable": "No se registran datos en la tabla.",
      "infoFiltered": "(Filtrado de _MAX_ registros)."
    }
  });
};

function getDataFromDriversList(list) {
  const cell_list = {
    uid: list.uid,
    cells: [
      list.nombreCompleto,
      list.sexo,
      list.correoElectronico,
      list.telefono,
      list.numeroEconomico,
      list.idTarjeton,
      formatDate(list.fechaAlta)
    ]
  }
  createRowToTable(cell_list);
};

const formatDate = (datetime) => {
  const [date, time] = datetime.slice(0, -5).split("T");
  const [year, month, day] = date.split("-");
  return day + " de " + monthStrings[parseInt(month) - 1] + " del " + year/* + " " + time.slice(0, -3)*/;
};

async function handleSubmit(e) {

  e.preventDefault();
  const targets = Object.entries(e.target).slice(0, -3);
  const values = targets.map((i, index) => {

    const name = i[1].name;
    let val = i[1].type === "checkbox"
      ? i[1].checked
      : i[1].value;

    return { [name]: val };
  });
  const isCreated = await guardaOperador(values);
  if (isCreated === false) return;
  await handleRefetchingData();
  handleViewAltaModal(false)
};

async function handleUpdateUserInformation(e) {
  const targets = modalForm.elements;
  const uid = document.getElementById("userAltaIdentifier").value;

  const values = Object.entries(targets)
    .map((i, index) => {
      if (!isNaN(i[0])) return null;
      const name = i[1].name;
      let val = i[1].type === "checkbox"
        ? i[1].checked
        : i[1].value;
      return { [name]: val };
    })
    .filter(i => i !== null)
    .slice(0, -3);

  const isUpdated = await actualizaOperador(values, uid);
  if (isUpdated === false) return;
  await handleRefetchingData();
  handleViewAltaModal(false);
};

async function handleDeleteSubmit(e) {
  e.preventDefault();

  const uid = document.getElementById("userDeleteIdentifier").value;
  const email = document.getElementById("userDeleteEmailId").value;
  const hasBeenDeleted = await eliminaOperador(uid, email);

  if (hasBeenDeleted === false) return;
  await handleRefetchingData();
  handleViewDeleteModal(false)
};

function createRowToTable(list) {
  const tableRow = document.createElement("tr");
  list.cells.forEach(item => {
    const tableCell = document.createElement("td");
    const cellNode = document.createTextNode(item);
    tableCell.appendChild(cellNode);
    tableRow.appendChild(tableCell);
  });

  const tools = createActionButtons(list.uid);
  tableRow.appendChild(tools);
  document.querySelector("table#operatorsTable tbody").insertAdjacentElement("beforeend", tableRow);
};

function createActionButtons(u) {

  const tableCell = document.createElement("td");
  // const viewButton = document.createElement("button");
  const resetPasswordButton = document.createElement("button");
  const updateButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  // const viewAttrs = { type: "button", class: "cellButtonTool", "data-type": "view", "data-id": u };
  const updateAttrs = { type: "button", class: "cellButtonTool", "data-type": "update", "data-id": u, title: "Editar" };
  const resetPasswordAttrs = { type: "button", class: "cellButtonTool", "data-type": "update", "data-id": u, title: "Reestablecer contraseña" };
  const deleteAttrs = { type: "button", class: "cellButtonTool", "data-type": "delete", "data-id": u, title: "Eliminar" };

  // elementSetAttributes(viewButton, viewAttrs);
  elementSetAttributes(updateButton, updateAttrs);
  elementSetAttributes(resetPasswordButton, resetPasswordAttrs);
  elementSetAttributes(deleteButton, deleteAttrs);
  elementSetAttributes(tableCell, { "data-type": "tools" });

  // viewButton.innerHTML = "Ver";
  updateButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c88528" d="M2.85 10.907l-.672 1.407L.033 17.26a.535.535 0 0 0 0 .368.917.917 0 0 0 .155.184.917.917 0 0 0 .184.155A.54.54 0 0 0 .56 18a.48.48 0 0 0 .18-.033l4.946-2.145 1.407-.672 8.53-8.53-4.244-4.243zM4.857 14l-1.515.657L4 13.143l.508-1.064 1.415 1.413zM16.707 5.537l-4.244-4.244.707-.707a2 2 0 0 1 2.83 0L17.414 2a2 2 0 0 1 0 2.83z"></path> </g></svg>`;
  resetPasswordButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.408 3.412a1.974 1.974 0 0 0 0-2.82 1.973 1.973 0 0 0-2.819 0l-.29.29-.59-.59a1.009 1.009 0 0 0-1.65.35l-.35-.35a1.004 1.004 0 1 0-1.42 1.42l.35.35a1.033 1.033 0 0 0-.58.58l-.35-.35a1.004 1.004 0 0 0-1.42 1.42L9.879 5.3l-3.02 3.01c-.01.01-.02.03-.03.04A4.885 4.885 0 0 0 5 8a5 5 0 1 0 5 5 4.885 4.885 0 0 0-.35-1.83c.01-.01.03-.02.04-.03l7.718-7.728zM5 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#287bc8" fill-rule="evenodd"></path> </g></svg>`
  deleteButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c84028" d="M13 18H5a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2zm3-15a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1z"></path> </g></svg>`;

  // viewButton.addEventListener("click", (e) => handleUpdateUser(e));
  updateButton.addEventListener("click", (e) => handleUpdateUser(e));
  resetPasswordButton.addEventListener("click", (e) => handleResetPassword(e.currentTarget.parentNode));
  deleteButton.addEventListener("click", (e) => handleDeleteUser(e, e.currentTarget.parentNode));

  // tableCell.insertAdjacentElement("beforeend", viewButton);
  tableCell.insertAdjacentElement("beforeend", updateButton);
  tableCell.insertAdjacentElement("beforeend", resetPasswordButton);
  tableCell.insertAdjacentElement("beforeend", deleteButton);

  return tableCell;
};

const handleResetPassword = async (e) => {
  if (confirm("Se le enviará al usuario un correo de reestablecimiento de contraseña, ¿Estas seguro de proceder con la acción?")) {
    {
      const tableRow = e.parentNode;
      const email = tableRow.childNodes[2].innerText;
      const hasBeenReseted = await resetPassword(email);
    }
  }
};

function elementSetAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

async function handleUpdateUser(e) {
  const uid = e.currentTarget.getAttribute("data-id");
  document.getElementById("usuariosAltaModal").setAttribute("data-reference", uid);
  document.getElementById("userAltaIdentifier").value = uid;
  document.getElementById("modalFormSubmit").style.display = "none";
  document.getElementById("modalFormUpdateSubmit").style.display = "block";
  document.querySelectorAll("button.tab-button").forEach(element => {
    element.style.display = "block";
  });
  handleViewAltaModal(true);
  await getOperatorByUid(uid);
};

function handleDeleteUser(e, node) {
  const uid = e.currentTarget.getAttribute("data-id");

  const tableRow = node.parentNode;
  const email = tableRow.childNodes[2].innerText;
  const input = document.getElementById("userDeleteIdentifier");
  const emailInput = document.getElementById("userDeleteEmailId");
  input.value = uid;
  emailInput.value = email;
  handleViewDeleteModal(true);
};

async function getOperatorByUid(uid) {
  let data = await verOperador(uid);
  let formEntries = Object.values(modalForm).filter(item => (item.type !== "button" && item.type !== "submit"));

  formEntries.forEach(element => {
    const { name, type } = element;
    if (type === "checkbox") {
      element.checked = data[name];
      return;
    }
    element.value = data[name];
    return;
  });

  // const listNames = Object.keys(data);    
  // const formElementNames = Object.keys(modalForm.elements);

  // const formElementValues = Object.values(modalForm.elements);

  // const newList = formElementNames
  //   .map((item, index) => listNames.includes(item)
  //     ? formElementValues[index]
  //     : null
  //   )
  //   .filter(item => item !== null);

  // newList.forEach(item => {
  //   const id = item.getAttribute("id");
  //   item.value = data[id];
  // });

  // const checkboxes = document.querySelectorAll("div.formGroup.checkboxForm>input[type=checkbox]")

  // checkboxes.forEach((item, index) => {
  //   item.checked = data.opcionesInclusividad[index];
  // })
};

const modalTabButtons = document.querySelectorAll("button.tab-button");

modalTabButtons.forEach((tab, index) => {
  tab.addEventListener("click", ({ currentTarget }) => {
    const nameTab = currentTarget.getAttribute("data-tab");
    const isSelected = currentTarget.getAttribute("aria-selected");
    if (isSelected == "true") {
      return false;
    }
    modalTabButtons.forEach(element => {
      if (element.getAttribute("aria-selected") == "true" || element.getAttribute("data-tab") !== nameTab) {
        element.setAttribute("aria-selected", "false")
        return;
      }
      element.setAttribute("aria-selected", "true");
    })
    // currentTarget.setAttribute("aria-selected", "true");
    // <div class="formContainer" data-tabcontainer="data" data-visibility="true">
    const tabContents = document.querySelectorAll("div.formContainer")
    tabContents.forEach(element => {
      element.setAttribute("data-visibility", "false");
      if (element.getAttribute("data-tabcontainer") == nameTab) {
        element.setAttribute("data-visibility", "true");
      }
    })
  })
});

document
  .querySelector(`button.tab-button[data-tab="files"]`)
  .addEventListener("click", async function (e) {
    const uid = document.getElementById("usuariosAltaModal").getAttribute("data-reference");
    console.log(uid)
    const storageReference = storage.ref().child("OperadoresSLP/" + uid);
    const result = await storageReference.listAll();
    if (result.items.length > 0) {
      const urls = await Promise.all(result.items.map(async (item) => {
        try {
          return await item.getDownloadURL();
        } catch (error) {
          console.log("error obteniendo url: ", error);
          return null
        }
      }));
      const files = urls.map(item => {
        return {
          url: item,
          name: item.split("%2F")[2].split("?")[0]
        }
      });

      document.querySelectorAll("img.imagePreview").forEach(element => {
        const { name, alt } = element;
        const currentFile = files.filter(item => item.name === alt);
        element.src = currentFile[0].url;

        element.addEventListener("click", function (e) {
          const modal = document.querySelector("div.modal-preview-image");
          modal.setAttribute("data-visibility", "visible");
          document.getElementById("full-width-preview-Image").src = currentFile[0].url;
        })
      });
    }
  });

document.querySelector("div.modal-bg").addEventListener("click", function (e) {
  const modal = e.target.parentNode;
  modal.setAttribute("data-visibility", "hidden");
})

document
  .querySelector(`button.tab-button[data-tab="accounts"]`)
  .addEventListener("click", async function (e) {
    const vehiclesFromUser = await getVehicles(document.getElementById("usuariosAltaModal").getAttribute("data-reference"));
    if (vehiclesFromUser === false) return;
    document.querySelector("table#vehicles-list tbody").innerHTML = "";
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");

    vehiclesFromUser.forEach((element, index) => {
      const { marca, modelo, placa } = element;
      console.log({ element });
      const tr = `
              <tr>
                <td>${index}</td>
                <td>${marca} ${modelo}</td>
                <td>${placa}</td>
              </tr>
              `;
      document.querySelector("table#vehicles-list tbody").insertAdjacentHTML("beforeend", tr)
    });
  });

window
  .addEventListener("DOMContentLoaded", async () => {
    await fetchingData();
    const year = new Date().getFullYear();
    document.getElementById("copyrightFooter").textContent = "\u00A9 " + year + " Copyright, TaximetroDigital."
  });


document.querySelectorAll("input.documentationFiles")
  .forEach((element, index) => {
    element.addEventListener("change", async function (e) {

      const file = e.target.files[0];
      const reader = new FileReader();
      const { name } = e.target;

      const responseUpload = await uploadImages(file, name);

      if (responseUpload) {

        reader.onload = function (event) {
          const url = event.target.result;
          const dom = name + "Preview";
          const imageDom = document.getElementById(dom);
          imageDom.src = url;

        }
        reader.readAsDataURL(file);
      }
    });
  });

const uploadImages = async (file, name) => {
  try {
    const uid = document.getElementById("usuariosAltaModal").getAttribute("data-reference");

    if (file === null || file === undefined) return;

    const reference = storage.ref().child(`OperadoresSLP/${uid}/` + name);
    await reference.put(file);

    const url = await reference.getDownloadURL();

    if (url) {
      console.log("Se ha cargado el archivo de manera correcta")
      return true;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("Error al subir imagenes, ", error);
    return false;
  }
};

document.getElementById("placa").addEventListener("keyup", async function (e) {
  try {
    if (e.code === "Enter") {
      const searchString = e.target.value;
      const response = await firestore
        .collection("VehiculosSLP")
        .where("placa", "==", searchString)
        .get()
        .then(snapshot => {
          const res = [];
          snapshot.forEach((doc) => { res.push({ id: doc.id, data: doc.data() }); });
          return res;
        });
      if (response) {

        const box = document.getElementById("vehiculos-searched");

        response.map((item, index) => {
          const { id } = item;
          const { marca, modelo, placa, propietario } = item.data;

          const noHasOwner = propietario === undefined || propietario === null || propietario === false || propietario === "";
          const list = document.createElement("div");
          list.setAttribute("class", "optionVehicle");
          const span = document.createElement("span");
          const button = document.createElement("button");
          button.setAttribute("type", "button");
          button.setAttribute("class", noHasOwner ? "botonAsignar" : "botonCheck");
          span.innerText = `${marca} ${modelo} - ${placa}`
          list.insertAdjacentElement("beforeend", span);

          if (noHasOwner === true) {
            button.addEventListener("click", async function (e) {

              const uid = document.getElementById("usuariosAltaModal").getAttribute("data-reference");

              if (confirm("Estas seguro de asignar este vehiculo al conductor?")) {
                await firestore
                  .collection("VehiculosSLP")
                  .doc(id)
                  .update({ propietario: uid })
                  .then(snapshot => {
                    alert("Se ha asignado el vehiculo al usuario.")
                  })
                  .catch(error => {
                    alert("Se ha presentado un error, favor de verificar con un administrador.")
                    console.error(error)
                  });
              }
            });
          }

          button.innerText = noHasOwner ? "Asignar" : "Asignado";

          list.insertAdjacentElement("beforeend", button);
          box.insertAdjacentElement("beforeend", list);
        });
      }
    }
  } catch (error) {
    console.log("Se ha presentado un error, ", error)
  }
}) 