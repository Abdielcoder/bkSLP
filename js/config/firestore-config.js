const firestore = firebase.firestore();

const getActualDate = async () => {
  const datetime = new Date();
  const timing = {
    yy: datetime.getFullYear(),
    mm: datetime.getMonth(),
    dd: datetime.getDate(),
    hh: datetime.getHours(),
    _mm: datetime.getMinutes(),
    ss: datetime.getSeconds(),
    ms: datetime.getMilliseconds(),
  };
  return {
    timestamp: `${timing.yy}-${timing.mm}-${timing.dd}-${timing.hh}-${timing._mm}-${timing.ss}-${timing.ms}`,
    today: `${timing.yy}-${timing.mm}-${timing.dd}`,
  };
};

const formatDateString = (fx) => {
  if (fx.includes("T")) {
    const D = fx.split("T");
    const T = D[0].split("-");
    const H = D[1].split(":");
    return `${T[2]}/${T[1]}/${T[0]} ${H[0]}:${H[1]}:${H[2].split(".")[0]}`;
  }
};

export const rates_change_logs = firestore.collection("LogsCambioTarifa");

export const addEventLogListener = async (uid, event, dataX) => {
  const timestamp = await getActualDate();
  await firestore
    .collection("crudEventLogs")
    .doc(event)
    .collection(timestamp.today)
    .doc(timestamp.timestamp)
    .set({
      user_uid: uid,
      ...dataX,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.log("Error writing document: ", error);
    });
};

export const getRateChangeLogs = () => {
  return rates_change_logs.get().then(async (snap) => {
    let logs_array = [];
    snap.forEach((item) => {
      const i = item.data();
      const __item = {
        ID: i.cambioId,
        estatus: i.estatus,
        fechaHora: formatDateString(i.fechaHora),
        fechaHoraSol: formatDateString(i.fechaHoraSol),
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
          fecha: formatDateString(i.validadores[0].fecha),
          validador: i.validadores[0].validador,
        },
      };
      logs_array.push(__item);
    });
    return logs_array;
  });
};
