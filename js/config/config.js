const config = {
  apiKey: "AIzaSyAE4SmPPbYlWa0UB3RJwMQ8ZBD3ooyGWBY",
  authDomain: "tadi-bac4e.firebaseapp.com",
  databaseURL: "https://tadi-bac4e-default-rtdb.firebaseio.com",
  projectId: "tadi-bac4e",
  storageBucket: "tadi-bac4e.appspot.com",
  messagingSenderId: "22237047929",
  appId: "1:22237047929:web:542330c6772d8f9d87b8a8",
};

const app = firebase.initializeApp(config);
const realtime = firebase.database().ref();
const auth = firebase.auth
export const firestore = firebase.firestore();

export const snap_drivers = realtime.child("Users/Drivers");
export const snap_admins = realtime.child("Users/Admins");
export const snap_clients = realtime.child("Users/Clients");
export const snap_working = realtime.child("drivers_working");
export const snap_active = realtime.child("active_drivers");
export const snap_panic = realtime.child("panic_button");
export const snap_warning = realtime.child("warning");
export const eiby_panic = realtime.child("eiby_panics");
export const eiby_warning = realtime.child("eiby_warnings");
export const snap_vehicles = realtime.child("Vehiculos");
export const snap_roles = realtime.child("Roles")
export const snap_trips = realtime.child("DriverTrip");
export const tokens = realtime.child("TokenSession");

export const snap_tarifas = realtime.child("Info_Tarifas");
export const snap_geographic = realtime.child("Geografico");
export const snap_geographic_cities = realtime.child("Geografico/Ciudad");
export const snap_geographic_area = realtime.child("Geografico/Area");
export const snap_geographic_country = realtime.child("Geografico/Pais");
export const snap_geographic_state = realtime.child("Geografico/Estado");
export const snap_flag_rates = realtime.child("Info_Tarifas/Banderas");

const formatProp = (ex) => {
  if (ex === undefined || ex === "") return '-';
  return ex;
}

export const all_drivers = () => {
  return snap_drivers.once("value").then(snap => {
    const driver_array = [];
    let libre_count = 0;
    let sitio_count = 0;
    snap.forEach(item => {
      let i = item.val();
      // if(i.id.includes('eiby') === false) {
      if (!i.nombre_chofer.includes("AARON ARRIAGA FLORES")) {
        if (!i.correo.includes(".gob.mx")) {
          let __item = {
            id: i.id,
            personal: {
              id_simov: i.user_id,
              name: i.nombre_chofer.toLowerCase(),
              email: i.correo.toLowerCase(),
              phone: i.telefono,
              gender: i.genero,
              badge: i.gafete,
              licence: i.noLicencia_chofer,
              card: i.tarjeton_ciudad.toLowerCase(),
            },
            vehicle: {
              num_economic: i.numero_economico,
              service: (() => {
                if (i.tipo.toLowerCase().includes('libre')) {
                  return 'libre';
                }
                return 'sitio';
              })(),
              brand: i.marca.toLowerCase(),
              model: i.modelo,
              color: i.color.toLowerCase(),
              plate: i.placa,
              type: i.tipo_vehiculo.toLowerCase(),
              last_gps: (() => {
                if (i.last_gps_location === undefined) {
                  return [32.53169856666667, -116.95251346666667]
                }
                const gps = i.last_gps_location.split(', ');
                return [gps[0], gps[1]];
              })()
            },
            delegation: {
              id: i.delegacionID,
              town: i.MUNICIPIO.toLowerCase()
            },
            status: {
              messageFlag: (() => {
                if (i.banderaMensajeI === undefined || i.banderaMensajeI === null) {
                  return 'n/a';
                }
                return i.banderaMensajeI.toLowerCase();
              })(),
              status: (() => {
                if (i.estatus === undefined || i.estatus === null) {
                  return 'n/a';
                }
                return i.estatus.toLowerCase();
              })(),
              process: (() => {
                if (i.proceso === undefined || i.proceso === null) {
                  return 'n/a';
                }
                return i.proceso.toLowerCase();
              })()
            }
          }
          if (__item.vehicle.service === 'sitio') { sitio_count++; }
          if (__item.vehicle.service === 'libre') { libre_count++; }
          driver_array.push(__item);
        }
      }
      // }
    });
    return {
      list: [...driver_array],
      dcount: driver_array.length,
      icount: driver_array.length,
      sitio_count,
      libre_count
    };
  })
}

