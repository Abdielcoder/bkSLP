import { all_roles } from "../config/config.js";

const roles_list = await all_roles();
const table_list = document.querySelector("table#roles-list tbody");

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
      const TR = document.createElement('TR');

      items.forEach(item => {
        const TD = document.createElement('TD');
        if (typeof item === 'boolean') {
          const CHECKBOX = document.createElement('input');
          CHECKBOX.setAttribute('type', 'checkbox');
          CHECKBOX.disabled = true;
          CHECKBOX.checked = item;

          TD.append(CHECKBOX);
          TR.append(TD);
          return;
        }
        TD.textContent = item;
        TR.append(TD);
      });

      table_list.insertAdjacentElement('beforeend', TR);

    });
    generateDataTable();
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
    alert("Se ha presentado un error, favor de verificarlo con el Administrador.")
  }
}

getAllData();

const generateDataTable = async () => {
  new DataTable("#roles-list", {
    info: false,
    paging: false,
    searching: false,
    buttons: false
  });
}
