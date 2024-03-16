import { all_clients } from "../config/config.js";

const clients_list = await all_clients();
const table_list = document.querySelector("table#clients-list tbody");

const getAllData = () => {
  try {

    clients_list.forEach(item => {

      const item_list = [
        item.id,
        item.name,
        item.email
      ];

      const TR = document.createElement('TR');

      item_list.forEach((dataX, index) => {
        if (index === 0) {
          TR.setAttribute('data-reference', item);
          return;
        }
        const TD = document.createElement("TD");
        TD.textContent = dataX;
        TR.append(TD);
      });

      table_list.insertAdjacentElement('beforeend', TR);
    });
    generateDataTable();

  } catch (err) {
    console.log(err.code);
    console.log(err.message);
    alert("Se ha presentado un error al cargar los datos, favor de verificarlo con el Administrador.");
  }
}

const generateDataTable = async () => {
  new DataTable("#clients-list", {

    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
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
}

getAllData();