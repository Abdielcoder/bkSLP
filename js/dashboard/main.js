import { totalDriversChart, activeDriversChart, padronChart, data as DT } from '../charts/charts.default.js';      
import { logs_accesos } from '../config/firestore-config.js';
  
const ctx = document.querySelector("canvas#myChart").getContext("2d");
const ctx2 = document.querySelector("canvas#myChart_2").getContext("2d");
const ctx3 = document.querySelector("canvas#myChart_3").getContext("2d");
const myChart = new Chart(ctx, totalDriversChart);
const myChart2 = new Chart(ctx2, activeDriversChart);
const myChart3 = new Chart(ctx3, padronChart);

const getDataTRips = () => { 
  document.querySelector("span#tripTotal").textContent = DT.tTrips;
  document.querySelector("span#tripCollection").textContent = `${formatCurrency(DT.tRefunds)}`;
  document.querySelector("span#tripAvgTrips").textContent = parseFloat(DT.tTrips / DT.rP).toFixed(2);
  document.querySelector("span#tripAvgCollection").textContent = `${formatCurrency((DT.tRefunds / DT.tTrips).toFixed(2))}`;
}

const showAccesos = async  () => {
  
  let ArrayRows = [];
  
  await logs_accesos.orderBy("fechaHora","desc").get().then((snap) => {
    ArrayRows = [];
    snap.forEach((ex) => { 
        ArrayRows.push(ex);
    });
    showAccesosHTML(ArrayRows);
  });
  
  new DataTable("#access-list", {
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


const showAccesosHTML = (arrayRows) => {
  
  const logTable = document.querySelector("table#access-list tbody");

  arrayRows.forEach(ix => {
    const item = {
      date: ix.data().fechaHora,
      user: ix.data().user,
      rol: ix.data().rol
    }
    const datetime = formatDate(item.date);
    const TR = `<tr>
        <td>${item.user}</td>
        <td>${item.rol}</td>
        <td>${datetime.date}</td>
        <td>${datetime.time}</td>
      </tr>`;
    logTable.insertAdjacentHTML("beforeend", TR);
  });
}

const formatDate = dx => {

  if(dx === undefined) return 'n/a';

  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

  if(dx.includes("T") === true) {
    const dateSplitted = dx.split("T");
    const d = {
      year: dateSplitted[0].split('-')[0],
      month: dateSplitted[0].split('-')[1],
      day: dateSplitted[0].split('-')[2],
      hour: dateSplitted[1].split(':')[0],
      min: dateSplitted[1].split(':')[1],
      seg: dateSplitted[1].split(':')[2].split('.')[0],
    }
    return {
      date: `${d.day} de ${MONTHS[parseInt(d.month) - 1]} del ${d.year}`,
      time: `${d.hour}:${d.min}:${d.seg}`
    }
  }
}

const formatCurrency = cx => {
  const coin = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  return coin.format(cx);
}
 
getDataTRips();
showAccesos(); 

  // DB_WORKING.on("child_added", snap => { 
  //   if(myChart2 !== undefined) return;
  //   const v = w.l;
  //   Object.assign(w, { l : v + 1 }); 
  //   myChart.data.datasets[0].data = [a.l, v + 1, d.l - (a.l + (v + 1))];
  //   myChart2.data.datasets[0].data = [a.l, v + 1];
  //   myChart.update();
  //   myChart2.update();
  // });

  // DB_WORKING.on("child_removed", snap => {
  //   const v = w.l;
  //   Object.assign(w, { l : v - 1 });
  //   myChart.data.datasets[0].data = [a.l, v - 1, d.l - (a.l + (v - 1))];
  //   myChart2.data.datasets[0].data = [a.l, v - 1];
  //   myChart.update();
  //   myChart2.update();
  // });
  
  // DB_ACTIVE.on("child_added", snap => {
  //   if(myChart2 !== undefined) return;
  //   const v = a.l;
  //   Object.assign(a, { l : v + 1 });
  //   myChart.data.datasets[0].data = [v + 1, w.l, d.l - ((v + 1) + w.l)];
  //   myChart2.data.datasets[0].data = [v + 1, w.l];
  //   myChart.update();
  //   myChart2.update();
  // });

  // DB_ACTIVE.on("child_removed", snap => {
  //   const v = a.l;
  //   Object.assign(a, { l : v - 1 });
  //   myChart.data.datasets[0].data = [v - 1, w.l, d.l - ((v - 1) + w.l)];
  //   myChart2.data.datasets[0].data = [v - 1, w.l];
  //   myChart.update();
  //   myChart2.update();
  // });

  // DB_DRIVER.on("child_added", snap => {    
  //   if(myChart !== undefined) return; 
  //   const v = d.l;
  //   Object.assign(d, { l: v + 1});
  //   myChart.data.datasets[0].data = [ a.l, w.l, (v + 1) - (a.l + w.l) ];
  //   myChart3.data.datasets[0].data = [d.l, (8000 - (v + 1))];
  // });

  // DB_DRIVER.on("child_removed", snap => {
  //   const v = d.l;
  //   Object.assign(d, { l: v - 1});
  //   myChart.data.datasets[0].data = [ a.l, w.l, (v - 1) - (a.l + w.l) ];
  //   myChart3.data.datasets[0].data = [d.l, (8000 - (v - 1))];
  // });
