import { dom_icons } from "../../dom/icons.js";

export {
  PANIC_ALERTS_REFERENCE,
  WARNING_ALERTS_REFERENCE,
  GLOBAL_ALL_DRIVERS_ARRAY
}

const realtime = firebase.database().ref();
const DRIVERS_REALTIME_REFERENCE = realtime.child("Users/Drivers");
const DRIVERS_WORKING_REFERENCE = realtime.child("drivers_working");
const DRIVERS_ACTIVE_REFERENCE = realtime.child("active_drivers");
const CLIENTS_REFERENCE = realtime.child("Users/Clients");
const PANIC_ALERTS_REFERENCE = realtime.child("panic_button");
const WARNING_ALERTS_REFERENCE = realtime.child("warning");
let MODAL_ALERTS_IS_OPENED = false;
let GLOBAL_ALL_DRIVERS_ARRAY = [];
let GLOBAL_WORKING_DRIVERS_ARRAY = [];
let GLOBAL_ACTIVE_DRIVERS_ARRAY = [];
let WORKING_MAP_MARKERS_ARRAY = [];
let ACTIVE_MAP_MARKERS_ARRAY = [];
let INACTIVE_MAP_MARKERS_ARRAY = [];
// let SEARCH_INACTIVE_FILTER_ARRAY = [];
let CLIENTS_INFO_ARRAY = [];
let CLIENTS_PANICS_ARRAY = [];
let CLIENTS_WARNINGS_ARRAY = [];
let ALL_DRIVERS_COUNTER_INT = 0;
let ACTIVE_COUNTER_INT = 0;
let WORKING_COUNTER_INT = 0;
let INACTIVE_COUNTER_INT = 0;

const TAXI_TOTAL_POINTER = document.querySelector("span#total-data");
// const LIBRE_TOTAL_POINTER = document.querySelector("span#libre-data");
// const SITIO_TOTAL_POINTER = document.querySelector("span#sitio-data");
const WORKING_TOTAL_POINTER = document.querySelector("span#working-data");
const ACTIVE_TOTAL_POINTER = document.querySelector("span#active-data");
const INACTIVE_TOTAL_POINTER = document.querySelector("span#inactive-data");

/* Warning / Panic */
let isIconWarningActive = false;
let isIconPanicActive = false;

async function getAllClients() {
  const clientsSnapshot = await CLIENTS_REFERENCE.once("value").then((snapshot) => {
    let allClientsFromSnapshot = [];
    snapshot.forEach((document) => {
      let object = document.val();
      allClientsFromSnapshot.push({ ...object, uid: document?.key });
    });
    return allClientsFromSnapshot;
  });
  return clientsSnapshot;
}

