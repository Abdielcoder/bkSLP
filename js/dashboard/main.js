import { totalDriversChart, activeDriversChart, padronChart, data as DT } from "../charts/charts.default.js";

const firestore = firebase.firestore();
// import { logs_accesos } from "../config/firestore-config.js";

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
  document.querySelector("span#tripAvgCollection").textContent = `${formatCurrency(
    (DT.tRefunds / DT.tTrips).toFixed(2)
  )}`;
};

const showAccesos = async () => {
  await firestore
    .collection("loginAccesos")
    .orderBy("timestamp", "desc")
    .limit(20)
    .get()
    .then((snapshot) => {
      let array = [];
      snapshot.docs.forEach((document) => {
        array.push(document.data());
      });
      showAccesosHTML(array);
    });

  new DataTable("#access-list", {
    dom: "<'datatable-top'fB><'datatable-middle't><'datatable-bottom'lp>",
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

const showAccesosHTML = (documents) => {
  const table = document.querySelector("table#access-list tbody");

  documents.forEach((doc) => { 
    const trTag = document.createElement("tr");
    const emailTag = document.createElement("td");
    emailTag.innerHTML = doc.email;
    const dateTag = document.createElement("td");
    dateTag.innerHTML = doc.timestamp.split("T")[0];
    const timeTag = document.createElement("td");
    timeTag.innerHTML = doc.timestamp.split("T")[1].split(".")[0];
    const username = document.createElement("td");
    username.innerHTML = doc.username;
    trTag.append(emailTag);
    trTag.append(username);
    trTag.append(dateTag);
    trTag.append(timeTag);
    table.append(trTag);
  });
};
  
const formatCurrency = (cx) => {
  const coin = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return coin.format(cx);
};

getDataTRips();
showAccesos();
