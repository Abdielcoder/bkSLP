import { icons, dom_icons } from "../../dom/icons.js";

const realtime = firebase.database().ref();
const DRIVERS_REALTIME_REFERENCE = realtime.child("Users/Drivers");
const DRIVERS_WORKING_REFERENCE = realtime.child("drivers_working");
const DRIVERS_ACTIVE_REFERENCE = realtime.child("active_drivers");
export const PANIC_ALERTS_REFERENCE = realtime.child("panic_button");
export const WARNING_ALERTS_REFERENCE = realtime.child("warning");

let DRIVERS = [];
let WORKING_DRIVERS = [];
let ACTIVE_DRIVERS = [];
let WARNING_NOTIFICATIONS = [];
let PANIC_ALERTS = [];
let WORKING_MAP_MARKERS = [];
let ACTIVE_MAP_MARKERS = [];
let INACTIVE_MAP_MARKERS = [];
let WARNING_MAP_MARKERS = [];
let WARNING_MAP_CIRCLE_MARKERS = [];
let PANIC_MAP_MARKERS = [];
let PANIC_CIRCLE_MAP_MARKERS = [];
let SEARCH_INACTIVE_FILTER = [];
let ACTIVE_COUNTER = 0;
let WORKING_COUNTER = 0;
let INACTIVE_COUNTER = 0;
let WARNING_COUNTER = 0;
let PANIC_COUNTER = 0;

const TAXI_TOTAL_POINTER = document.querySelector("span#total-data");
const LIBRE_TOTAL_POINTER = document.querySelector("span#libre-data");
const SITIO_TOTAL_POINTER = document.querySelector("span#sitio-data");
const WORKING_TOTAL_POINTER = document.querySelector("span#working-data");
const ACTIVE_TOTAL_POINTER = document.querySelector("span#active-data");
const INACTIVE_TOTAL_POINTER = document.querySelector("span#inactive-data");

/* Warning / Panic */
let isIconWarningActive = false;
let isIconPanicActive = false;

async function getAllDrivers() {
  return await DRIVERS_REALTIME_REFERENCE.once("value").then((snapshot) => {
    const snapshotDriversTotal = [];
    let taxiLibreCounter = 0;
    let taxiSitioCounter = 0;
    snapshot.forEach((driver) => {
      let object = driver.val();
      let driverData = {
        id: object.id,
        personal: {
          name: object.nombre_chofer,
          email: object.correo,
          phone: object.telefono,
          gender: object.genero,
          badge: object.gafete,
          licence: object.noLicencia_chofer,
          card: object.tarjeton_ciudad,
        },
        vehicle: {
          num_economic: object.numero_economico,
          service: object.tipo || "",
          brand: object.marca,
          model: object.modelo,
          color: object.color,
          plate: object.placa,
          type: object.tipo_vehiculo,
          last_gps: (() => {
            if (object.last_gps_location === undefined) {
              return [32.53169856666667, -116.95251346666667];
            }
            const gps = object.last_gps_location.split(", ");
            return [gps[0], gps[1]];
          })(),
        },
        delegation: {
          id: object.delegacionID,
          town: object.MUNICIPIO,
        },
        status: {
          messageFlag: object.banderaMensajeI || "N/A",
          status: object.estatus || "N/A",
          process: object.proceso || "N/A",
        },
      };
      driverData.vehicle.service == "SITIO" ? taxiSitioCounter++ : taxiSitioCounter;
      driverData.vehicle.service == "LIBRE" ? taxiLibreCounter++ : taxiLibreCounter;
      snapshotDriversTotal.push(driverData);
    });
    const data = {
      list: snapshotDriversTotal,
      taxiSitioCounter,
      taxiLibreCounter,
    };
    return data;
  });
}

