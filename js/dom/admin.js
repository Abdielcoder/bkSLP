import {
  firestore,
  auth,
  getDocumentByUid,
  deleteDocumentByUid,
  updateDocumentByUid,
  getDocumentsFromCollection,
  resetPasswordToUser,
} from "../config/config.js";

const MODAL_DIALOG = document.querySelector("div.modal-dialog");
const BUTTON_ADD = document.querySelector("button#button-add");
const BUTTON_CLOSE_MODAL = document.querySelectorAll(".close-modal");
const FORM_ADMINISTRADORES = document.querySelector("form#administradores");
const TABLE_ADMINISTRADORES = document.querySelector(
  "table#table-administradores"
);
let usersDataTableContext = null;
let rolesList = [];
let CONTEXT = [];

const fetchData = async () => {
  TABLE_ADMINISTRADORES.children[1].innerHTML = "";
  const data = await getDocumentsFromCollection("administradores");
  const objectData = destructureDataFromCollection(data);

  usersDataTableContext = new DataTable(TABLE_ADMINISTRADORES, {
    dom: "Bfrtip",
    buttons: [
      {
        extend: "collection",
        text: "Exportar",
        buttons: ["excelHtml5", "pdfHtml5", "print"],
      },
    ],
    oLanguage: {
      sSearch: "Busqueda:",
      oPaginate: {
        sFirst: "Primera", // This is the link to the first page
        sPrevious: "Anterior", // This is the link to the previous page
        sNext: "Siguiente", // This is the link to the next page
        sLast: "Ultima", // This is the link to the last page
      },
    },
    language: {
      info: "Se muestran los registros _START_ al _END_ de _TOTAL_. ",
      infoEmpty: "No se muestran registros.",
      emptyTable: "No se registran datos en la tabla.",
      infoFiltered: "(Filtrado de _MAX_ registros).",
    },
  });
};

const destructureDataFromCollection = (data) => {
  const arrayElements = [];
  data.forEach((document) => {
    getDataFromAdminList({ ...document.data(), uid: document.id });
    arrayElements.push({ ...document.data(), uid: document.id });
  });

  CONTEXT = arrayElements;

  return arrayElements;
};

const createAdminUser = async () => {
  try {
    const formObject = Object.values(FORM_ADMINISTRADORES).reduce(
      (acc, item) => {
        acc[item.name] = item.value;
        return acc;
      },
      {}
    );

    const usernameExists = CONTEXT?.some(
      (item) => item.usuario === formObject.usuario
    );
    if (usernameExists) {
      alert(
        "El usuario [" +
          formObject.usuario +
          "] ya existe, favor de seleccionar otro nombre de usuario"
      );
      return;
    }
    if (Object.values(formObject).some((item) => item === "")) {
      alert("No dejar espacios vacios");
      return;
    }

    const todayDate = new Date().toISOString();

    formObject.fechaAlta = todayDate;
    formObject.fechaActualizacion = todayDate;

    const { status, code, user } = await auth
      .createUserWithEmailAndPassword(formObject.email, "1234abcd")
      .then((userCredentials) => {
        Object.assign(formObject, { uuid: userCredentials.user.uid });
        return {
          status: 200,
          user: userCredentials.user,
        };
      })
      .catch((error) => {
        return {
          status: 500,
          code: error.code,
        };
      });
    if (status === 200) {
      console.log(formObject);
      const userReference = await firestore
        .collection("administradores")
        .add(formObject);

      if (userReference) {
        alert("Se ha creado el usuario correctamente.");
        await resetPasswordToUser(formObject.email);
        await hideModal(true);
      } else {
        throw new Error("No se pudo obtener referencia al vehículo creado.");
      }

      if (status === 500) {
        switch (code) {
          case "auth/email-already-in-use":
            window.alert(
              "El correo '" +
                formObject.email +
                "' ya se encuentra registrado en el sistema, favor de introducir un correo distinto."
            );
            break;
          case "auth/invalid-email":
            window.alert("Corréo invalido, pruebe con otro.");
            break;
          case "auth/operation-not-allowed":
            window.alert(
              "Se ha presentado un error en el registro, favor de verificar con un administrador."
            );
            break;
          default:
            window.alert(
              "Se ha presentado un error, favor de verificar los datos introducidos."
            );
            break;
        }
        return false;
      }
    }
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Se ha presentado un error al crear el vehículo.");
    await hideModal(false);
  }
};