export const all_vehicles = () => {
  return snap_vehicles.once("value").then(snap => {
    const vehicles_array = [];
    snap.forEach(item => {
      const uid = item.key;
      const i = item.val()
      const __item = {
        id: uid,
        color: i.color.toLowerCase(),
        delegation: i.delegacionID,
        folio: i.folio.toLowerCase(),
        brand: i.marca.toLowerCase(),
        model: i.modelo,
        num_economic: i.numero_economico.toUpperCase(),
        plate: i.placa.toLowerCase(),
        badge_city: i.tarjeton_ciudad.toLowerCase(),
        service: i.tipo.toLowerCase(),
        type: i.tipo_vehiculo.toLowerCase()
      }
      vehicles_array.push(__item);
    });
    return {
      list: [...vehicles_array],
      length: vehicles_array.length
    };
  });
}

export const all_trips = () => {
  return snap_trips.once("value").then(snap => {
    const tripsData = [];
    snap.forEach(ux => {
      let driverTrips = [];
      let finishedTrips = 0;
      let tripCost = 0;
      ux.forEach(tx => {
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
        trips: driverTrips
      });
    });
    return tripsData;
  });
}

export const all_admins = () => {
  return snap_admins.once("value").then(snap => {
    const admin_array = [];
    snap.forEach(item => {
      const uid = item.key;
      const i = item.val();
      const __item = {
        id: uid,
        name: formatProp(i.name),
        phone: formatProp(i.phone),
        email: formatProp(i.email),
        rol: formatProp(i.rol),
        user: formatProp(i.usuario),
        active: (() => {
          return (i.activo === 'true' || i.activo === true) ? true : false;
        })(),
        date: (() => {
          const dx = i.fechaAlta;
          if (dx === undefined || dx == "") return '-';
          if (dx.includes('T')) return dx.split('T')[0];
          return dx;
        })()
      };
      admin_array.push(__item);
    });
    return admin_array;
  });
}

export const all_roles = () => {
  return snap_roles.once("value").then(snap => {
    let roles_array = [];
    snap.forEach(item => {
      const i = item.val();
      const __item = {
        id: i.id,
        desc: i.desc,
        canCreate: i.crear,
        canUpdate: i.actualizar,
        canDelete: i.borrar,
        isAdmin: i.visible
      }
      roles_array.push(__item);
    });
    return roles_array;
  });
}

export const all_clients = () => {
  return snap_clients.once("value").then(snap => {
    const all_clients = [];
    snap.forEach(item => {
      const uid = item.key;
      const i = item.val();
      const __item = {
        id: uid,
        name: i.name,
        email: i.email
      };
      all_clients.push(__item);
    });
    return all_clients;
  });
}

// export const get_tarifas = () => {
//   return snap_tarifas.once("value").then(snap => {
//     const tarifas = [];
//     snap.forEach(item => {
//       const rate = [];
//       item.forEach(opt => {
//         opt.forEach(val => {
//           const __item = {
//             service: opt.key,
//             time: val.key,
//             flag: val.val().Bandera,
//             km: val.val().Km,
//             min: val.val().Min
//           };
//           rate.push(__item);
//         })
//       });
//       tarifas.push({ city: item.key, t: rate });
//     });
//     return tarifas;
//   });
// }

// Ajuste en config.js
// export const get_tarifas = () => {
//   return snap_tarifas.child("SLP").once("value").then(snap => {
//     const tarifas = [];
//     snap.forEach(item => {
//       const rate = [];
//       item.forEach(opt => {
//         const __item = {
//           service: item.key,
//           time: opt.key,
//           flag: opt.val().Bandera,
//           km: opt.val().Km,
//           min: opt.val().Min
//         };
//         rate.push(__item);
//       });
//       tarifas.push({ city: "SLP", t: rate }); // Considerando que solo trabajas con SLP
//     });
//     console.log(tarifas)
//     return tarifas;
//   });
// }

export const get_tarifas = () => {
  return snap_tarifas.child("SLP").once("value").then(snap => {
    // Ahora snap.val() es el objeto que contiene las tarifas directamente
    const tarifas = snap.val();
    console.log("Tarifas desde config: " + tarifas);
    return tarifas; // Retornamos el objeto de tarifas directamente
  });
}





export const generateTemporalToken = async () => {
  let token = "";
  let string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-@%&$#¿?{}[]()*+";
  for (let i = 0; i <= 49; i++) {
    let char = Math.floor(Math.random() * string.length);
    token += string.charAt(char)
  }
  return token;
}