async function main() {
  const data = await getAllDrivers();
  console.log(data);
  DRIVERS = data.list;
  data.list?.forEach((item) => {
    addDriverMarkerOnMap(item, undefined, iconInactive, "inactive");
    addDataDriverToList(item, "inactive", dom_icons.blackcar);
  });

  TAXI_TOTAL_POINTER.textContent = data.taxiLibreCounter + data.taxiSitioCounter;
  INACTIVE_TOTAL_POINTER.textContent = data.taxiLibreCounter + data.taxiSitioCounter;
  INACTIVE_COUNTER = data.taxiLibreCounter + data.taxiSitioCounter;
  LIBRE_TOTAL_POINTER.textContent = data.taxiLibreCounter;
  SITIO_TOTAL_POINTER.textContent = data.taxiSitioCounter;
}

main();

const addDriverMarkerOnMap = async (item, current, iconColor, type) => {
  try {
    const { vehicle, id } = item;
    const markerPopUpContainer = getPopUpCardFromMarker(item, current, type);
    const whichService = vehicle.service || "indefinido";

    const latitude = current !== undefined ? current.l[0] : vehicle.last_gps[0];
    const longitude = current !== undefined ? current.l[1] : vehicle.last_gps[1];

    const markerOptions = {
      id,
      title: vehicle.plate,
      icon: iconColor,
      alt: `marker-${id}`,
      pos: `icon-${id}`,
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
  } catch (err) {
    console.log(err);
  }
};

const settingNewCarTypeInMap = (uid, snapshot) => {
  const { list: driversList } = DRIVERS;
  let workingDriver = findDriverMarkerByUID(uid, WORKING_MAP_MARKERS);
  if (workingDriver) {
    const item = findDriverDataByUID(uid, driversList);
    addDriverMarkerOnMap(item, snapshot, iconWorking, dom_icons.bluecar);
    return;
  }

  let activeDriver = findDriverMarkerByUID(uid, ACTIVE_MAP_MARKERS);
  if (activeDriver) {
    const item = findDriverDataByUID(uid, driversList);
    addDriverMarkerOnMap(item, snapshot, iconActive, dom_icons.greencar);
  }
};

function tabModalEventListener({ currentTarget }) {
  const modalTabButtons = document.querySelectorAll("button.tab-button");
  const nameTab = currentTarget.getAttribute("data-tab");
  const isSelected = currentTarget.getAttribute("aria-selected");

  if (isSelected == "true") {
    return false;
  }

  modalTabButtons.forEach((element) => {
    const isCurrentElement = element.getAttribute("data-tab") === nameTab;
    if (element.getAttribute("aria-selected") == "true" || !isCurrentElement) {
      element.setAttribute("aria-selected", "false");
    } else {
      element.setAttribute("aria-selected", "true");
    }
  });

  const tabContents = document.querySelectorAll("div.formContainer");
  tabContents.forEach((element) => {
    const isVisible = element.getAttribute("data-tabcontainer") === nameTab;
    element.setAttribute("data-visibility", isVisible ? "true" : "false");
  });
}

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

  if (WARNING_COUNTER >= 1) {
    isIconWarningActive = true;
    separator.style.display = "block";
    button.style.display = "flex";
  }
  if (PANIC_COUNTER >= 1) {
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
    id: array.id,
    personal: array.personal,
    status: array.status,
    delegation: array.delegation,
    vehicle: array.vehicle,
    w: node,
  };
};

const addDataDriverToList = async (driver, event, icon) => {
  try {
    if (driver !== undefined) {
      const list_container = document.querySelector("table#data-list tbody");
      const id = driver.id;
      const TR = document.createElement("tr");
      const TD = document.createElement("td");
      const SPAN = document.createElement("span");
      const IMG = document.createElement("img");
      TR.classList.add(`tr_${id}`);
      TD.classList.add("cell-list");
      TR.setAttribute("data-type", event);
      TD.setAttribute("data-num", driver.vehicle.num_economic);
      TD.setAttribute("data-phone", driver.personal.phone);
      TD.setAttribute("data-licence", driver.personal.licence);

      SPAN.textContent = driver.vehicle.plate;

      IMG.src = icon;
      IMG.classList.add("car_icon");

      TD.append(SPAN, IMG);
      TR.append(TD);

      TR.addEventListener("click", (event) => {
        const self = event.currentTarget;
        const id = self.getAttribute("class").split("_")[1];
        const type = self.getAttribute("data-type");
        focusMarkerOnMap(id, type);
      });

      list_container.insertAdjacentElement("beforeend", TR);
    }
  } catch (err) {
    console.error(err);
  }
};

