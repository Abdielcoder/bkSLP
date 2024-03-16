import { driversArr, workingArr, activeArr, driverTrips, getFullDriverTripNodeData } from '../config/config.js';

var d = await driversArr();
var a = await activeArr();
var w = await workingArr();
export var trip = await driverTrips();
export var data = await getFullDriverTripNodeData();
// export var dt = await driverTrips();

export const totalDriversChart = {
  type: "pie",
  data: {
    labels: ['Activos', 'En servicio', 'Inactivos'],
    datasets: [{
      label: 'Num Datos',
      data: [a.l, w.l, d.l - (a.l + w.l)],
      backgroundColor: ['#691c32', '#f5a43f', '#0C425A']
    }]
  },
  options: {
    plugins: {
      labels: {
        render: args => {
          return args.value
        },
        fontColor: "#fff",
        fontStyle: 'bold',
        position: 'middle'
      },
      tooltip: { enabled: true },
      legend: {
        display: true,
        position: 'right',
        title: { text: 'Conductores', display: true, padding: 6, font: { size: 16 } },
        align: 'center',
        labels: { font: { size: 12 } }
      }
    },
    layout: { autoPadding: true, padding: 16, fullSize: true }
  }
};

export const activeDriversChart = {
  type: "pie",
  data: {
    labels: ['Activos', 'En servicio'],
    datasets: [{
      label: 'Num Datos',
      data: [a.l, w.l],
      backgroundColor: ['#691c32', '#0C425A']
    }]
  },
  options: {
    plugins: {
      labels: {
        render: args => {
          return `${args.percentage}%`
        },
        precision: 2,
        position: 'middle',
        fontColor: "#fff",
        fontStyle: 'bold'
      },
      tooltip: { enabled: true },
      legend: {
        display: true,
        position: 'right',
        title: { text: 'Tipo', display: true, padding: 6, font: { size: 16 } },
        align: 'center',
        labels: { font: { size: 12 } }
      }
    },
    layout: { autoPadding: true, padding: 16, fullSize: true }
  }
};

export const padronChart = {
  type: "pie",
  data: {
    labels: ['Registrados', 'No registrados'],
    datasets: [{
      label: 'Num Datos',
      data: [d.l, (8000 - d.l)],
      backgroundColor: ['#0C425A', "#333"]
    }]
  },
  options: {
    plugins: {
      labels: {
        precision: 2,
        fontColor: "#fff",
        fontStyle: 'bold',
        position: 'middle'
      },
      tooltip: { enabled: true },
      legend: {
        display: true,
        position: 'right',
        title: { text: 'En registro', display: true, padding: 6, font: { size: 16 } },
        align: 'center',
        labels: { font: { size: 12 } }
      }
    },
    layout: { autoPadding: true, padding: 16, fullSize: true }
  }
};
