import { snap_tarifas, snap_admins, get_tarifas, snap_flag_rates } from '../config/config.js';
import { getRateChangeLogs } from '../config/firestore-config.js'

let change_logs = await getRateChangeLogs();
let tarifas = await get_tarifas();
let data_table = null;
var infoPrevio;
var AWS_TO_ADDRESS = [];

// snap_admins.once('value', async snap =>{
//     AWS_TO_ADDRESS = [];
//     const USER = await snap.val();
//     for (e in USER) {
//         if (USER[e].rol == "validador" && USER[e].activo == "true") {
//             AWS_TO_ADDRESS.push(USER[e].email);
//             console.log(USER);
//         }
//     }
// });  


const showTarifaBase = (city) => {
  snap_tarifas.child(city).once('value', snap => {
    const tarifas = snap.val();

    // Mostrar los valores en los campos del formulario
    document.querySelector("input[data-name='banderaDiurna']").value = tarifas.banderaDiurna;
    document.querySelector("input[data-name='banderaNocturna']").value = tarifas.banderaNocturna;
    document.querySelector("input[data-name='kilometro']").value = tarifas.kilometro;
    document.querySelector("input[data-name='min']").value = tarifas.min;
    // Asumiendo que tienes campos para las tarifas de la app también
    document.querySelector("input[data-name='banderaDiurnaApp']").value = tarifas.banderaDiurnaApp;
    document.querySelector("input[data-name='banderaNocturnaApp']").value = tarifas.banderaNocturnaApp;
    document.querySelector("input[data-name='kilometroApp']").value = tarifas.kilometroApp;
    document.querySelector("input[data-name='minApp']").value = tarifas.minApp;
    // Asumiendo que tienes un campo para el porcentaje de viaje largo
    // document.querySelector("input[data-name='extra_long_km_trip']").value = calcularPorcentajeExtra(tarifas.kilometro, tarifas.kilometroApp);
    // document.querySelector("input[data-name='extra_long_min_trip']").value = calcularPorcentajeExtra(tarifas.min, tarifas.minApp);
  });
};

const formatName = (fx, dx, tx) => {

  fx = fx.includes("B") ? "initial" : fx.toLowerCase();
  dx = dx.toLowerCase();
  tx = tx.toLowerCase();

  return `${fx}_${dx}_${tx}`
}

const showInfoHTML = ix => {
  const DOM = document.querySelector(`input[data-name=${ix.name}]`);
  if (DOM !== null) DOM.value = `$ ${ix.val}.00`;
}

const getAllRatesChangeLogs = async (isCreated) => {

  try {
    const tableWasCreated = await generateDatatable(isCreated);
    if (tableWasCreated === false) {
      data_table.clear().draw(false);
    }
    change_logs.forEach(item => {
      const data_list = [
        item.cambio.descripcion,
        item.estatus,
        item.fechaHora,
        item.validadores.validador
      ]
      data_table.row.add([...data_list]).draw(false);
    });
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
  }
}


const generateDatatable = async (isCreated) => {
  if (isCreated === false) {
    data_table = new DataTable("#changelogs-list", {
      info: false,
      paging: false,
      searching: false,
      buttons: false
    });
    return true;
  }
  return false;
}

getAllRatesChangeLogs(false);
showTarifaBase('SLP');