const removeMarkerFromMap = (item) => {
  const { options } = item;
  const element = `img[alt='${options.alt}']`;
  item.removeFrom(GeographicZone);
  document.querySelectorAll(element).forEach((e) => e.remove());
};

const focusMarkerOnMap = async (uid, t) => {
  let driverMarkerItem = [];

  if (t !== "inactive") {
    if (t === "active") driverMarkerItem = ACTIVE_MAP_MARKERS.filter(({ options }) => options.id === uid);
    if (t === "working") driverMarkerItem = WORKING_MAP_MARKERS.filter(({ options }) => options.id === uid);
    if (t === "warning") driverMarkerItem = WARNING_MAP_MARKERS.filter(({ options }) => options.id === uid);
    if (t === "panic") driverMarkerItem = PANIC_MAP_MARKERS.filter(({ options }) => options.id === uid);
    driverMarkerItem[0].openPopup();
    const { lat, lng } = driverMarkerItem[0].getLatLng();
    GeographicZone.setView([lat, lng], 12);
    return;
  }

  updateSearchInactiveFilter(i);
  const marker = findDriverMarkerByUID(i, INACTIVE_MAP_MARKERS);
  marker.openPopup();
  const { latitude, longitude } = marker.getLatLng();
  GeographicZone.setView([latitude, longitude], 12);
};

const updateSearchInactiveFilter = (i) => {
  SEARCH_INACTIVE_FILTER.forEach((item) => {
    item.style.display = "none";
  });
  SEARCH_INACTIVE_FILTER = [];
  const inactive_marker = document.querySelector(`img[alt='marker-${i}']`);
  inactive_marker.style.display = "block";
  SEARCH_INACTIVE_FILTER.push(inactive_marker);
  return;
};