export const generateDynamicUid = async () => {
  let UID = "";
  let STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= 27; i++) {
    let CHAR = Math.floor(Math.random() * STRING.length);
    UID += STRING.charAt(CHAR)
  }
  return UID;
}

export const generateRandomPassword = async () => {
  let pass = "";
  let string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz$%&#><=";
  for (let i = 0; i <= 7; i++) {
    let char = Math.floor(Math.random() * string.length);
    pass += string.charAt(char);
  }
  return pass;
}

export const removeRegisterFromAdminsTable = async uid => {
  try {
    await snap_admins.child(uid).remove();
    return true;
  } catch (err) {
    // console.log(err);
    // console.log(err.message);
    return false;
  }
}

export const get_geographic_area = () => {
  return snap_geographic_area.once("value").then(snap => {
    const geo_array = [];
    snap.forEach(item => {
      const i = item.val();
      const __item = {
        id: item.key,
        codigo: i.codigo,
        codigoCiudad: i.codigoCiudad,
        nombre: i.nombre
      }
      geo_array.push(__item);
    });
    return geo_array;
  });
}

export const get_geographic_city = () => {
  return snap_geographic_cities.once("value").then(snap => {
    const geo_array = [];
    snap.forEach(item => {
      const i = item.val();
      const __item = {
        id: item.key,
        codigo: i.codigo,
        codigoEstado: i.codigoEstado,
        nombre: i.nombre,
        zonaHr: i.zonaHr
      }
      geo_array.push(__item);
    });
    return geo_array;
  });
}

export const get_geographic_state = () => {
  return snap_geographic_state.once("value").then(snap => {
    const geo_array = [];
    snap.forEach(item => {
      const i = item.val();
      const __item = {
        id: item.key,
        codigo: i.codigo,
        codigoPais: i.codigoPais,
        nombre: i.nombre
      }
      geo_array.push(__item);
    });
    return geo_array;
  });
}

export const get_geographic_country = () => {
  return snap_geographic_country.once("value").then(snap => {
    const geo_array = [];
    snap.forEach(item => {
      const i = item.val();
      const __item = {
        id: item.key,
        codigo: i.codigo,
        idioma: i.idioma,
        iso: i.iso,
        ubicacion: i.ubicacion
      }
      geo_array.push(__item);
    });
    return geo_array;
  });
}

export const driversArr = () => {
  return snap_drivers.once("value").then(dt => {
    let a = [];
    dt.forEach(el => {
      const uid = el.key;
      if (uid.includes('eiby') === false) {
        if (!el.val().nombre_chofer.includes("AARON ARRIAGA FLORES")) {
          if (!el.val().correo.includes(".gob.mx")) {
            a.push({ uid: uid, v: el.val() });
          }
        }
      }
    });
    return { l: a.length, o: a };
  });
}

export const workingArr = () => {
  return snap_working.once("value").then(dt => {
    let a = [];
    dt.forEach(el => { a.push(el.val()); });
    return { l: a.length, o: a };
  });
}

export const activeArr = () => {
  return snap_active.once("value").then(dt => {
    let a = [];
    dt.forEach(el => { a.push(el.val()); });
    return { l: a.length, o: a };
  });
}

export const driverTrips = async () => {

  const tripsData = [];

  await snap_trips.once("value").then(async snap => {

    await snap.forEach(ux => {

      let driverTrips = [];
      let finishedTrips = 0;
      let tripCost = 0;

      ux.forEach(tx => {
        finishedTrips = tx.val().status === "finish" ? finishedTrips + 1 : finishedTrips;
        const tC = tx.val().tripCost || 0;

        // if(parseInt(tC) > 2000) {console.log({uid: ux.key, trip: tx.key});}
        tripCost = tripCost + tC;
        const epoch = tx.key.replace("-", "");
        // const timestamp = new Date(parseInt(epoch)).toDateString();
        driverTrips.push({ epoch: parseInt(epoch), v: tx.val() });
      });

      tripsData.push({
        uid: ux.key,
        numTrips: driverTrips.length,
        finishedTrips: finishedTrips,
        tripCost: tripCost,
        trips: driverTrips
      });
    });
  });

  return tripsData;
}

