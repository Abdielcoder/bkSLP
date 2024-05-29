const realtime = firebase.database().ref();

export const snap_drivers = realtime.child("Users/Drivers");
export const snap_working = realtime.child("drivers_working");
export const snap_active = realtime.child("active_drivers");
export const snap_trips = realtime.child("DriverTrip");

export const getFullDriverTripNodeData = async () => {
  const all_drivers = await snap_drivers.once("value").then((data) => Object.keys(data.val()).length);
  let trips_array = [];
  let total_trips = 0;
  let total_finished_trips = 0;
  let total_money_refunds = 0;

  await snap_trips.once("value", (doc) => {
    doc.forEach((obj) => {
      let driver_trips = [];
      let finished_trips = 0;
      let trips_refunds = 0;

      obj.forEach((itx) => {
        const i = itx.val();
        finished_trips = i.status === "finish" ? finished_trips + 1 : finished_trips;
        trips_refunds = i.tripCost !== undefined ? trips_refunds + i.tripCost : trips_refunds;
        driver_trips.push({
          dateEpoch: parseInt(itx.key.replace("-", "")),
          t: i,
        });
      });

      trips_array.push({
        trips: driver_trips,
        finishedTrips: finished_trips,
        refunds: trips_refunds,
      });

      total_trips = total_trips + driver_trips.length;
      total_finished_trips = total_finished_trips + finished_trips;
      total_money_refunds = total_money_refunds + trips_refunds;
    });
  });

  return {
    tRefunds: total_money_refunds,
    tTrips: total_trips,
    tFinished: total_finished_trips,
    data: [...trips_array],
    gP: all_drivers,
    rP: trips_array.length,
  };
};

 const driverTrips = async () => {
  const tripsData = [];

  await snap_trips.once("value").then(async (snap) => {
    await snap.forEach((ux) => {
      let driverTrips = [];
      let finishedTrips = 0;
      let tripCost = 0;

      ux.forEach((tx) => {
        finishedTrips = tx.val().status === "finish" ? finishedTrips + 1 : finishedTrips;
        const tC = tx.val().tripCost || 0;

        tripCost = tripCost + tC;
        const epoch = tx.key.replace("-", "");
        driverTrips.push({ epoch: parseInt(epoch), v: tx.val() });
      });

      tripsData.push({
        uid: ux.key,
        numTrips: driverTrips.length,
        finishedTrips: finishedTrips,
        tripCost: tripCost,
        trips: driverTrips,
      });
    });
  });

  return tripsData;
};

const driversArr = () => {
  return snap_drivers.once("value").then((dt) => {
    let a = [];
    dt.forEach((el) => {
      a.push({ uid: el.key, v: el.val() });
    });
    return { l: a.length, o: a };
  });
};

const workingArr = () => {
  return snap_working.once("value").then((dt) => {
    let a = [];
    dt.forEach((el) => {
      a.push({ uid: el.key, v: el.val() });
    });
    return { l: a.length, o: a };
  });
};

const activeArr = () => {
  return snap_active.once("value").then((dt) => {
    let a = [];
    dt.forEach((el) => {
      a.push({ uid: el.key, v: el.val() });
    });
    return { l: a.length, o: a };
  });
};

var d = await driversArr();
var a = await activeArr();
var w = await workingArr();
export var trip = await driverTrips();
export var data = await getFullDriverTripNodeData();
// export var dt = await driverTrips();

export const totalDriversChart = {
  type: "pie",
  data: {
    labels: ["Activos", "En servicio", "Inactivos"],
    datasets: [
      {
        label: "Num Datos",
        data: [a.l, w.l, d.l - (a.l + w.l)],
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

export const activeDriversChart = {
  type: "pie",
  data: {
    labels: ["Activos", "En servicio"],
    datasets: [
      {
        label: "Num Datos",
        data: [a.l, w.l],
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

export const padronChart = {
  type: "pie",
  data: {
    labels: ["Registrados", "No registrados"],
    datasets: [
      {
        label: "Num Datos",
        data: [d.l, 8000 - d.l],
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
