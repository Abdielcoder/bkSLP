import { generateDynamicUid, generateRandomPassword, removeRegisterFromAdminsTable, snap_admins } from "../config/config.js";
import { addEventLogListener } from "../config/firestore-config.js";
import { generateDataTable } from "../admin/users_admins.js";

let data_table = await generateDataTable();
const modal_container = document.querySelector("div.modal");
const add_button = document.querySelector("#add_button");
const update_button = document.querySelector("#update_button");
const del_button = document.querySelector("#del_button");
const close_modal_button = document.querySelector("div.close_modal");
const input_add_new = document.querySelector("#generate_new_user");
const form_header = document.querySelector("h1.form_header");

const createCheckboxInTableRow = async (uid, dataX) => {
  try {

    const trDom = data_table.row.add(["", ...dataX]).draw(false).node();
    trDom.setAttribute("class", "admin-row");
    trDom.setAttribute("data-reference", uid);
    const TR_CREATED = document.querySelector(`tr[data-reference="${uid}"].admin-row td`);
    const CHECKBOX = document.createElement("INPUT");
    CHECKBOX.setAttribute("type", "checkbox");
    CHECKBOX.setAttribute("class", "check_button");
    CHECKBOX.setAttribute("data-reference", uid);
    CHECKBOX.addEventListener("click", event => {
      const all_check_inputs = document.querySelectorAll(`input[type="checkbox"].check_button`);
      const cud_buttons = document.querySelectorAll("button.cup-button");
      all_check_inputs.forEach(button => {
        if (button.getAttribute("data-reference") !== uid) {
          button.checked = false;
          button.parentElement.parentElement.classList.remove("isSelected");
          return;
        }
        button.parentElement.parentElement.classList.add("isSelected");
      });
      if (CHECKBOX.checked === false) {
        cud_buttons.forEach((button, index) => {
          if (index !== 0) {
            button.disabled = true;
            return;
          }
        });

        event.currentTarget.parentElement.parentElement.classList.remove("isSelected");
        return;
      }

      cud_buttons.forEach((button, index) => {
        if (index !== 0) {
          button.disabled = false;
        }
      });
    });

    TR_CREATED.insertAdjacentElement("beforeend", CHECKBOX);

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

const createNewAdminUser = async (dataX) => {
  try {
    const uid = await generateDynamicUid();
    const generic_password = await generateRandomPassword();
    await snap_admins
      .child(uid)
      .set({
        name: dataX[0],
        email: dataX[1],
        rol: dataX[2],
        fechaAlta: dataX[3],
        activo: (() => {
          return dataX[4] === "Activo" ? true : false;
        })(),
        id: uid,
        photo: "",
        usuario: "",
        pswd: "0123456"
      })
      .then(async success => {
        const isCreated = await createCheckboxInTableRow(uid, dataX);
        if (isCreated === true) {
          alert("Se ha agregado el usuario de manera satisfactoria.");
          addEventLogListener(uid, "create", dataX);
        }
        disableUpButtons();
        removeIsSelectedClass();
      });
    modal_container.style.display = "none";
  } catch (err) {
    console.log(err)
    alert("Se ha presentado un error, favor de verificarlo con el administrador.");
  }
}

const updateAdminUser = async (uid, dataX) => {
  try {
    const objectToSet = {
      name: dataX[0],
      email: dataX[1],
      rol: dataX[2],
      fechaAlta: dataX[3],
      activo: dataX[4],
      id: uid
    };
    const hasBeenUpdated = await snap_admins.child(uid).update(objectToSet)
      .then(success => {
        alert("Los datos del usuario han sido actualizados de manera satisfactoria.");
        addEventLogListener(uid, "updated", dataX);
        return true;
      })
      .catch(error => {
        console.log(error.code);
        console.log(error.message);
        alert("Se ha presentado un problema, favor de verificarlo con el Administrador.")
        return false;
      });

    if (hasBeenUpdated === false) return;

    const tr_selected = document.querySelectorAll("tr.isSelected td");
    console.log({ tr_selected, objectToSet, dataX })
    tr_selected.forEach((item, index, val) => {
      if (index === 0) return;
      item.textContent = dataX[index - 1];
    });

    for (let i = 0; i < tr_selected.childElementCount; i++) {
      tr_selected.children[i].textContent = dataX[i];
    }

    modal_container.style.display = "none";

    disableUpButtons();
    removeIsSelectedClass();
  } catch (error) {
    console.log(error.code);
    console.log(error.message);
    alert("Se ha presentado un error, favor de verificarlo con el administrador.")
  }
}

const disableUpButtons = () => {
  const buttons = document.querySelectorAll("button.up-button");
  buttons.forEach(item => {
    item.disabled = true;
  })
}

const removeIsSelectedClass = () => {
  const table_rows = document.querySelectorAll("tr");
  table_rows.forEach(item => {
    item.classList.remove("isSelected");
  });
}

/* ELEMENTS FROM MODAL*/
add_button.addEventListener("click", event => {
  const label_active = document.querySelector("label#span_active_status");
  const form_inputs = document.querySelectorAll(".form_input");
  form_header.textContent = "Registrar usuario";
  input_add_new.setAttribute("data-event", "create");
  input_add_new.textContent = "Guardar";
  form_inputs.forEach((item, index) => {
    if (index === 4) {
      item.checked = false;
      label_active.textContent = "Inactivo"
      return;
    }
    item.value = "";
  });

  modal_container.style.display = "flex";
});

update_button.addEventListener("click", event => {
  try {
    const label_active = document.querySelector("label#span_active_status");
    const form_inputs = document.querySelectorAll(".form_input");
    const selected_row = document.querySelector("tr.isSelected");
    selected_row.childNodes.forEach((cell, index, val) => {
      console.log({ index, value: cell.textContent })
      if (index === 0) return;
      if (index === 5) {
        if (cell.textContent === "Activo") {
          form_inputs[index - 1].checked = true;
          label_active.textContent = "Activo"
          return;
        }
        form_inputs[index - 1].checked = true;
        label_active.textContent = "Inactivo"
        return;
      }
      form_inputs[index - 1].value = cell.textContent;
    });

    form_header.textContent = "Actualizar usuario";
    input_add_new.textContent = "Actualizar";
    input_add_new.setAttribute("data-event", "update");
    modal_container.style.display = "flex";
  } catch (err) {
    console.log(err.code);
    console.log(err.message)
    alert("Seleccione un registro para poder continuar.");
  }
});

del_button.addEventListener("click", async event => {
  try {
    const table_row = document.querySelector("tr.isSelected");
    const uid = table_row.getAttribute("data-reference");
    const confirm_message = "Se eliminará el registro completamente de la base de datos, ¿Desea continuar?."
    if (confirm(confirm_message)) {
      const hasBeenDeleted = await removeRegisterFromAdminsTable(uid);
      if (hasBeenDeleted === true) {
        data_table.row(".isSelected").remove().draw();
        disableUpButtons();
        removeIsSelectedClass();
        alert("Se ha eliminado el registro de manera satisfactoria.");

        addEventLogListener(uid, "deleted", { name: "boris" });
        return;
      }
      alert("Se ha presentado un problema, favor de verificarlo con el Administrador.")
    }
  } catch (error) {
    console.log(error)
    alert("Seleccione un registro para eliminar.")
  }
});

close_modal_button.addEventListener("click", event => {
  modal_container.style.display = "none";
});

input_add_new.addEventListener("click", event => {
  event.preventDefault();
  try {
    const isCorU = input_add_new.getAttribute("data-event");
    const form_inputs = document.querySelectorAll(".form_input");
    const form_data = [];

    form_inputs.forEach((item, index, val) => {
      if (item.type === "checkbox") {
        if (item.checked === true) {
          form_data.push("Activo");
          return;
        }
        form_data.push("Inactivo")
        return;
      }
      form_data.push(item.value);
    });

    if (isCorU === "create") {
      createNewAdminUser(form_data);
      return;
    }
    if (isCorU === "update") {
      const selectedRow = document.querySelector("tr.isSelected").getAttribute("data-reference");
      if (selectedRow !== undefined || selectedRow !== null) {
        updateAdminUser(selectedRow, form_data);
        return;
      }
      return;
    }

  } catch (err) {
    console.log(err);
    alert("Se ha presentado un problema, favor de verificarlo con el Administrador");
  }
});

document.addEventListener("keyup", ev => {
  if (ev.which === 27 && modal_container.style.display !== "none") {
    modal_container.style.display = "none";
  };
}); 
