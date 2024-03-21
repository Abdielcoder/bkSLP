import { all_roles, firestore } from "../config/config.js";

const roles_list = await all_roles();

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

const getAllData = async () => {
  try {
    await roles_list.forEach(dataX => {
      const items = [
        dataX.id,
        dataX.desc,
        dataX.canCreate,
        dataX.canUpdate,
        dataX.canDelete,
        dataX.isAdmin
      ];
      const TR = document.createElement("TR");

      items.forEach(item => {
        const TD = document.createElement("TD");
        if (typeof item === "boolean") {
          const CHECKBOX = document.createElement("input");
          CHECKBOX.setAttribute("type", "checkbox");
          CHECKBOX.disabled = true;
          CHECKBOX.checked = item;

          TD.append(CHECKBOX);
          TR.append(TD);
          return;
        }
        TD.textContent = item;
        TR.append(TD);
      });
      table_list.insertAdjacentElement("beforeend", TR);
    });
    return true;
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
    alert("Se ha presentado un error, favor de verificarlo con el Administrador.")
    return false;
  }
}

const generateDataTable = async () => {
  const table = document.getElementById("roles-list");
  const tableBody = document.querySelector("table#roles-list tbody");

  // Clear existing table
  tableBody.innerHTML = '';

  const tableData = await getRolesList();
  if (tableData) {
    tableData.forEach(item => {
      const TR = document.createElement("TR");
      Object.values(item).forEach((i, index) => {
        const TD = document.createElement("TD");
        if (index === 0) {
          const CHECKBOX = document.createElement("input");
          CHECKBOX.setAttribute("type", "checkbox");
          CHECKBOX.setAttribute("data-reference", i);
          CHECKBOX.setAttribute("data-index", "indexed")
          CHECKBOX.disabled = false;
          CHECKBOX.checked = false;
          CHECKBOX.addEventListener("change", function (e) {

            const allIndexedInputs = [];
            document
              .querySelectorAll("input[type='checkbox'][data-index='indexed']")
              .forEach(element => allIndexedInputs.push(element));
            allIndexedInputs.forEach((item) => {
              const reference = item.getAttribute("data-reference");
              if (reference === i) {
                item.checked = true;
                return;
              };
              item.checked = false;
            });
          })

          TD.append(CHECKBOX);
          TR.append(TD);
          return;
        }

        if (typeof i === "boolean" || i === null) {
          const ICON = i === true
            ? checkSuccessIcon
            : i === false
              ? checkFailureIcon
              : checkNullIcon;

          TD.insertAdjacentHTML("afterbegin", ICON);
          TD.setAttribute("style", "text-align: center;")
          TR.append(TD);
          return;
        }
        TD.textContent = i;
        TR.append(TD);
      })

      tableBody.insertAdjacentElement("beforeend", TR);
    });

    // Initialize DataTable after generating the table
    const dataTable = new DataTable(table);
  }
  // const table = document.getElementById("roles-list");
  // const tableBody = document.querySelector("table#roles-list tbody");

  // const tableData = await getRolesList();
  // if (tableData) {

  //   tableData.forEach(item => {
  //     const TR = document.createElement("TR");
  //     Object.values(item).forEach((i, index) => {
  //       const TD = document.createElement("TD");
  //       if (index === 0) {
  //         const CHECKBOX = document.createElement("input");
  //         CHECKBOX.setAttribute("type", "checkbox");
  //         CHECKBOX.setAttribute("data-reference", i);
  //         CHECKBOX.setAttribute("data-index", "indexed")
  //         CHECKBOX.disabled = false;
  //         CHECKBOX.checked = false;
  //         CHECKBOX.addEventListener("change", function (e) {

  //           const allIndexedInputs = [];
  //           document
  //             .querySelectorAll("input[type='checkbox'][data-index='indexed']")
  //             .forEach(element => allIndexedInputs.push(element));
  //           allIndexedInputs.forEach((item) => {
  //             const reference = item.getAttribute("data-reference");
  //             if (reference === i) {
  //               item.checked = true;
  //               return;
  //             };
  //             item.checked = false;
  //           });
  //         })

  //         TD.append(CHECKBOX);
  //         TR.append(TD);
  //         return;
  //       }

  //       if (typeof i === "boolean" || i === null) {
  //         const ICON = i === true
  //           ? checkSuccessIcon
  //           : i === false
  //             ? checkFailureIcon
  //             : checkNullIcon;

  //         TD.insertAdjacentHTML("afterbegin", ICON);
  //         TD.setAttribute("style", "text-align: center;")
  //         TR.append(TD);
  //         return;
  //       }
  //       TD.textContent = i;
  //       TR.append(TD);
  //     })

  //     tableBody.insertAdjacentElement("beforeend", TR);
  //   });

  //   const dataTable = new DataTable(table);
  // }
}

