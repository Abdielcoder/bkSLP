const firestore = firebase.firestore();
const realtime = firebase.database().ref();
const conductoresReference = realtime.child("Users/Drivers");
const enServicioReference = realtime.child("drivers_working");
const activosReference = realtime.child("active_drivers");
const viajesReference = realtime.child("DriverTripTadi");

const getFullDriverTripNodeData = async (conductores) => {
  let tripsList = [];
  let totalTrips = 0;
  let totalTripsFinished = 0;
  let totalTripsRefunds = 0;

  await viajesReference.once("value", (snapshot) => {
    snapshot.forEach((document) => {
      let driverTrips = [];
      let finishedTrips = 0;
      let tripsRefunds = 0;

      document.forEach((trip) => {
        const { status, tripCost } = trip.val();
        finishedTrips = status === "finish" ? finishedTrips + 1 : finishedTrips;
        tripsRefunds = tripCost !== undefined ? tripsRefunds + tripCost : tripsRefunds;
        driverTrips.push({
          dateEpoch: parseInt(trip.key.replace("-", "")),
          t: trip,
        });
      });
      tripsList.push({
        trips: driverTrips,
        finishedTrips: finishedTrips,
        refunds: tripsRefunds,
      });

      totalTrips = totalTrips + driverTrips.length;
      totalTripsFinished = totalTripsFinished + finishedTrips;
      totalTripsRefunds = totalTripsRefunds + tripsRefunds;
    });
  });

  return {
    totalTripsRefunds,
    totalTrips,
    totalTripsFinished,
    data: tripsList,
    gP: conductores.length,
    rP: tripsList.length,
  };
};

const getAllDocumentsFromCollection = async (collection) =>
  await collection.once("value").then((snapshot) => {
    let array = [];
    snapshot.forEach((document) => {
      array.push({ uuid: document.key, ...document.val() });
    });
    return { length: array.length, list: array };
  });

const main = async () => {
  const conductoresData = await getAllDocumentsFromCollection(conductoresReference);
  const enServicioData = await getAllDocumentsFromCollection(enServicioReference);
  const activosData = await getAllDocumentsFromCollection(activosReference);
  const driverTrips = await getFullDriverTripNodeData(conductoresData);

  const totalDriversChart = {
    type: "pie",
    data: {
      labels: ["Activos", "En servicio", "Inactivos"],
      datasets: [
        {
          label: "Num Datos",
          data: [
            activosData.length,
            enServicioData.length,
            conductoresData.length - activosData.length - enServicioData.length,
          ],
          backgroundColor: ["#691c32", "#f5a43f", "#0C425A"],
        },
      ],
    },
    options: {
      plugins: {
        labels: {
          render: (args) => {
            return args.value;
          },
          fontColor: "#fff",
          fontStyle: "bold",
          position: "middle",
        },
        tooltip: { enabled: true },
        legend: {
          display: true,
          position: "right",
          title: { text: "Conductores", display: true, padding: 6, font: { size: 16 } },
          align: "center",
          labels: { font: { size: 12 } },
        },
      },
      layout: { autoPadding: true, padding: 16, fullSize: true },
    },
  };

  const activeDriversChart = {
    type: "pie",
    data: {
      labels: ["Activos", "En servicio"],
      datasets: [
        {
          label: "Num Datos",
          data: [activosData.length, enServicioData.length],
          backgroundColor: ["#691c32", "#0C425A"],
        },
      ],
    },
    options: {
      plugins: {
        labels: {
          render: (args) => {
            return `${args.percentage}%`;
          },
          precision: 2,
          position: "middle",
          fontColor: "#fff",
          fontStyle: "bold",
        },
        tooltip: { enabled: true },
        legend: {
          display: true,
          position: "right",
          title: { text: "Tipo", display: true, padding: 6, font: { size: 16 } },
          align: "center",
          labels: { font: { size: 12 } },
        },
      },
      layout: { autoPadding: true, padding: 16, fullSize: true },
    },
  };

  const padronChart = {
    type: "pie",
    data: {
      labels: ["Concesionarios", "Conductores"],
      datasets: [
        {
          label: "Num Datos",
          data: [conductoresData.length, conductoresData.length],
          backgroundColor: ["#0C425A", "#333"],
        },
      ],
    },
    options: {
      plugins: {
        labels: {
          precision: 2,
          fontColor: "#fff",
          fontStyle: "bold",
          position: "middle",
        },
        tooltip: { enabled: true },
        legend: {
          display: true,
          position: "right",
          title: { text: "En registro", display: true, padding: 6, font: { size: 16 } },
          align: "center",
          labels: { font: { size: 12 } },
        },
      },
      layout: { autoPadding: true, padding: 16, fullSize: true },
    },
  };
  document.querySelector("span#tripTotal").textContent = driverTrips.totalTrips;
  document.querySelector("span#tripCollection").textContent = `${formatCurrency(driverTrips.totalTripsRefunds)}`;
  document.querySelector("span#tripAvgTrips").textContent = parseFloat(driverTrips.totalTrips / driverTrips.rP).toFixed(
    2
  );
  document.querySelector("span#tripAvgCollection").textContent = `${formatCurrency(
    (driverTrips.totalTripsRefunds / driverTrips.totalTrips).toFixed(2)
  )}`;

  const ctx = document.querySelector("canvas#myChart").getContext("2d");
  const ctx2 = document.querySelector("canvas#myChart_2").getContext("2d");
  const ctx3 = document.querySelector("canvas#myChart_3").getContext("2d");
  const myChart = new Chart(ctx, totalDriversChart);
  const myChart2 = new Chart(ctx2, activeDriversChart);
  const myChart3 = new Chart(ctx3, padronChart);
};

const formatCurrency = (currencyString) => {
  const coin = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return coin.format(currencyString);
};
main();
