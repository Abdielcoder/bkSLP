let drivers_list = await all_drivers();
let trips_list = await all_trips();
let driver_trips_concat = [];

let data_table = null;
/* DOM */

const table_drivers = document.querySelector("table#drivers-list"); 

const createRowToTable = (list) => {
  const TR = document.createElement('TR'); 
  list.cells.forEach(item => {

    const CELL = document.createElement('TD');
    const CELL_TEXT = document.createTextNode(item);
    CELL.appendChild(CELL_TEXT);
    TR.appendChild(CELL);
  });

  document.querySelector("table#drivers-list tbody").insertAdjacentElement('beforeend', TR);
}

const formatCurrency = cx => {
  const coin = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  return coin.format(cx);
}

const formatString = sx => {
  if (sx === undefined || sx === "") return 'n/a';
  return sx.toLowerCase();
}

const formatDate = (ex) => {
  if (ex === undefined || ex == "") return 'n/a';
  if (ex.includes('T')) return ex.split('T')[0];
  return ex;
}

export const getDataFromDriversList = (list) => {
  console.log(list);
  list.forEach(item => {

    const cell_list = {
      uid: item.id || "",
      cells: [
        item.nombreCompleto,
        item.sexo,
        item.correoElectronico,
        item.telefono,
        item.numeroEconomico,
        item.idTarjeton,
      ]
    }
    createRowToTable(cell_list);
  });

  new DataTable("#drivers-list", {
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

document.querySelector("button#dateSearch").addEventListener("click", ev => {
  const date_start = document.querySelector("input#dStart").value + " 00:00:00.000";
  const date_finish = document.querySelector("input#dEnd").value + " 23:59:59.999";
  const start = new Date(date_start).getTime();
  const end = new Date(date_finish).getTime();
  getDataByDatesInterval(start, end);
});

const getDataByDatesInterval = async (sx, fx) => {

  data_table.clear();
  driver_trips_concat.forEach(item => {
    if (item.trips !== 0) {
      const trip = item.trips.trips;
      const uidTrips = [];
      let tripCost = 0;
      let finishedTrips = 0;

      trip.forEach(itx => {
        if (itx.epoch >= sx && itx.epoch <= fx) {
          finishedTrips = itx.v.status === "finish" ? finishedTrips + 1 : finishedTrips;
          const tc = itx.v.tripCost || 0;
          tripCost = tripCost + tc;
          const timestamp = new Date(itx.epoch).toLocaleString();
          uidTrips.push({ data: itx, timestamp: timestamp });
        }
      });
      if (uidTrips.length !== 0) {
        data_table.row.add([
          formatString(item.driver.personal.name),
          formatString(item.driver.personal.phone),
          formatString(item.driver.personal.email),
          uidTrips.length,
          finishedTrips,
          formatCurrency(tripCost)
        ]).node().id = item.trips.uid;
        data_table.draw(false);
      }
    }
  });

}


// getOperatorsList();

// getDataFromDriversList(); 