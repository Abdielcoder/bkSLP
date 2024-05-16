const firestore = firebase.firestore();
const realtime = firebase.database().ref();

const INFO_TARIFAS_COLLECTION = realtime.child("Info_Tarifas/SLP");
const TARIFAS_COLLECTION = realtime.child("Tarifas/SLP")
const LOGS_INFO_TARIFAS_COLLECTION = firestore.collection("LogsCambioTarifa");

let DATATABLE = null;

const showTarifaBase = () => {
  INFO_TARIFAS_COLLECTION.once("value", (snapshot) => {
    const formElements = Array.from(document.querySelector("form#tarifas")).slice(0, -1);
    formElements.forEach((element) => {
      element.value = snapshot.val()[element.name];
    });
  });
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

const getAllRatesChangeLogs = async (isCreated) => {
  try {
    const tableWasCreated = generateDatatable(isCreated);
    if (tableWasCreated === false) {
      DATATABLE.clear().draw(false);
    }
    const changeLogs = await getRateChangeLogs();
    changeLogs.forEach((item) => {
      const data_list = [item.cambio.descripcion, item.estatus, item.fechaHora, item.validadores.validador];
      DATATABLE.row.add([...data_list]).draw(false);
    });
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
  }
};

const generateDatatable = () => {
  DATATABLE = new DataTable("#changelogs-list", {
    info: false,
    paging: false,
    searching: false,
    buttons: false,
  });
};

document.querySelector("form#tarifas").addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = Array.from(document.querySelector("form#tarifas")).slice(0, -1);
  const updateObj = {};

  inputs.forEach((element) => {
    const { name, value } = element;
    updateObj[name] = value;
  });

  const isUpdated = await INFO_TARIFAS_COLLECTION.update(updateObj)
    .then(() => true)
    .catch(() => false);
  if (isUpdated) {
    alert("Datos actualizados con éxito.");
    TARIFAS_COLLECTION.update(updateObj);
  } else {
    alert("Se ha presentado un error al actualizar.");
  }
});

function main() {
  getAllRatesChangeLogs();
  showTarifaBase();
}

main();
