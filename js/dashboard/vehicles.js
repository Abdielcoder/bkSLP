import { snap_vehicles, all_vehicles } from "../config/config.js";

let vehicle_list = await all_vehicles();
let isNew = false;
const table_list = document.querySelector("table#vehicle-list tbody");

snap_vehicles.on("child_added", snap => {
  if (isNew === false) return;
  console.log(snap.val());
});

snap_vehicles.once("value", snap => {

  isNew = true;

  snap.forEach(item => {
    const uid = item.key;
    const i = item.val()
    const __item = {
      id: uid,
      color: (() => {
        return i.color.toLowerCase() === undefined ? 'n/a' : i.color.toLowerCase();
      })(),
      delegation: i.delegacionID,
      folio: i.folio.toLowerCase(),
      brand: i.marca.toLowerCase(),
      model: i.modelo,
      num_economic: i.numero_economico.toUpperCase(),
      plate: i.placa.toLowerCase(),
      badge_city: i.tarjeton_ciudad.toLowerCase(),
      service: i.tipo.toLowerCase(),
      type: i.tipo_vehiculo.toLowerCase()
    }
    createRowFromData(__item);
  });

}).then(success => {
  new DataTable("#vehicle-list", {
    dom: 'Bfrtip',
    buttons: [{
      'extend': 'collection',
      'text': 'Exportar',
      'buttons': ['excelHtml5', 'pdfHtml5', 'print']
    }],
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
});

const createRowFromData = (i) => {

  const ROW = document.createElement('TR');
  const CELL_LIST = [i.plate, i.num_economic, i.brand, i.model, i.color, i.type, i.service];
  CELL_LIST.forEach(item => {
    const CELL = document.createElement('TD');
    CELL.textContent = item.toLowerCase();
    ROW.append(CELL);
  });

  ROW.addEventListener("click", e => {
    const self = e.currentTarget;
    showDataFromElement(self);
  });

  table_list.insertAdjacentElement("beforeend", ROW);
}

const showDataFromElement = (e) => {
  console.log(e);
  console.log(e.children)
}