function getDataFromAdminList(list) {
  const cell_list = {
    uid: list.uid,
    cells: [
      list.nombre,
      list.email,
      list.usuario,
      list.departamento,
      rolesList.filter((item) => item.uid === list.rolClave)[0]?.nombre || "",
      formatDateFromIsoString(list.fechaAlta),
    ],
  };
  createRowToTable(cell_list);
}

const formatDateFromIsoString = (value) => {
  const dateValue = new Date(value);
  const [day, month, year] = dateValue.toLocaleDateString("es-MX").split("/");
  const time = dateValue.toLocaleTimeString("es-MX", { hour12: true });
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

const handleRefetch = async () => {
  cleanDataFromTable();
  await fetchData();
};

function cleanDataFromTable() {
  usersDataTableContext.clear().destroy();
}

function showModal(type) {
  MODAL_DIALOG.classList.add("expanded");
  MODAL_DIALOG.setAttribute("data-submit", type);

  if (type === "add") {
    document.querySelector("div.modal-dialog h4.header-title").innerHTML =
      "Alta Administrador";
    document.querySelector("button.submit-button").innerHTML = "CREAR";
    document.querySelector("form#administradores>h4.row-title").innerHTML =
      "Da de alta un administrador Backoffice";
    return;
  }
  document.querySelector("div.modal-dialog h4.header-title").innerHTML =
    "Actualizar Administrador";
  document.querySelector("button.submit-button").innerHTML = "ACTUALIZAR";
  document.querySelector("form#administradores>h4.row-title").innerHTML =
    "Actualiza la informacion del administrador Backoffice";
}

async function hideModal(refetch = false) {
  MODAL_DIALOG.classList.remove("expanded");
  MODAL_DIALOG.setAttribute("data-submit", null);
  MODAL_DIALOG.setAttribute("data-document", null);
  if (refetch === true) {
    await handleRefetch();
  }
}

BUTTON_ADD.addEventListener("click", async () => showModal("add"));

BUTTON_CLOSE_MODAL.forEach((element) => {
  element.addEventListener("click", async () => hideModal(false));
});

document
  .querySelector("button.submit-button")
  .addEventListener("click", async function (e) {
    const type = document
      .querySelector("div.modal-dialog")
      .getAttribute("data-submit");
    if (type === "add") {
      const response = await createAdminUser(Object.entries(e.target));
      if (response) {
        hideModal(true);
      }
      return;
    }
    const uid = MODAL_DIALOG.getAttribute("data-document");
    const targets = Object.values(FORM_ADMINISTRADORES);
    const values = targets.map((i) => {
      return { [i.name]: i.value };
    });
    const response = await updateDocumentByUid(values, uid, "administradores");
    if (response) {
      hideModal(true);
    }
  });

function createRowToTable(list) {
  const tableRow = document.createElement("tr");
  list.cells.forEach((item) => {
    const tableCell = document.createElement("td");
    const cellNode = document.createTextNode(item);
    tableCell.appendChild(cellNode);
    tableRow.appendChild(tableCell);
  });

  const tools = createActionButtons(list.uid);
  tableRow.appendChild(tools);
  document
    .querySelector("table#table-administradores tbody")
    .insertAdjacentElement("beforeend", tableRow);
}

function createActionButtons(uid) {
  const tableCell = document.createElement("td");
  // const viewButton = document.createElement("button");
  // const resetPasswordButton = document.createElement("button");
  const updateButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  // const viewAttrs = { type: "button", class: "cellButtonTool", "data-type": "view", "data-id": u };
  const updateAttrs = {
    type: "button",
    class: "cellButtonTool",
    "data-type": "update",
    "data-id": uid,
    title: "Editar",
  };
  // const resetPasswordAttrs = {
  //   type: "button",
  //   class: "cellButtonTool",
  //   "data-type": "update",
  //   "data-id": u,
  //   title: "Reestablecer contraseña",
  // };
  const deleteAttrs = {
    type: "button",
    class: "cellButtonTool",
    "data-type": "delete",
    "data-id": uid,
    title: "Eliminar",
  };

  // elementSetAttributes(viewButton, viewAttrs);
  elementSetAttributes(updateButton, updateAttrs);
  // elementSetAttributes(resetPasswordButton, resetPasswordAttrs);
  elementSetAttributes(deleteButton, deleteAttrs);
  elementSetAttributes(tableCell, { "data-type": "tools" });

  // viewButton.innerHTML = "Ver";
  updateButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c88528" d="M2.85 10.907l-.672 1.407L.033 17.26a.535.535 0 0 0 0 .368.917.917 0 0 0 .155.184.917.917 0 0 0 .184.155A.54.54 0 0 0 .56 18a.48.48 0 0 0 .18-.033l4.946-2.145 1.407-.672 8.53-8.53-4.244-4.243zM4.857 14l-1.515.657L4 13.143l.508-1.064 1.415 1.413zM16.707 5.537l-4.244-4.244.707-.707a2 2 0 0 1 2.83 0L17.414 2a2 2 0 0 1 0 2.83z"></path> </g></svg>`;
  // resetPasswordButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.408 3.412a1.974 1.974 0 0 0 0-2.82 1.973 1.973 0 0 0-2.819 0l-.29.29-.59-.59a1.009 1.009 0 0 0-1.65.35l-.35-.35a1.004 1.004 0 1 0-1.42 1.42l.35.35a1.033 1.033 0 0 0-.58.58l-.35-.35a1.004 1.004 0 0 0-1.42 1.42L9.879 5.3l-3.02 3.01c-.01.01-.02.03-.03.04A4.885 4.885 0 0 0 5 8a5 5 0 1 0 5 5 4.885 4.885 0 0 0-.35-1.83c.01-.01.03-.02.04-.03l7.718-7.728zM5 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#287bc8" fill-rule="evenodd"></path> </g></svg>`;
  deleteButton.innerHTML = `<svg width="16px" height="16px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#c84028" d="M13 18H5a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2zm3-15a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1z"></path> </g></svg>`;

  updateButton.addEventListener(
    "click",
    async (e) => await handleUpdateUser(uid)
  );
  // resetPasswordButton.addEventListener("click", (e) =>
  //   handleResetPassword(e.currentTarget.parentNode)
  // );
  deleteButton.addEventListener("click", (e) => handleDeleteUser(uid));

  // tableCell.insertAdjacentElement("beforeend", viewButton);
  tableCell.insertAdjacentElement("beforeend", updateButton);
  // tableCell.insertAdjacentElement("beforeend", resetPasswordButton);
  tableCell.insertAdjacentElement("beforeend", deleteButton);

  return tableCell;
}

async function handleUpdateUser(uid) {
  showModal("update");
  MODAL_DIALOG.setAttribute("data-document", uid);
  let data = await getDocumentByUid(uid, "administradores");
  const rolClave = data.rolClave;
  document.querySelector("select#rolClave").value = rolClave;
  let formEntries = Object.values(FORM_ADMINISTRADORES).filter(
    (item) => item.type !== "button" && item.type !== "submit"
  );

  formEntries.forEach((element) => {
    element.value = data[element.name] || "";
  });
}

async function handleDeleteUser(uid) {
  const message = "Estas seguro de eliminar a este usuario?";
  if (confirm(message)) {
    const response = await deleteDocumentByUid(uid, "administradores");
    if (response) {
      await hideModal(true);
    }
  }
}

function elementSetAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

const getRolesList = async () => {
  try {
    const selectElement = document.querySelector("select#rolClave");
    const roles = await getDocumentsFromCollection("roles");
    roles.forEach((document) => {
      const optionElement =
        "<option value='" +
        document.id +
        "'>" +
        document.data().nombre +
        "</option>";
      selectElement.insertAdjacentHTML("beforeend", optionElement);
      rolesList.push({ uid: document.id, ...document.data() });
    });
  } catch (error) {
    console.error("No se pudo obtener datos de roles", error);
  }
};

// document
//   .querySelector("input#nombre")
//   .addEventListener("input", userNameGenerator);

// function userNameGenerator(e) {
//   let value = e.target.value;
//   e.target.value = value.replace(/[^a-zA-Z ]/g, "");
//   let username = value.replaceAll(/[ .]+/g, ".");
//   const split = username.split(".");
//   username = split[0].slice(0, 1) + (split[2] || "user") + ".admin";
//   document.querySelector("#usuario").value = username;
// }

getRolesList();
fetchData();