export const getFullDriverTripNodeData = async () => {

  const all_drivers = await snap_drivers.once("value").then(data => Object.keys(data.val()).length);
  let trips_array = [];
  let total_trips = 0;
  let total_finished_trips = 0;
  let total_money_refunds = 0;

  await snap_trips.once("value", doc => {
    doc.forEach(obj => {

      let driver_trips = [];
      let finished_trips = 0;
      let trips_refunds = 0;

      obj.forEach(itx => {

        const i = itx.val();
        finished_trips = i.status === "finish" ? finished_trips + 1 : finished_trips;
        trips_refunds = i.tripCost !== undefined ? trips_refunds + i.tripCost : trips_refunds;
        driver_trips.push({ dateEpoch: parseInt(itx.key.replace("-", "")), t: i });
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
    rP: trips_array.length
  };
}

export const adminArr = async () => {
  return snap_admins.once("value").then(dt => {
    let a = [];
    dt.forEach(el => { a.push({ uid: el.key, v: el.val() }) });
    return { l: a.length, o: a };
  });
}

/* Firestore Functions */
export const guardaOperador = async (req) => {

  let firestoreData = {};

  req?.forEach((i) => { firestoreData = Object.assign(firestoreData, i); });
  const uid = "u" + new Date().getTime();

  firestoreData = Object
    .assign(
      firestoreData,
      { fechaAlta: new Date().toISOString() },
      { uid }
    );

  const { status, code } = await firebase
    .auth()
    .createUserWithEmailAndPassword(firestoreData.correoElectronico, "1234abcd")
    .then(user => { return { status: 200, user: user.user } })
    .catch(error => { return { status: 500, code: error.code }; });

  if (status === 200) {
    window.alert("Se ha guardado el operador con exito.");
    await resetPassword(firestoreData.correoElectronico);

    await firestore
      .collection("OperadoresSLP")
      .doc(uid)
      .set(firestoreData)
      .catch((error) => { return false; });


    return true;
  }
  if (status === 500) {
    switch (code) {
      case 'auth/email-already-in-use':
        window.alert("El correo '" + firestoreData.correoElectronico + "' ya se encuentra registrado en el sistema, favor de introducir un correo distinto.")
        break;
      case 'auth/invalid-email':
        window.alert("Corréo invalido, pruebe con otro.")
        break;
      case 'auth/operation-not-allowed':
        window.alert("Se ha presentado un error en el registro, favor de verificar con un administrador.")
        break;
      default:
        window.alert("Se ha presentado un error, favor de verificar los datos introducidos.");
        break;
    }
    return false;
  }
}

export const getOperatorsList = async () => {
  return await firestore.collection("OperadoresSLP").get().catch(error => false);
}

export const eliminaOperador = async (uid, email) => {
  console.log({ uid, email })
  const result = await firestore
    .collection("OperadoresSLP")
    .doc(uid)
    .delete()
    .then(response => response)
    .catch((error) => false);

  if (result !== false) {
    window.alert("Se ha eliminado el operador con exito.");
    return true;
  }
  window.alert("Se ha presentado un error!");
  return false;
}

export const verOperador = async (res) => {

  const result = await firestore
    .collection("OperadoresSLP")
    .doc(res)
    .get()
    .then(response => {
      if (response.exists) {
        // console.log("exito")
        return response.data();
      }
    })
    .catch(error => false);

  return result;
}

export const actualizaOperador = async (res, uid) => {
  let data = {};
  res?.forEach(item => { Object.assign(data, item) });
  data = Object.assign(data, { fechaActualizacion: new Date().toISOString() })
  const response = await firestore.collection("OperadoresSLP")
    .doc(uid)
    .update(data)
    .catch(error => false);
  if (response !== false) {
    alert("Se ha actualizado el usuario de manera corrrecta.")
    return true;
  }
  alert("Se ha presentado un error, favor de verificar.")
  return false;
}

export const resetPassword = async (email) => {
  const response = await firebase.auth().sendPasswordResetEmail(email)
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // console.log({ errorCode, errorMessage })
      return false;
    });

  if (response !== false) {
    alert("Se ha enviado un correo de restablecimiento de contraseña, verificar su bandeja de entrada.")
    return true;
  }
  alert("Se ha presentado un error, favor de verificar");
  return false;
}

export const getMessagesList = async () => {
  const list = await firestore.collection("Mensajes").get().catch(error => false);
  if (list) {
    let information = []; 
    list.forEach(item => {
      const { accion, descripcion, destino, ejecutado, fechaAlta, message } = item.data();
      information.push([message, descripcion, destino, ejecutado, accion]);
    });
    console.log({information})
    return information;
  }
};

export const addNewMessage = async (e) => {

  let firestoreData = {};

  firestoreData = Object
    .assign(
      e,
      { fechaAlta: new Date().toISOString() }
    );

  return await firestore
    .collection("Mensajes")
    .doc()
    .set(firestoreData)
    .then(result => true)
    .catch(error => false);
};

export default app;