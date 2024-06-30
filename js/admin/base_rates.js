const firestore = firebase.firestore();
const realtime = firebase.database().ref();

const formTarifas = document.querySelector("form#tarifas");
const INFO_TARIFAS_COLLECTION = realtime.child("Info_Tarifas/SLP");
const TARIFAS_COLLECTION = realtime.child("Tarifas/");
const LOGS_INFO_TARIFAS_COLLECTION = firestore.collection("LogsCambioTarifa");
const selectMunicipio = document.querySelector("select#municipio");

let DATATABLE_LOGS = null;

const getTarifaBaseByMunicipio = (municipio) => {
  realtime.child(`Tarifas/${municipio}`).once("value", (snapshot) => {
    const formElements = Array.from(document.querySelector("form#tarifas")).slice(0, -1);
    formElements.forEach((element) => {
      element.value = snapshot.val()[element.name];
    });
  });
};

const getTarifasChangeLogs = async () => {
  const logs = await firestore
    .collection("tarifasLogs")
    .get()
    .then((snapshot) => {
      const array = [];
      snapshot.docs.forEach((document) => {
        array.push({ uid: document.id, ...document.data() });
      });
      return array;
    });
  const tableWasCreated = generateDatatable();
  if (tableWasCreated === false) {
    DATATABLE_LOGS.clear().draw(false);
  }
  for (let index = 0; index < logs.length; index++) {
    const data_list = [index + 1, logs[index].datetime, logs[index].municipio, logs[index].adminName];
    DATATABLE_LOGS.row.add([...data_list]).draw(false);
  }
};

function getElementsFromCollection() {
  return INFO_TARIFAS_COLLECTION.once("value", (snapshot) => snapshot.val());
}

const getRateChangeLogs = async () => {
  return await LOGS_INFO_TARIFAS_COLLECTION.get().then(async (snap) => {
    let logs_array = [];
    snap.forEach((item) => {
      const i = item.data();
      const __item = {
        ID: i.cambioId,
        estatus: i.estatus,
        fechaHora: i.fechaHora,
        fechaHoraSol: i.fechaHoraSol,
        solicitanteId: i.solicitanteId,
        solicitanteUser: i.solicitanteUser,
        cambio: {
          descripcion: i.cambio[0].descripcion,
          final: i.cambio[0].final,
          previo: i.cambio[0].previo,
          propiedad: i.cambio[0].propiedad,
        },
        validadores: {
          estatus: i.validadores[0].estatus,
          fecha: i.validadores[0].fecha,
          validador: i.validadores[0].validador,
        },
      };
      logs_array.push(__item);
    });
    return logs_array;
  });
};

// const getAllRatesChangeLogs = async (isCreated) => {
//   try {
//     const tableWasCreated = generateDatatable(isCreated);
//     if (tableWasCreated === false) {
//       DATATABLE_LOGS.clear().draw(false);
//     }
//     const changeLogs = await getRateChangeLogs();
//     changeLogs.forEach((item) => {
//       const data_list = [item.cambio.descripcion, item.estatus, item.fechaHora, item.validadores.validador];
//       DATATABLE_LOGS.row.add([...data_list]).draw(false);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

const generateDatatable = () => {
  DATATABLE_LOGS = new DataTable("#changelogs-list", {
    info: false,
    paging: false,
    searching: false,
    buttons: false,
  });
};

formTarifas.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log(event.target.elements);

  const inputs = Array.from(event.target.elements).slice(0, -1);
  const updateObj = {};

  inputs.forEach((element) => {
    const { name, value } = element;
    updateObj[name] = parseFloat(value).toFixed(2);
  });
  console.log({ updateObj });
  const isUpdated = await realtime
    .child(`Tarifas/${selectMunicipio.value}`)
    .update(updateObj)
    .then(() => true)
    .catch(() => false);
  if (isUpdated) {
    window.alert("Datos actualizados con éxito.");
    await setLogs(updateObj);
  } else {
    window.alert("Se ha presentado un error al actualizar.");
  }
});

function main() {
  selectMunicipio.value = "SLP";
  // getAllRatesChangeLogs();
  getTarifaBaseByMunicipio(selectMunicipio.value);
  getTarifasChangeLogs();
}

/**
 * Agregar log de cambios
 */

async function setLogs() {
  const user = { uid: sessionStorage.getItem("user"), name: sessionStorage.getItem("username") };
  const datetime = new Date().toISOString();

  const isLogUploaded = await firestore
    .collection("tarifasLogs")
    .add({
      adminUid: user.uid,
      adminName: user.name,
      datetime,
      municipio: selectMunicipio.value,
    })
    .then(() => true)
    .catch(() => false);
  console.log({ isLogUploaded });
}

/**
 * Seleccionar municipio
 */

selectMunicipio.addEventListener("change", function (event) {
  getTarifaBaseByMunicipio(event.target.value);
});

main();