const getPopUpCardFromMarker = (item, current, type) => {
  try {
    if (item !== undefined) {
      return `   
  <div class="driver-popup">
    <div class="popup-tabs">
      <ul class="tab-list">
        <li>
          <button type="button" class="tab-button" aria-selected="true" data-tab="conductor">
            <span>Conductor</span>
          </button>
        </li>
        <li>
          <button type="button" class="tab-button" aria-selected="false" data-tab="vehiculo">
            <span>Vehículo</span>
          </button>
        </li>
      </ul>
    </div>
    <div class="formContainer" data-tabcontainer="conductor" data-visibility="true">
      <div class="popup-header">
        <h2>Datos generales del conductor</h2>
      </div>
      <div class="popup-body">
        <table>
          <tr>
            <td colspan="3"><span class="th">Nombre completo del conductor</span></td>
            <td>${item.personal.name}</td>
          </tr>
        </table>
        <table>
          <tr>
            <td><span class="th">Sexo:</span></td>
            <td>${item.personal.gender == "m" ? icons.male : icons.female}</td>
          </tr>
        </table>
        <table>
          <tr>
            <td><span class="th">E-mail:</span></td>
            <td>${item.personal.email}</td>
          </tr>
          <tr>
            <td><span class="th">Teléfono celular a 10 dígitos:</span></td>
            <td>${item.personal.phone}</td>
          </tr>
          <tr>
            <td><span class="th">Telefono de emergencia:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Tipo de sangre:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Examen antidoping:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Enfermedades crónicas</span></td>
            <td>
              <table class="no-borders">
                <tr>
                  <td><span class="th">Hipertensión</span></td>
                </tr>
                <tr>
                  <td><span class="th">Diabetes</span></td>
                </tr>
                <tr>
                  <td><span class="th">Insuficiencia cardiaca</span></td>
                </tr>
                <tr>
                  <td><span class="th">Epoc (Enfermedad Pulmonar Obstructiva Crónica)</span></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p class="popup-parraf">Generar código para validar numero telefónico y terminar el registro del conductor</p>
        <table>
          <tr>
            <td><span class="th">Licencia:</span> </td>
            <td>${item.personal.licence}</td>
          </tr>
          <tr>
            <td><span class="th">INE:</span></td>
            <td>${item.personal.badge}</td>
          </tr>
          <tr>
            <td><span class="th">FOTOGRAFIA CONDUCTOR</span></td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="formContainer" data-tabcontainer="vehiculo" data-visibility="false">
      <div class="popup-header">
        <h2>Datos generales del Taxi</h2>
      </div>
      <div class="popup-body">
        <table>
          <tr>
            <td><span class="th">Taxi incluyente:</span></td>
            <td>
              <table class="no-borders">
                <tr>
                  <td>Usuario con capacidades diferentes</td>
                </tr>
                <tr>
                  <td>Mascotas</td>
                </tr>
                <tr>
                  <td>Equipaje</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table>
          <tr>
            <td><span class="th">Número económico de Taxi:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">ID Tarjetón:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">No. Placa:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Marca Automovil:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Modelo:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Color automovil:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span class="th">Fotografia de automovil:</span></td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;
    }
  } catch (err) {
    return false;
  }
};

const isAlertEvent = (object, t) => {
  if (t !== "warning" && t !== "panic") return;
  const timestamp = object.start;
  return `<div class="time_alert">Hora de alerta: ${formatedTime(timestamp)}</div>`;
};

const formatedTime = (tx) => {
  const t = tx.split(".");
  return `${t[2]}/${t[1]}/${t[0]} ${t[3]}:${t[4]}:${t[5]}`;
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
  if (type === "active") return ACTIVE_MAP_MARKERS.push(object);
  if (type === "inactive") return INACTIVE_MAP_MARKERS.push(object);
  if (type === "working") return WORKING_MAP_MARKERS.push(object);
  if (type === "warning") return WARNING_MAP_MARKERS.push(object);
  if (type === "panic") return PANIC_MAP_MARKERS.push(object);
  return;
};

const updateDriverMarkerOrientation = (i, a) => {
  const iconImg = document.querySelector(`img[alt='marker-${i}']`);
  const iconStyle = iconImg.style.transform;
  iconImg.style.transformOrigin = "center";
  const newTransformAngle = `${iconStyle.split("rotate")[0]} rotate(${a}deg)`;
  iconImg.style.transform = newTransformAngle;
};

const addWarningInfoToModalTable = (item, pos, type, icon) => {
  const modal = document.querySelector("div.modal-container-body table#alerts-list tbody");
  const items = [
    `<img class="${pos}_icon" src="${icon}"/>`,
    item.personal.name,
    item.personal.phone,
    item.personal.badge,
    item.personal.email,
    item.vehicle.num_economic,
    item.vehicle.brand,
    item.vehicle.plate,
    `${item.vehicle.type.replace("automovil ", "")} - ${item.vehicle.color}`,
    `<button class="attention-button" data-type='${type}' data-id='${item.id}'><img src='${dom_icons.edit}'/></button>`,
  ];

  const TR = document.createElement("TR");
  TR.setAttribute("class", `${type}-list_${item.id}`);

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

const attendAlertFromListModal = (type, i) => {
  const alert_box = document.querySelector("div.modal-alert-box");
  alert_box.setAttribute("data-id", i);
  alert_box.setAttribute("data-type", type);
  alert_box.style.display = "block";
};

const checkDriverMarkerOnMap = async (type, uid, event) => {
  try {
    let whichTypeIs = "";
    const isWorking = await DRIVERS_WORKING_REFERENCE.child(uid)
      .get()
      .then((snap) => {
        return snap.exists();
      });
    const isActive = await DRIVERS_ACTIVE_REFERENCE.child(uid)
      .get()
      .then((snap) => {
        return snap.exists();
      });
    whichTypeIs = isWorking === true ? "working" : isActive === true ? "active" : "";

    if (!isWorking && !isActive) return;

    const marker = document.querySelector(`img[alt='marker-${uid}'][data-type='${whichTypeIs}']`);
    // console.log(marker);
    // console.log(whichTypeIs);
    const table_row = document.querySelectorAll(`tr.tr_${uid}`);

    if (event === "start") {
      marker.style.display = "none";
      table_row.forEach((item) => {
        if (item.getAttribute("data-type") !== type) {
          item.classList.add("no-display");
        }
      });
      return;
    }
    marker.style.display = "block";
    table_row.forEach((item) => {
      if (item.getAttribute("data-type") !== type) {
        item.classList.remove("no-display");
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const cleanAlertCountInContainerMap = (counter, type) => {
  document.querySelector(`span#${type}-data`).textContent = counter;

  if (counter === 0) {
    document.querySelector(`button.map-data.warpan.${type}`).style.display = "none";
  }

  if (WARNING_COUNTER + PANIC_COUNTER < 1) {
    document.querySelectorAll(".warpan").forEach((elem) => {
      elem.style.display = "none";
    });
    GeographicZone.setView([32.4660333, -116.9167898], 11);
    return;
  }

  return;
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
    WARNING_MAP_CIRCLE_MARKERS.push(CIRCLE_MAP_MARKER);
  }
  if (type === "panic") {
    PANIC_CIRCLE_MAP_MARKERS.push(CIRCLE_MAP_MARKER);
  }
  CIRCLE_MAP_MARKER.addTo(GeographicZone);
};

const removeCircleMarkerFromMap = (uid, type) => {
  let CIRCLE_MAP_MARKER =
    type === "warning"
      ? WARNING_MAP_CIRCLE_MARKERS.filter(({ options }) => options.className === `circle-${uid}`)
      : PANIC_CIRCLE_MAP_MARKERS.filter(({ options }) => options.className === `circle-${uid}`);

  CIRCLE_MAP_MARKER.forEach((item) => {
    item.removeFrom(GeographicZone);
  });
};

const executeWebService = () => {
  const api = "http://ec2-3-15-238-62.us-east-2.compute.amazonaws.com/SendActivation.asmx/ActivationLog";
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.response);
    } else {
      console.log(this.response);
    }
  });
  xhr.open("GET", api);
  xhr.send();
};

