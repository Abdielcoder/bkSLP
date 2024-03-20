import { all_admins } from "../config/config.js";

let admin_list = await all_admins();
const table_body = document.querySelector("table#admin_users-list tbody");

export const getDataFromAdminList = async () => {
  try {
    await admin_list.forEach(item => {
      const cell_list = [
        "",
        item.name,
        item.email,
        item.rol,
        item.date,
        (item.active === true || item.active === "true") ? "Activo" : "Inactivo"
      ]

      const TR = document.createElement("TR");

      cell_list.forEach((cell, index) => {

        const TD = document.createElement("TD");

        if (index === 0) {
          const CHECKBOX = document.createElement("INPUT");
          CHECKBOX.setAttribute("type", "checkbox");
          CHECKBOX.setAttribute("class", "check_button");
          CHECKBOX.setAttribute("data-reference", item.id);
          CHECKBOX.addEventListener("click", event => {
            const uid = item.id;
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
          TD.append(CHECKBOX);

          TR.append(TD);
          return;
        }
        TD.innerHTML = cell;
        TR.append(TD);
      });

      TR.setAttribute("class", "admin-row");
      TR.setAttribute("data-reference", item.id);

      table_body.insertAdjacentElement("beforeend", TR);
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}


export const generateDataTable = async () => {
  const isTableCreated = await getDataFromAdminList();
  if(isTableCreated) {

    return new DataTable("#admin_users-list", {
      
      "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
      dom: "Bfrtip",
      buttons: [
      {
        "extend": "collection",
        "text": "Exportar",
        "buttons": ["excelHtml5", "pdfHtml5", "print"]
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
}
}