const getRolesList = async () => {
  try {
    const data = await firestore.collection("Roles").get().catch(error => false);
    if (data) {
      let rolesList = [];
      data.forEach((document) => {
        const { description, maps, role, roles, tarifas, users, vehicles, stats } = document.data();
        const permisosMapa = Object.values(maps);
        const permisosRoles = Object.values(roles);
        const permisosTarifas = Object.values(tarifas);
        const permisosVehiculos = Object.values(vehicles);
        const permisosConductores = Object.values(users);
        rolesList.push({
          uid: document.id,
          role,
          description,
          stats,
          permisosMapa: permisosMapa.every(i => i === true) ? true : permisosMapa.every(i => i === false) ? false : null,
          permisosConductores: permisosConductores.every(i => i === true) ? true : permisosConductores.every(i => i === false) ? false : null,
          permisosVehiculos: permisosVehiculos.every(i => i === true) ? true : permisosVehiculos.every(i => i === false) ? false : null,
          permisosRoles: permisosRoles.every(i => i === true) ? true : permisosRoles.every(i => i === false) ? false : null,
          permisosTarifas: permisosTarifas.every(i => i === true) ? true : permisosTarifas.every(i => i === false) ? false : null,
        });
      });

      return Object.values(rolesList);
    }
  } catch (error) {
    console.error("Se presentó un error al obtener la lista de roles, ", error);
    return false;
  }
};


generateDataTable();
const editButton = document.getElementById("button-edit-role");

editButton.addEventListener("click", function (e) {
  const allIndexedInputs = [];
  document.querySelectorAll("input[type='checkbox'][data-index='indexed']").forEach(element => allIndexedInputs.push(element));

  if (allIndexedInputs.every(item => item.checked === false)) {
    alert("Seleccione un ROL dentro de la tabla para poder continuar.");
    return
  }
  const [reference] = allIndexedInputs.map(item => {
    if (item.checked) {
      return item.getAttribute("data-reference");
    }
    return null;
  }).filter(i => i !== null);

  openModal(reference);
});

const closeModal = () => {
  const MODAL = document.getElementById("modalDialog");
  MODAL.setAttribute("data-visibility", "hidden");
  MODAL.setAttribute("data-reference", "null");
}

const openModal = async (reference) => {
  const MODAL = document.getElementById("modalDialog");
  MODAL.setAttribute("data-visibility", "visible");
  MODAL.setAttribute("data-reference", reference);

  const data = await getIndividualRoleData(reference);

  const formData = document.querySelector("form#form-roles");

  let dataObject = {};

  Object.entries(data).forEach(([name, value]) => {
    if (typeof value === "string" || typeof value === "boolean") {
      Object.assign(dataObject, { [name]: value });
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(subItem => {
        Object.assign(dataObject, { [name + "-" + subItem[0]]: subItem[1] });
      });
    }
  });

  Object.values(formData).forEach(input => {
    if (input.type === "text") {
      input.value = dataObject[input.name];
    }
    if (input.type === "checkbox") {
      input.checked = dataObject[input.name];
    }
  })
  console.log({ dataObject, formData: Object.values(formData) });
}

document
  .querySelector("div.dialogBackground")
  .addEventListener("click", closeModal);

document
  .querySelector("button.modal-back-button")
  .addEventListener("click", closeModal);

const getIndividualRoleData = async (reference) => {
  return await firestore
    .collection("Roles")
    .doc(reference)
    .get()
    .then(response => {
      if (response.exists) {
        return response.data();
      }
    }).catch(error => false);
}

const updateRoles = async (e, ref) => {
  let firestoreObject = {};
  const roles = {};
  const tarifas = {};
  const users = {};
  const vehicles = {};
  const maps = {};
  e.forEach(item => {
    const { name, value, checked, type } = item;
    if (type === "checkbox") {
      if (name.includes("maps")) {
        Object.assign(maps, ({ [name.split("-")[1]]: checked }));
        return;
      }
      if (name.includes("roles")) {
        Object.assign(roles, ({ [name.split("-")[1]]: checked }));
        return;
      }
      if (name.includes("tarifas")) {
        Object.assign(tarifas, { [name.split("-")[1]]: checked });
        return;
      }
      if (name.includes("users")) {
        Object.assign(users, { [name.split("-")[1]]: checked });
        return;
      }
      if (name.includes("vehicles")) {
        Object.assign(vehicles, { [name.split("-")[1]]: checked });
        return;
      }
      Object.assign(firestoreObject, { [name]: checked });
      return;
    }
    const _object = { [name]: value };
    Object.assign(firestoreObject, _object);
    return;
  });
  Object.assign(firestoreObject, { roles, tarifas, users, vehicles, maps })

  const response = await firestore
    .collection("Roles")
    .doc(ref)
    .update(firestoreObject)
    .then(snapshot => { return true; })
    .catch(error => { return false; });

  if (response) {
    alert("Se ha actualizado el rol de manera correcta");
    closeModal();
    generateDataTable();
    return;
  }
  alert("Se ha presentado un error al actualizar.");
}

const formContent = document.querySelector("form#form-roles");
formContent.addEventListener("submit", async function (e) {
  e.preventDefault();
  const arrayForm = Object.values(e.target).filter(item => (item.type !== "button" && item.type !== "submit"));

  const MODAL = document.getElementById("modalDialog").getAttribute("data-reference");
  await updateRoles(arrayForm, MODAL);
});