/**
 * Drivers Working References (OnAdded, onChanged, onRemoved)
 **/
DRIVERS_WORKING_REFERENCE.on("child_added", (snap) => {
  try {
    WORKING_COUNTER++;
    INACTIVE_COUNTER--;
    const item = findDriverDataByUID(snap.key, DRIVERS);
    WORKING_DRIVERS.push({ ...item, w: snap.val() });
    addDriverMarkerOnMap(item, snap.val(), iconWorking, "working");
    addDataDriverToList(item, "working", dom_icons.bluecar);
    WORKING_TOTAL_POINTER.textContent = WORKING_COUNTER;
    INACTIVE_TOTAL_POINTER.textContent = INACTIVE_COUNTER;
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_WORKING_REFERENCE.on("child_changed", (snap) => {
  try {
    const driver = findDriverDataByUID(snap.key, WORKING_DRIVERS);
    const marker = findDriverMarkerByUID(snap.key, WORKING_MAP_MARKERS);
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
    WORKING_DRIVERS = WORKING_DRIVERS.filter((item) => item.id !== snap.key);
    WORKING_DRIVERS.push(new_item);
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_WORKING_REFERENCE.on("child_removed", ({ key }) => {
  try {
    WORKING_COUNTER--;
    WORKING_DRIVERS = WORKING_DRIVERS.filter(({ id }) => id !== key);
    const marker = findDriverMarkerByUID(key, WORKING_MAP_MARKERS);
    removeMarkerFromMap(marker);
    removeDataFromTable(key);
    WORKING_MAP_MARKERS = WORKING_MAP_MARKERS.filter(({ options }) => options.id !== key);
    WORKING_TOTAL_POINTER.textContent = WORKING_COUNTER;
  } catch (err) {
    console.error(err);
  }
});

/**
 * Realtime Events
 * @param {Array<Object>} snapshot - Listado de objetos dentro de la colección.
 * @throws {Error} Si dentro de una funcion algo se ejecuta mal.
 */
DRIVERS_ACTIVE_REFERENCE.on("child_added", (snapshot) => {
  try {
    ACTIVE_COUNTER++;
    INACTIVE_COUNTER--;
    const item = findDriverDataByUID(snapshot.key, DRIVERS);
    ACTIVE_DRIVERS.push({ ...item, a: snapshot.val() });
    addDriverMarkerOnMap(item, snapshot.val(), iconActive, "active");
    addDataDriverToList(item, "active", dom_icons.greencar);
    ACTIVE_TOTAL_POINTER.textContent = ACTIVE_COUNTER;
    INACTIVE_TOTAL_POINTER.textContent = INACTIVE_COUNTER;
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_ACTIVE_REFERENCE.on("child_changed", (snap) => {
  try {
    const driver = findDriverDataByUID(snap.key, ACTIVE_DRIVERS);
    const marker = findDriverMarkerByUID(snap.key, ACTIVE_MAP_MARKERS);
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
    ACTIVE_DRIVERS = ACTIVE_DRIVERS.filter((item) => item.id !== snap.key);
    ACTIVE_DRIVERS.push(newDriverPosition);
  } catch (err) {
    console.error(err);
  }
});

DRIVERS_ACTIVE_REFERENCE.on("child_removed", ({ key }) => {
  try {
    ACTIVE_COUNTER--;
    ACTIVE_DRIVERS = ACTIVE_DRIVERS.filter(({ id }) => id !== key);
    const marker = findDriverMarkerByUID(key, ACTIVE_MAP_MARKERS);
    removeMarkerFromMap(marker);
    removeDataFromTable(key);
    ACTIVE_MAP_MARKERS = ACTIVE_MAP_MARKERS.filter(({ options }) => options.id !== key);
    ACTIVE_TOTAL_POINTER.textContent = ACTIVE_COUNTER;
  } catch (err) {
    console.error(err);
  }
});

/**
 * Warning References (OnAdded, onChanged, onRemoved)
 **/
WARNING_ALERTS_REFERENCE.on("child_added", (snap) => {
  try {
    WARNING_COUNTER++;
    const item = findDriverDataByUID(snap.key, DRIVERS);
    WARNING_NOTIFICATIONS.push({ ...item, w: snap.val() });
    checkDriverMarkerOnMap("warning", snap.key, "start");
    addDriverMarkerOnMap(item, snap.val(), iconWarning, "warning");
    addCircleToMap({ uid: snap.key, node: snap.val() }, "goldenrod", "warning");
    addDataDriverToList(item, "warning", dom_icons.yellowcar);
    addWarningInfoToModalTable(item, snap.val(), "warning", dom_icons.warning_icon);
    showAlertCountersOnMapContainer("warning", WARNING_COUNTER);
  } catch (err) {
    console.log(err);
  }
});

WARNING_ALERTS_REFERENCE.on("child_changed", (snap) => {
  try {
    const { key } = snap;
    const driver = findDriverDataByUID(key, WARNING_NOTIFICATIONS);
    const marker = findDriverMarkerByUID(key, WARNING_MAP_MARKERS);
    const latitude = snap.val().l[0];
    const longitude = snap.val().l[1];

    if (!driver) return;

    const newDegree = getDegreesFromMarker(
      { lat: marker._latlng.lat, lng: marker._latlng.lng },
      { lat: latitude, lng: longitude }
    );

    marker.setLatLng([latitude, longitude]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(driver, snap.val());
    WARNING_NOTIFICATIONS = WARNING_NOTIFICATIONS.filter((item) => item.id !== snap.key);
    WARNING_NOTIFICATIONS.push(new_item);
  } catch (err) {
    console.error(err);
  }
});

WARNING_ALERTS_REFERENCE.on("child_removed", (snap) => {
  try {
    const { key } = snap;
    WARNING_COUNTER--;
    WARNING_NOTIFICATIONS = WARNING_NOTIFICATIONS.filter((item) => item.id !== key);
    checkDriverMarkerOnMap("warning", key, "finished");
    const marker = findDriverMarkerByUID(key, WARNING_MAP_MARKERS);
    removeMarkerFromMap(marker);
    removeCircleMarkerFromMap(key, "warning");
    WARNING_MAP_MARKERS = WARNING_MAP_MARKERS.filter((item) => item.options.id !== key);
    settingNewCarTypeInMap(key, snap.val());
    cleanAlertCountInContainerMap(WARNING_COUNTER, "warning");
  } catch (err) {
    console.error(err);
  }
});

/**
 * Panic References (OnAdded, onChanged, onRemoved)
 **/
PANIC_ALERTS_REFERENCE.on("child_added", (snap) => {
  try {
    PANIC_COUNTER++;
    const item = findDriverDataByUID(snap.key, DRIVERS);
    PANIC_ALERTS.push({ ...item, p: snap.val() });
    checkDriverMarkerOnMap("panic", snap.key, "start");
    addDriverMarkerOnMap(item, snap.val(), iconPanic, "panic");
    addCircleToMap({ uid: snap.key, node: snap.val() }, "#ff0000", "panic");
    addDataDriverToList(item, "panic", dom_icons.redcar);
    addWarningInfoToModalTable(item, snap.val(), "panic", dom_icons.panic_icon);
    showAlertCountersOnMapContainer("panic", PANIC_COUNTER);
    // executeWebService()
    GeographicZone.setView([snap.val().l[0], snap.val().l[1]], 14);
  } catch (err) {
    console.error(err);
  }
});

PANIC_ALERTS_REFERENCE.on("child_changed", (snap) => {
  try {
    const { key } = snap;
    const driver = findDriverDataByUID(key, PANIC_ALERTS);
    const marker = findDriverMarkerByUID(key, PANIC_MAP_MARKERS);
    const latitude = snap.val().l[0];
    const longitude = snap.val().l[1];

    if (!driver) return;

    const newDegree = getDegreesFromMarker(
      { lat: marker._latlng.lat, lng: marker._latlng.lng },
      { lat: latitude, lng: longitude }
    );

    marker.setLatLng([latitude, longitude]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(driver, snap.val());
    PANIC_ALERTS = PANIC_ALERTS.filter((item) => item.id !== snap.key);
    PANIC_ALERTS.push(new_item);
  } catch (err) {
    console.error(err);
  }
});

PANIC_ALERTS_REFERENCE.on("child_removed", (snap) => {
  try {
    const { key } = snap;
    PANIC_COUNTER--;
    PANIC_ALERTS = PANIC_ALERTS.filter((item) => item.id !== key);
    checkDriverMarkerOnMap("panic", key, "finished");
    const marker = findDriverMarkerByUID(key, PANIC_MAP_MARKERS);
    removeMarkerFromMap(marker);
    removeCircleMarkerFromMap(key, "panic");
    PANIC_MAP_MARKERS = PANIC_MAP_MARKERS.filter((item) => item.options.id !== key);
    settingNewCarTypeInMap(key, snap.val());
    cleanAlertCountInContainerMap(PANIC_COUNTER, "panic");
  } catch (err) {
    console.error(err);
  }
});

$(document).on("click", ".tab-button", function (e) {
  tabModalEventListener(e);
});