async function getAllDrivers() {
  const driversSnapshot = await DRIVERS_REALTIME_REFERENCE.once("value")
    .then((snapshot) => {
      let allDriversFromSnapshot = [];
      let taxiLibreCounter = 0;
      let taxiSitioCounter = 0;
      snapshot.forEach((document) => {
        let object = document.val();
        let documentData = {
          uid: object.id,
          nombreChofer: object.nombre_chofer,
          correo: object.correo,
          telefono: object.telefono,
          genero: object.genero,
          gafete: object.gafete,
          licenciaChofer: object.noLicencia_chofer,
          tarjetonCiudad: object.tarjeton_ciudad,
          numeroEconomico: object.numero_economico,
          servicio: object.tipo || "",
          marca: object.marca,
          modelo: object.modelo,
          color: object.color,
          placa: object.placa,
          tipoVehiculo: object.tipo_vehiculo,
          lastGps: (() => {
            if (object.last_gps_location === undefined) {
              return [32.53169856666667, -116.95251346666667];
            }
            const gps = object.last_gps_location.split(", ");
            return { lat: gps[0], lng: gps[1] };
          })(),
          idDelegacion: object.delegacionID,
          municipio: object.MUNICIPIO,
          messageFlag: object.banderaMensajeI || "N/A",
          estatus: object.estatus || "N/A",
          proceso: object.proceso || "N/A",
        };
        String(documentData.service).toUpperCase() == "SITIO" ? taxiSitioCounter++ : taxiSitioCounter;
        String(documentData.service).toUpperCase() == "LIBRE" ? taxiLibreCounter++ : taxiLibreCounter;
        allDriversFromSnapshot.push(documentData);
      });
      return {
        array: allDriversFromSnapshot,
        taxiSitioCounter,
        taxiLibreCounter,
      };
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
  return driversSnapshot;
}

async function main() {
  const drivers = await getAllDrivers();
  const clients = await getAllClients();
  GLOBAL_ALL_DRIVERS_ARRAY = drivers.array;
  CLIENTS_INFO_ARRAY = clients;
  // drivers?.array.forEach((item) => {
  //   addDriverMarkerOnMap(item, undefined, iconInactive, "inactive");
  //   addDataDriverToList(item, "inactive", dom_icons.blackcar);
  // });
  ALL_DRIVERS_COUNTER_INT = drivers.array.length;
  TAXI_TOTAL_POINTER.textContent = drivers.array.length;
  INACTIVE_TOTAL_POINTER.textContent =
    drivers.array.length - (parseInt(drivers.taxiLibreCounter) + parseInt(drivers.taxiSitioCounter));
  INACTIVE_COUNTER_INT = drivers.taxiLibreCounter + drivers.taxiSitioCounter;
  // LIBRE_TOTAL_POINTER.textContent = drivers.taxiLibreCounter;
  // SITIO_TOTAL_POINTER.textContent = drivers.taxiSitioCounter;
}

await main();

const addDriverMarkerOnMap = async (data, currentDriver, iconColor, type) => {
  console.log({ data, currentDriver, iconColor, type });
  try {
    const markerPopUpContainer = getPopUpCardFromMarker(data, currentDriver, type);
    const whichService = data.servicio || "indefinido";

    const latitude = currentDriver !== undefined ? currentDriver.l[0] : data.last_gps.lat;
    const longitude = currentDriver !== undefined ? currentDriver.l[1] : data.last_gps.lng;

    const markerOptions = {
      id: data.uid,
      title: data.placa,
      icon: iconColor,
      alt: `marker-${data.uid}`,
      pos: `icon-${data.uid}`,
    };

    let marker = L.marker([latitude, longitude], markerOptions);

    if (markerPopUpContainer) {
      marker.bindPopup(markerPopUpContainer, { maxWidth: 500 }).on("click", (event) => {
        event.target.openPopup();
      });
    }
    await marker.addTo(GeographicZone);

    const markerIcon = marker._icon;
    markerIcon.classList.add("eye-filter");
    markerIcon.setAttribute("data-type", type);
    markerIcon.setAttribute("data-service", whichService);
    markerIcon.setAttribute("data-vision", "visible");

    setMarkerToArray(marker, type);
  } catch (error) {
    console.error(error);
  }
};

const settingNewCarTypeInMap = (uid, snapshot) => {
  let workingDriver = findDriverMarkerByUID(uid, WORKING_MAP_MARKERS_ARRAY);
  if (workingDriver) {
    const item = findDriverDataByUID(uid, GLOBAL_ALL_DRIVERS_ARRAY);
    addDriverMarkerOnMap(item, snapshot, iconWorking, dom_icons.bluecar);
    return;
  }

  let activeDriver = findDriverMarkerByUID(uid, ACTIVE_MAP_MARKERS_ARRAY);
  if (activeDriver) {
    const item = findDriverDataByUID(uid, GLOBAL_ALL_DRIVERS_ARRAY);
    addDriverMarkerOnMap(item, snapshot, iconActive, dom_icons.greencar);
  }
};

const findDriverMarkerByUID = (uid, marker) => marker.find(({ options }) => options.id === uid);

const findDriverDataByUID = (uid, array) => array.find(({ id }) => id === uid);

const removeDataFromTable = (uid) => {
  const elementString = "tr.tr_" + uid;
  document.querySelectorAll(elementString).forEach((element) => {
    element.remove();
  });
};

const showAlertCountersOnMapContainer = (e, count) => {
  const button = document.querySelector(`button[data-event='${e}'`);
  const separator = document.querySelector(`hr.separator.warpan`);

  if (WARNING_COUNTER_INT >= 1) {
    isIconWarningActive = true;
    separator.style.display = "block";
    button.style.display = "flex";
  }
  if (PANIC_COUNTER_INT >= 1) {
    isIconPanicActive = true;
    if (separator.style.display === "none") {
      separator.style.display = "block";
    }
    button.style.display = "flex";
  }
  document.querySelector(`span#${e}-data`).textContent = count;
};

const updateNodePosition = (array, node) => {
  return {
    ...array,
    w: node,
  };
};

const addDataDriverToList = async (driver, event, icon) => {
  if (driver === undefined) return;

  const tableBody = document.querySelector("table#data-list tbody");
  const trElement = document.createElement("tr");
  const tdElement = document.createElement("td");
  const spanElement = document.createElement("span");
  const imageElement = document.createElement("img");
  trElement.classList.add(`tr_${driver.uid}`);
  tdElement.classList.add("cell-list");
  trElement.setAttribute("data-type", event);
  tdElement.setAttribute("data-num", driver.numeroEconomico);
  tdElement.setAttribute("data-phone", driver.telefono);
  tdElement.setAttribute("data-licence", driver.licenciaChofer);
  tdElement.style.textTransform = "uppercase";

  spanElement.textContent = driver.placa;

  imageElement.src = icon;
  imageElement.classList.add("car_icon");

  tdElement.append(spanElement, imageElement);
  trElement.append(tdElement);

  trElement.addEventListener("click", (event) => {
    const { currentTarget } = event;
    // const id = self.getAttribute("class").split("_")[1];
    const type = currentTarget.getAttribute("data-type");
    focusMarkerOnMap(driver.uid, type);
  });

  tableBody.insertAdjacentElement("beforeend", trElement);
};

const removeMarkerFromMap = (item) => {
  if (item === undefined) return;
  const { options } = item;
  const element = `img[alt='${options.alt}']`;
  item.removeFrom(GeographicZone);
  document.querySelectorAll(element).forEach((event) => event.remove());
};

const focusMarkerOnMap = async (uid, t) => {
  let driverMarkerItem = [];

  if (t !== "inactive") {
    if (t === "active") driverMarkerItem = ACTIVE_MAP_MARKERS_ARRAY.filter(({ options }) => options.id === uid);
    if (t === "working") driverMarkerItem = WORKING_MAP_MARKERS_ARRAY.filter(({ options }) => options.id === uid);
    if (t === "warning") driverMarkerItem = WARNING_MAP_MARKERS_ARRAY.filter(({ options }) => options.id === uid);
    if (t === "panic") driverMarkerItem = PANIC_MAP_MARKERS_ARRAY.filter(({ options }) => options.id === uid);
    driverMarkerItem[0].openPopup();
    const { lat, lng } = driverMarkerItem[0].getLatLng();
    GeographicZone.setView([lat, lng], 12);
    return;
  }

  updateSearchInactiveFilter(i);
  const marker = findDriverMarkerByUID(i, INACTIVE_MAP_MARKERS_ARRAY);
  marker.openPopup();
  const { latitude, longitude } = marker.getLatLng();
  GeographicZone.setView([latitude, longitude], 12);
};

// const updateSearchInactiveFilter = (i) => {
//   SEARCH_INACTIVE_FILTER.forEach((item) => {
//     item.style.display = "none";
//   });
//   SEARCH_INACTIVE_FILTER = [];
//   const inactive_marker = document.querySelector(`img[alt='marker-${i}']`);
//   inactive_marker.style.display = "block";
//   SEARCH_INACTIVE_FILTER.push(inactive_marker);
//   return;
// };

const getPopUpCardFromMarker = (driver) => {
  if (driver !== undefined) {
    return `
        <div class="driver-popup">
          <div class="formContainer" data-tabcontainer="conductor" data-visibility="true">
            <div class="popup-header">
              <h2 style="margin-bottom: 0.5rem;">Datos generales del conductor</h2>
            </div>
            <div class="popup-body">
              <div style="display: flex; flex-direction: row; justify-content: space-between; column-gap: 1rem;">
                <h6>Operador:</h6>
                <span style="text-transform: uppercase;">${driver.nombreChofer}</span>
              </div>
              <div style="display: flex; flex-direction: row; justify-content: space-between; column-gap: 1rem;">
                <h6>Contacto:</h6>
                <span>${driver.telefono}</span>
              </div>
              <div style="display: flex; flex-direction: row; justify-content: space-between; column-gap: 1rem;">
                <h6>Económico:</h6>
                <span>${driver.numeroEconomico}</span>
              </div>
              <div style="display: flex; flex-direction: row; justify-content: space-between; column-gap: 1rem;">
                <h6>Estado:</h6>
                <span>${driver.estatus}</span>
              </div>
            </div>
          </div>
        </div>`;
  }
};

const getDegreesFromMarker = (gps1, gps2) => {
  const rad = Math.PI / 180;
  let lat1 = gps1.lat * rad;
  let lat2 = gps2.lat * rad;
  let lon1 = gps1.lng * rad;
  let lon2 = gps2.lng * rad;
  let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return bearing >= 180 ? bearing - 360 : bearing;
};

const setMarkerToArray = async (object, type) => {
  if (type === "active") return ACTIVE_MAP_MARKERS_ARRAY.push(object);
  if (type === "inactive") return INACTIVE_MAP_MARKERS_ARRAY.push(object);
  if (type === "working") return WORKING_MAP_MARKERS_ARRAY.push(object);
  if (type === "warning") return WARNING_MAP_MARKERS_ARRAY.push(object);
  if (type === "panic") return PANIC_MAP_MARKERS_ARRAY.push(object);
  return;
};

const updateDriverMarkerOrientation = (uid, deg) => {
  const iconImg = document.querySelector(`img[alt='marker-${uid}']`);
  const iconStyle = iconImg.style.transform;
  iconImg.style.transformOrigin = "center";
  iconImg.style.transform = `${iconStyle.split("rotate")[0]} rotate(${deg}deg)`;
};

const addWarningInfoToModalTable = (item, pos, type, icon) => {
  console.log({ item, pos, type, icon });
  const modal = document.querySelector("div.modal-container-body table#alerts-list tbody");
  const items = [
    `<img class="${pos}_icon" src="${icon}"/>`,
    item.date,
    item.isDriver ? item?.nombreChofer : item.name,
    item?.telefono || "",
    item?.gafete || "",
    item.isDriver ? item?.correo : item.email,
    item?.numeroEconomico || "",
    item?.marca || "",
    item?.placa || "",
    `${(item?.servicio && item?.servicio.replace("automovil ", "")) || ""} - ${(item?.color && item?.color) || ""}`,
    `<button class="attention-button" data-type='${type}' data-id='${item?.uid}'><img src='${dom_icons?.edit}'/></button>`,
  ];

  const TR = document.createElement("TR");
  TR.setAttribute("class", `${type}-list_${item?.uid}`);

  items.forEach((i) => {
    const TD = document.createElement("TD");
    TD.insertAdjacentHTML("beforeend", i);
    TR.appendChild(TD);
  });

  const BUTTON = TR.lastElementChild.children[0];
  BUTTON.addEventListener("click", (e) => {
    const self = e.currentTarget;
    const id = self.getAttribute("data-id");
    attendAlertFromListModal(type, id);
  });

  modal.insertAdjacentElement("beforeend", TR);
};

const attendAlertFromListModal = (type, uid) => {
  const alertBox = document.querySelector("div.modal-alert-box");
  alertBox.setAttribute("data-id", uid);
  alertBox.setAttribute("data-type", type);
  alertBox.style.display = "block";
};

const checkDriverMarkerOnMap = async (type, uuid, event) => {
  try {
    let whichTypeIs = "";
    const isWorking = GLOBAL_WORKING_DRIVERS_ARRAY.find(({ uid }) => uid === uuid);
    const isActive = GLOBAL_ACTIVE_DRIVERS_ARRAY.find(({ uid }) => uid === uuid);
    if (isWorking) whichTypeIs = "working";
    if (isActive) whichTypeIs = "active";

    // if (!isWorking && !isActive) return;

    // const marker = document.querySelector(`img[alt='marker-${uuid}'][data-type='${whichTypeIs}']`);
    // const table_row = document.querySelectorAll(`tr.tr_${uuid}`);

    // if (event === "start") {
    //   marker.style.display = "none";
    //   table_row.forEach((item) => {
    //     if (item.getAttribute("data-type") !== type) {
    //       item.classList.add("no-display");
    //     }
    //   });
    //   return;
    // }
    // marker.style.display = "block";
    // table_row.forEach((item) => {
    //   if (item.getAttribute("data-type") !== type) {
    //     item.classList.remove("no-display");
    //   }
    // });
  } catch (err) {
    console.error(err);
  }
};

const cleanAlertCountInContainerMap = (counter, type) => {
  document.querySelector(`span#${type}-data`).textContent = counter;

  if (counter === 0) {
    document.querySelector(`button.map-data.warpan.${type}`).style.display = "none";
  }

  if (WARNING_COUNTER_INT + PANIC_COUNTER_INT < 1) {
    document.querySelectorAll(".warpan").forEach((elem) => {
      elem.style.display = "none";
    });
    GeographicZone.setView([22.151456550718237, -100.97786442650008], 13);
    return;
  }
};

const addCircleToMap = (item, color, type) => {
  const circleOptions = {
    radius: type === "warning" ? 1200 : 2000,
    stroke: true,
    weight: 2,
    opacity: 0.65,
    color: color,
    fillColor: color,
    className: `circle-${item.uid}`,
  };
  const CIRCLE_MAP_MARKER = L.circle([item.node.l[0], item.node.l[1]], circleOptions);
  if (type === "warning") {
    WARNING_MAP_CIRCLE_MARKERS_ARRAY.push(CIRCLE_MAP_MARKER);
  }
  if (type === "panic") {
    PANIC_CIRCLE_MAP_MARKERS_ARRAY.push(CIRCLE_MAP_MARKER);
  }
  CIRCLE_MAP_MARKER.addTo(GeographicZone);
};

const removeCircleMarkerFromMap = (uid, type) => {
  let CIRCLE_MAP_MARKER =
    type === "warning"
      ? WARNING_MAP_CIRCLE_MARKERS_ARRAY.filter(({ options }) => options.className === `circle-${uid}`)
      : PANIC_CIRCLE_MAP_MARKERS_ARRAY.filter(({ options }) => options.className === `circle-${uid}`);

  // console.log({ CIRCLE_MAP_MARKER, WARNING_MAP_CIRCLE_MARKERS_ARRAY, PANIC_CIRCLE_MAP_MARKERS_ARRAY, uid, type });

  CIRCLE_MAP_MARKER.forEach((item) => {
    item.removeFrom(GeographicZone);
  });
};

// const executeWebService = () => {
//   const api = "http://ec2-3-15-238-62.us-east-2.compute.amazonaws.com/SendActivation.asmx/ActivationLog";
//   const xhr = new XMLHttpRequest();

//   xhr.addEventListener("load", () => {
//     if (this.readyState === 4 && this.status === 200) {
//       // console.log(this.response);
//     } else {
//       // console.log(this.response);
//     }
//   });
//   xhr.open("GET", api);
//   xhr.send();
// };

/**
 * Drivers Working References (OnAdded, onChanged, onRemoved)
 **/

DRIVERS_WORKING_REFERENCE.on("child_added", (snapshot) => {
  try {
    const workingDriverSnapshot = { uid: snapshot.key, ...snapshot.val() };

    const isActiveExist = GLOBAL_ACTIVE_DRIVERS_ARRAY.find(({ uid }) => uid === workingDriverSnapshot.uid);
    if (isActiveExist) {
      try {
        removeDataFromTable(workingDriverSnapshot.uid);
        const marker = ACTIVE_MAP_MARKERS_ARRAY.find(({ options }) => options.id === workingDriverSnapshot.uid);
        removeMarkerFromMap(marker);
      } catch (error) {
        console.error(error);
      }
    }
    const driverData = GLOBAL_ALL_DRIVERS_ARRAY.find(({ uid }) => uid === workingDriverSnapshot.uid);
    console.log({ Working: driverData });
    if (driverData === null || driverData === undefined) return;
    GLOBAL_WORKING_DRIVERS_ARRAY.push({ ...driverData, ...workingDriverSnapshot });
    WORKING_COUNTER_INT = GLOBAL_WORKING_DRIVERS_ARRAY.length;

    INACTIVE_COUNTER_INT = ALL_DRIVERS_COUNTER_INT - ACTIVE_COUNTER_INT - WORKING_COUNTER_INT;
    addDriverMarkerOnMap(driverData, workingDriverSnapshot, iconWorking, "working");
    addDataDriverToList(driverData, "working", dom_icons.redcar);
    WORKING_TOTAL_POINTER.textContent = WORKING_COUNTER_INT;
    INACTIVE_TOTAL_POINTER.textContent = INACTIVE_COUNTER_INT;
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_WORKING_REFERENCE.on("child_changed", (snap) => {
  const driver = findDriverDataByUID(snap.key, GLOBAL_WORKING_DRIVERS_ARRAY);
  const marker = findDriverMarkerByUID(snap.key, WORKING_MAP_MARKERS_ARRAY);
  const latitude = snap.val().l[0];
  const longitude = snap.val().l[1];

  if (!driver) return;

  const newDegree = getDegreesFromMarker(
    { lat: marker._latlng.lat, lng: marker._latlng.lng },
    { lat: latitude, lng: longitude }
  );

  marker.setLatLng([latitude, longitude]);
  updateDriverMarkerOrientation(snap.key, newDegree);

  const new_item = updateNodePosition(driver, snap.val());
  GLOBAL_WORKING_DRIVERS_ARRAY = GLOBAL_WORKING_DRIVERS_ARRAY.filter((item) => item.id !== snap.key);
  GLOBAL_WORKING_DRIVERS_ARRAY.push(new_item);
});

DRIVERS_WORKING_REFERENCE.on("child_removed", ({ key }) => {
  GLOBAL_WORKING_DRIVERS_ARRAY = GLOBAL_WORKING_DRIVERS_ARRAY.filter(({ uid }) => uid !== key);
  WORKING_COUNTER_INT = GLOBAL_WORKING_DRIVERS_ARRAY.length;

  const marker = WORKING_MAP_MARKERS_ARRAY.find(({ uid }) => uid === key);
  removeMarkerFromMap(marker);
  removeDataFromTable(key);
  WORKING_MAP_MARKERS_ARRAY = WORKING_MAP_MARKERS_ARRAY.filter(({ options }) => options.id !== key);

  WORKING_TOTAL_POINTER.textContent = WORKING_COUNTER_INT;
  INACTIVE_TOTAL_POINTER.textContent = GLOBAL_ALL_DRIVERS_ARRAY.length - ACTIVE_COUNTER_INT - WORKING_COUNTER_INT;
});

DRIVERS_ACTIVE_REFERENCE.on("child_added", (snapshot) => {
  try {
    const activeDriverSnapshot = { uid: snapshot.key, ...snapshot.val() };
    console.log({ activeDriverSnapshot });
    const isAWorkingExist = GLOBAL_WORKING_DRIVERS_ARRAY.find(({ uid }) => uid === activeDriverSnapshot.uid);
    if (isAWorkingExist) {
      try {
        removeDataFromTable(activeDriverSnapshot.uid);
        const marker = WORKING_MAP_MARKERS_ARRAY.find(({ uid }) => uid === activeDriverSnapshot.uid);
        removeMarkerFromMap(marker);
      } catch (error) {
        console.error(error);
      }
    }
    console.log({ GLOBAL_ALL_DRIVERS_ARRAY });
    const driverData = GLOBAL_ALL_DRIVERS_ARRAY.find(({ uid }) => uid === activeDriverSnapshot.uid);
    console.log({ Active: driverData });
    if (driverData === null || driverData === undefined) return;

    GLOBAL_ACTIVE_DRIVERS_ARRAY.push({ ...driverData, ...activeDriverSnapshot });
    ACTIVE_COUNTER_INT = GLOBAL_ACTIVE_DRIVERS_ARRAY.length;

    INACTIVE_COUNTER_INT = ALL_DRIVERS_COUNTER_INT - ACTIVE_COUNTER_INT - WORKING_COUNTER_INT;
    addDriverMarkerOnMap(driverData, activeDriverSnapshot, iconActive, "active");
    addDataDriverToList(driverData, "active", dom_icons.greencar);

    ACTIVE_TOTAL_POINTER.textContent = ACTIVE_COUNTER_INT;
    INACTIVE_TOTAL_POINTER.textContent = INACTIVE_COUNTER_INT;
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_ACTIVE_REFERENCE.on("child_changed", (snap) => {
  const driver = findDriverDataByUID(snap.key, GLOBAL_ACTIVE_DRIVERS_ARRAY);
  const marker = findDriverMarkerByUID(snap.key, ACTIVE_MAP_MARKERS_ARRAY);
  const latitude = snap.val().l[0];
  const longitude = snap.val().l[1];

  if (!driver) return;

  const newDegree = getDegreesFromMarker(
    { lat: marker._latlng.lat, lng: marker._latlng.lng },
    { lat: latitude, lng: longitude }
  );

  marker.setLatLng([latitude, longitude]);
  updateDriverMarkerOrientation(snap.key, newDegree);

  const newDriverPosition = updateNodePosition(driver, snap.val());
  GLOBAL_ACTIVE_DRIVERS_ARRAY = GLOBAL_ACTIVE_DRIVERS_ARRAY.filter((item) => item.id !== snap.key);
  GLOBAL_ACTIVE_DRIVERS_ARRAY.push(newDriverPosition);
});

DRIVERS_ACTIVE_REFERENCE.on("child_removed", ({ key }) => {
  GLOBAL_ACTIVE_DRIVERS_ARRAY = GLOBAL_ACTIVE_DRIVERS_ARRAY.filter(({ uid }) => uid !== key);
  ACTIVE_COUNTER_INT = GLOBAL_ACTIVE_DRIVERS_ARRAY.length;

  const marker = ACTIVE_MAP_MARKERS_ARRAY.find(({ options }) => options.id === key);
  removeMarkerFromMap(marker);
  removeDataFromTable(key);
  ACTIVE_MAP_MARKERS_ARRAY = ACTIVE_MAP_MARKERS_ARRAY.filter(({ options }) => options.id !== key);

  ACTIVE_TOTAL_POINTER.textContent = ACTIVE_COUNTER_INT;
  INACTIVE_TOTAL_POINTER.textContent = GLOBAL_ALL_DRIVERS_ARRAY.length - ACTIVE_COUNTER_INT - WORKING_COUNTER_INT;
});

$(document).on("click", ".tab-button", function (event) {
  const { currentTarget } = event;
  // const modalTabButtons = document.querySelectorAll("button.tab-button");
  const nameTab = currentTarget.getAttribute("data-tab");
  const isSelected = currentTarget.getAttribute("aria-selected");

  if (isSelected == "true") {
    return false;
  }

  // modalTabButtons.forEach((element) => {
  //   const isCurrentElement = element.getAttribute("data-tab") === nameTab;
  //   if (element.getAttribute("aria-selected") == "true" || !isCurrentElement) {
  //     element.setAttribute("aria-selected", "false");
  //   } else {
  //     element.setAttribute("aria-selected", "true");
  //   }
  // });

  const tabContents = document.querySelectorAll("div.formContainer");
  tabContents.forEach((element) => {
    const isVisible = element.getAttribute("data-tabcontainer") === nameTab;
    element.setAttribute("data-visibility", isVisible ? "true" : "false");
  });
});

let WARNING_NOTIFICATIONS_ARRAY = [];
let WARNING_MAP_MARKERS_ARRAY = [];
let WARNING_MAP_CIRCLE_MARKERS_ARRAY = [];

let PANIC_ALERTS_ARRAY = [];
let PANIC_MAP_MARKERS_ARRAY = [];
let PANIC_CIRCLE_MAP_MARKERS_ARRAY = [];

let WARNING_COUNTER_INT = 0;
let PANIC_COUNTER_INT = 0;

WARNING_ALERTS_REFERENCE.on("child_added", (snapshot) => {
  WARNING_NOTIFICATIONS_ARRAY.push({ uid: snapshot.key, ...snapshot.val() });
  WARNING_COUNTER_INT = WARNING_NOTIFICATIONS_ARRAY.length;
  // checkDriverMarkerOnMap("warning", snapshot.key, "start");
  // addDriverMarkerOnMap(item, snap.val(), iconWarning, "warning");
  addCircleToMap({ uid: snapshot.key, node: snapshot.val() }, "goldenrod", "warning");
  // addDataDriverToList(item, "warning", dom_icons.yellowcar);
  // addWarningInfoToModalTable(driverData, snapshot.val(), "warning", dom_icons.warning_icon);
  showAlertCountersOnMapContainer("warning", WARNING_COUNTER_INT);
});

WARNING_ALERTS_REFERENCE.on("child_removed", (snapshot) => {
  WARNING_NOTIFICATIONS_ARRAY = WARNING_NOTIFICATIONS_ARRAY.filter((item) => item.uid !== snapshot.key);
  WARNING_COUNTER_INT = WARNING_NOTIFICATIONS_ARRAY.length;
  // checkDriverMarkerOnMap("warning", key, "finished");
  // const marker = findDriverMarkerByUID(key, WARNING_MAP_MARKERS);
  // removeMarkerFromMap(marker);
  removeCircleMarkerFromMap(snapshot.key, "warning");
  WARNING_MAP_MARKERS_ARRAY = WARNING_MAP_MARKERS_ARRAY.filter((item) => item.options.id !== snapshot.key);
  // settingNewCarTypeInMap(snapshot.key, snapshot.val());
  cleanWarningAlertCounterInContainerMap(WARNING_COUNTER_INT);
});

PANIC_ALERTS_REFERENCE.on("child_added", (snapshot) => {
  PANIC_ALERTS_ARRAY.push({ uid: snapshot.key, ...snapshot.val() });
  PANIC_COUNTER_INT = PANIC_ALERTS_ARRAY.length;
  // checkDriverMarkerOnMap("panic", snapshot.key, "start");
  // addDriverMarkerOnMap(driverData, snapshot.val(), iconPanic, "panic");
  addCircleToMap({ uid: snapshot.key, node: snapshot.val() }, "#ff0000", "panic");
  // addDataDriverToList(driverData, "panic", dom_icons.redcar);
  // addWarningInfoToModalTable(driverData, snapshot.val(), "panic", dom_icons.panic_icon);
  showAlertCountersOnMapContainer("panic", PANIC_COUNTER_INT);
  // GeographicZone.setView([snapshot.val().l[0], snapshot.val().l[1]], 14);
});

PANIC_ALERTS_REFERENCE.on("child_removed", (snapshot) => {
  PANIC_ALERTS_ARRAY = PANIC_ALERTS_ARRAY.filter((item) => item.uid !== snapshot.key);
  PANIC_COUNTER_INT = PANIC_ALERTS_ARRAY.length;
  // checkDriverMarkerOnMap("warning", key, "finished");
  // const marker = findDriverMarkerByUID(key, WARNING_MAP_MARKERS);
  // removeMarkerFromMap(marker);
  removeCircleMarkerFromMap(snapshot.key, "panic");
  PANIC_MAP_MARKERS_ARRAY = PANIC_MAP_MARKERS_ARRAY.filter((item) => item.options.id !== snapshot.key);
  // settingNewCarTypeInMap(snapshot.key, snapshot.val());
  cleanPanicAlertCounterInContainerMap(PANIC_COUNTER_INT);
});

const panicCounterButton = document.querySelector("button#button-panic-counter");
const warningCounterButton = document.querySelector("button#button-warning-counter");
const alerts_modal = document.querySelector("div.modal.alerts-modal");
panicCounterButton.addEventListener("click", function (event) {
  const panicAlerts = getPanicAlerts();
  panicAlerts.forEach(function (alert) {
    addWarningInfoToModalTable(alert, alert, "panic", dom_icons.panic_icon);
  });
  alerts_modal.style.display = "block";
  MODAL_ALERTS_IS_OPENED = true;
});

warningCounterButton.addEventListener("click", function (event) {
  const warningAlerts = getWarningAlerts();
  warningAlerts.forEach(function (alert) {
    addWarningInfoToModalTable(alert, alert, "warning", dom_icons.warning_icon);
  });
  alerts_modal.style.display = "block";
  MODAL_ALERTS_IS_OPENED = true;
});

function getPanicAlerts() {
  let array = [];
  PANIC_ALERTS_ARRAY.forEach(function (element) {
    let elementFind = null;
    elementFind = GLOBAL_ALL_DRIVERS_ARRAY.find(({ uid }) => uid === element.uid);
    if (elementFind !== undefined) {
      array.push({ ...elementFind, isDriver: true, isPanic: true });
    } else {
      elementFind = CLIENTS_INFO_ARRAY.find(({ uid }) => uid === element.uid);
      if (elementFind !== undefined) {
        array.push({ ...elementFind, isDriver: false, isPanic: true });
      }
    }
  });
  return array;
}

function getWarningAlerts() {
  let array = [];
  WARNING_NOTIFICATIONS_ARRAY.forEach(function (element) {
    let elementFind = null;
    elementFind = GLOBAL_ALL_DRIVERS_ARRAY.find(({ uid }) => uid === element.uid);

    if (elementFind !== undefined) {
      array.push({ ...elementFind, isDriver: true, isPanic: false, date: formatDate(element.start)});
    } else {
      elementFind = CLIENTS_INFO_ARRAY.find(({ uid }) => uid === element.uid);
      if (elementFind !== undefined) {
        array.push({ ...elementFind, isDriver: false, isPanic: false, date: formatDate(element.start)});
      }
    }
  });
  return array;
}

function formatDate(input) {
  const parts = input.split('.');
  const [year, month, day, hour, minute, second] = parts;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

const cleanWarningAlertCounterInContainerMap = (counter) => {
  document.querySelector("span#warning-data").textContent = counter;
  if (counter === 0) {
    document.querySelector(`button#button-warning-counter`).style.display = "none";
  }
};

const cleanPanicAlertCounterInContainerMap = (counter) => {
  document.querySelector("span#panic-data").textContent = counter;
  if (counter === 0) {
    document.querySelector(`button#button-panic-counter`).style.display = "none";
  }
};

document.addEventListener("keyup", function (event) {
  if (event.code === "Escape" && MODAL_ALERTS_IS_OPENED === true) {
    alerts_modal.style.display = "none";
    MODAL_ALERTS_IS_OPENED = false;
    document.querySelector("table#alerts-list tbody").innerHTML = null;
  }
});
