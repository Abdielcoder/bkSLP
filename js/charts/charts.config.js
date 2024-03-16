
const barColors = {
  red: "#a42121c2",
  green: "#38a421c2",
  blue: "#2160a4c2",
  yellow: "#eeec37c2",
  violet: "#a4217dc2",
  gold: "#daa520c2",
  black: "#333333c2",
  orange: "#ffa500c2",

}

const horizontalLine = [{
  id: "horizontalLine",
  beforeDatasetsDraw(chart, args, options) {
    const {
      ctx,
      chartArea: { top, right, bottom, left, width, heigth },
      scales: { x, y } } = chart;

    ctx.save();

    //draw line
    ctx.strokeStyle = "#e215d2";
    ctx.setLineDash([10, 5]);
    ctx.lineWidth = 3;
    ctx.strokeRect(left, x.getPixelForValue(8000), width, 0);
    ctx.restore();
  }
}
];

const verticalLine = [{
  id: "verticalLine2",
  beforeDatasetsDraw(chart, args, options) {
    const {
      ctx, chartArea: { top, right, bottom, left, width, heigth },
      scales: { x, y } } = chart;

    ctx.save();
    ctx.strokeStyle = options.arbitraryLineColor;
    ctx.strokeRect(x.getPixelForValue(2), top, 0, heigth);
    ctx.restore();
  }
}
];

const yAxis1 = {
  indexAxis: 'y',
  scales: {
    y: {
      ticks: {
        beginAtZero: true
      },
      stacked: true,
      min: 0,
      max: 8000,
      display: false
    },
    x: {
      stacked: true,
      display: true,
      ticks: {
        stepSize: (8000 / 10)
      }
    }
  },
  plugins: {
    title: {
      display: true,
      text: "EMPADRONAMIENTO",
      padding: { top: 8, bottom: 8 },
      position: 'top',
      font: { size: 18, weight: 'bold', }
    },
    subtitle: {
      display: true,
      text: "Total de choferes registrados con base al registro de empadronamiento general.",
      font: { size: 14 },
      align: 'center',
      padding: { top: 0, bottom: 16 }
    },
    legend: {
      title: {
        display: true,
        text: "Choferes empadronados",
        padding: 10,
        font: { weight: 'bold', size: 14 }
      },
      display: true,
      position: 'bottom',
      align: 'center',
      labels: { padding: 10, textAlign: 'center' }
    }
  }
};

const yAxis2 = {
  indexAxis: 'y',
  scales: {
    y: {
      ticks: {
        beginAtZero: true
      },
      stacked: true,
      min: 0,
      max: 2125,
      display: false
    },
    x: {
      ticks: {
        stepSize: (1225 / 10)
      },
      stacked: true,
      display: true
    }
  },
  plugins: {
    title: {
      display: true,
      text: "PADRÓN",
      padding: { top: 8, bottom: 8 },
      position: 'top',
      font: { size: 18, weight: 'bold', }
    },
    subtitle: {
      display: true,
      text: [
        'Datos obtenidos de choferes registrados,',
        'los cuales han utilizado la app de Taximetro Digital para la realización de viajes.'
      ],
      font: { size: 14 },
      align: 'center',
      padding: { top: 0, bottom: 16 }
    },
    legend: {
      title: {
        display: true,
        text: "Han registrado viajes.",
        padding: { top: 8, bottom: 8 },
        font: { weight: 'bold', size: 14 }
      },
      display: true,
      position: 'bottom',
      align: 'center',
      labels: {
        padding: 10,
        textAlign: 'center'
      }
    }
  }
};

export const chart1 = {
  type: 'bar',
  data: {
    labels: ['Empadronamiento'],
    datasets: [
      {
        label: 'Registrados',
        data: [1225],
        backgroundColor: [barColors.violet],
        borderColor: [barColors.black],
        borderWidth: 1
      },
      {
        label: 'Faltantes',
        data: [5824],
        backgroundColor: [barColors.yellow],
        borderColor: [barColors.black],
        borderWidth: 1
      }
    ]
  },
  title: {
    display: true,
    text: "Empadronamiento General"
  },
  options: { ...yAxis1 }/*,
    plugins: [horizontalLine]*/
};

export const chart2 = {
  type: 'bar',
  data: {
    labels: ['Padrón General'/*, 'Padrón Real'*/],
    datasets: [
      {
        label: 'No',
        data: [(1225 - 995)],
        backgroundColor: [barColors.green],
        borderColor: [barColors.black],
        borderWidth: 1
      },
      {
        label: 'Si',
        data: [995],
        backgroundColor: [barColors.orange],
        borderColor: [barColors.black],
        borderWidth: 1
      }
    ]
  },
  options: { ...yAxis2 }/*,
    plugins: [horizontalLine]*/
};
