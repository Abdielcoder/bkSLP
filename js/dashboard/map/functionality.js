import { all_drivers, snap_working, snap_active, snap_warning, snap_panic, eiby_panic, eiby_warning } from '../../config/config.js';
import { icons, dom_icons } from '../../dom/icons.js';

let drivers_list = await all_drivers();
let working_list = [];
let active_list = [];
let warning_list = [];
let panic_list = [];
let eiby_panic_list = [];
let eiby_warning_list = [];

/* Drivers Markers on Map*/
let working_markers_list = [];
let active_markers_list = [];
let inactive_markers_list = [];

let warning_markers_list = [];
let warning_circle_markers_list = [];
let panic_markers_list = [];
let panic_circle_markers_list = [];

let search_inactive_filter = [];

/* Counters */
let driver_count = drivers_list.dcount;
let libre_count = drivers_list.libre_count;
let sitio_count = drivers_list.sitio_count;
let active_count = 0;
let working_count = 0;
let inactive_count = drivers_list.icount;
let warning_count = 0;
let panic_count = 0;

/* Warning / Panic */
let isIconWarningActive = false;
let isIconPanicActive = false;

document.querySelector("span#total-data").textContent = driver_count;
document.querySelector("span#libre-data").textContent = libre_count;
document.querySelector("span#sitio-data").textContent = sitio_count;

const addDriverMarkerOnMap = async (item, current, iconColor, type) => {
  try {
    const markerPopUpContainer = getPopUpCardFromMarker(item, current, type);
    const whichService = item.vehicle.service || "indefinido";

    let marker = L.marker([
      (current !== undefined ? current.l[0] : item.vehicle.last_gps[0]),
      (current !== undefined ? current.l[1] : item.vehicle.last_gps[1])],
      {
        id: item.id,
        title: item.vehicle.plate,
        icon: iconColor,
        alt: `marker-${item.id}`,
        pos: `icon-${item.id}`
      });

    if (markerPopUpContainer !== false) {
      marker.bindPopup(markerPopUpContainer, { maxWidth: 500 })
        .on("click", event => { event.target.openPopup(); });
    }
    await marker.addTo(GeographicZone);
    marker._icon.classList.add("eye-filter");
    marker._icon.setAttribute("data-type", type);
    marker._icon.setAttribute("data-service", whichService);
    marker._icon.setAttribute("data-vision", "visible");
    console.log(marker);
    setMarkerToArray(marker, type);
  } catch (err) {
    console.log(err);
  }
}


const settingNewCarTypeInMap = (uid, snapshot) => {

  let isWorkingNewDriver = working_markers_list.filter(item => item.options.id === uid);
  if (isWorkingNewDriver.length !== 0) {
    const item = drivers_list.list.filter(item => item.id === uid);
    addDriverMarkerOnMap(item[0], snapshot, iconWorking, dom_icons.bluecar);
    return;
  }

  let isActiveNewDriver = active_markers_list.filter(item => item.options.id === uid);
  if (isActiveNewDriver.length !== 0) {
    const item = drivers_list.list.filter(item => item.id === uid);
    addDriverMarkerOnMap(item[0], snapshot, iconActive, dom_icons.greencar)
    return;
  }
  return;
}

const removeDataFromTable = val => {
  const row = document.getElementsByClassName("tr_" + val)[0];
  row.remove();
}

const showAlertCountersOnMapContainer = (e, count) => {

  const button = document.querySelector(`button[data-event='${e}'`);
  const separator = document.querySelector(`hr.separator.warpan`);

  if (warning_count >= 1) {
    isIconWarningActive = true;
    separator.style.display = 'block';
    button.style.display = 'flex';
  }
  if (panic_count >= 1) {
    isIconPanicActive = true;
    if (separator.style.display === 'none') {
      separator.style.display = 'block';
    }
    button.style.display = 'flex';
  }
  document.querySelector(`span#${e}-data`).textContent = count;
}

const updateNodePosition = (array, node) => {
  return {
    id: array.id,
    personal: array.personal,
    status: array.status,
    delegation: array.delegation,
    vehicle: array.vehicle,
    w: node
  }
}

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

      TR.addEventListener("click", event => {
        const self = event.currentTarget;
        const id = self.getAttribute("class").split('_')[1];
        const type = self.getAttribute("data-type");
        focusMarkerOnMap(id, type);
      })

      list_container.insertAdjacentElement('beforeend', TR);
    }
  } catch (err) {
    console.log(err)
  }
}

const removeMarkerFromMap = (item) => {
  const alt = item.options.alt
  // item.unbindPopup().removeFrom(GeographicZone);
  item.removeFrom(GeographicZone);
  const markers = document.querySelectorAll(`img[alt='${alt}']`)
  markers.forEach(item => {
    item.remove();
  })
}

const focusMarkerOnMap = async (i, t) => {

  let driver_object = [];

  if (t !== 'inactive') {

    if (t === 'active') { driver_object = active_markers_list.filter(item => item.options.id === i); }
    if (t === 'working') { driver_object = working_markers_list.filter(item => item.options.id === i); }
    if (t === 'warning') { driver_object = warning_markers_list.filter(item => item.options.id === i); }
    if (t === 'panic') { driver_object = panic_markers_list.filter(item => item.options.id === i); }
    driver_object[0].openPopup();

    const gps = driver_object[0].getLatLng();
    GeographicZone.setView([gps.lat, gps.lng], 12);
    return;
  }

  updateSearchInactiveFilter(i);
  const mr = inactive_markers_list.filter(item => item.options.id === i);
  mr[0].openPopup();
  const latlng = mr[0].getLatLng();
  GeographicZone.setView([latlng.lat, latlng.lng], 12);
  return;
}

const updateSearchInactiveFilter = i => {

  search_inactive_filter.forEach(item => { item.style.display = "none"; });
  search_inactive_filter = [];
  const inactive_marker = document.querySelector(`img[alt='marker-${i}']`);
  inactive_marker.style.display = "block";
  search_inactive_filter.push(inactive_marker);
  return;
}

const getPopUpCardFromMarker = (item, current, type) => {
  try {
    if (item !== undefined) {
      return `<div class="popup-container">
                        <div>
                            <div class="popup-personal">
                                <div class="icon-text">${item.personal.gender == "m" ? icons.male : icons.female}<span class="capitalize bold">${item.personal.name}</span></div>
                                <div class="icon-text">${icons.phone}<span class="upper">${item.personal.phone}</span></div>
                                <div class="icon-text">${icons.badge}<span class="upper">${item.personal.badge}</span></div>
                                <div class="icon-text">${icons.card}<span class="upper">${item.personal.licence}</span></div>
                                <div class="icon-text">${icons.mail}<span class="lower">${item.personal.email}</span></div>
                            </div>
                            <div class="popup-vehicle">
                                <div class="icon-text"><span class="capitalize bold">${item.vehicle.brand} ${item.vehicle.model}</span></div>
                                <div class="icon-text">${icons.number}<span class="upper">${item.vehicle.num_economic}</span></div>
                                <div class="icon-text">${icons.number}<span class="upper">${item.vehicle.plate}</span></div>
                                <div class="icon-text">${icons.car}<span class="capitalize">${item.vehicle.type}</span></div>
                                <div class="icon-text">${icons.colors}<span class="capitalize">${item.vehicle.color || "n/a"}</span></div>
                            </div>
                        </div>
                        ${current === undefined ? '' : (isAlertEvent(current, type) || '')}
                    </div>`;
    }
  } catch (err) {
    return false;
  }
}

const isAlertEvent = (object, t) => {
  if (t !== 'warning' && t !== 'panic') return;
  const timestamp = object.start;
  return `<div class="time_alert">Hora de alerta: ${formatedTime(timestamp)}</div>`;
}

const formatedTime = tx => {
  const t = tx.split('.');
  return `${t[2]}/${t[1]}/${t[0]} ${t[3]}:${t[4]}:${t[5]}`
}

const getDegreesFromMarker = (gps1, gps2) => {
  const rad = Math.PI / 180;
  let lat1 = gps1.lat * rad;
  let lat2 = gps2.lat * rad;
  let lon1 = gps1.lng * rad;
  let lon2 = gps2.lng * rad;
  let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  return bearing >= 180 ? bearing - 360 : bearing;
}

const setMarkerToArray = async (object, type) => {
  if (type === 'active') { active_markers_list.push(object); return; }
  if (type === 'inactive') { inactive_markers_list.push(object); return; }
  if (type === 'working') { working_markers_list.push(object); return; }
  if (type === 'warning') { warning_markers_list.push(object); return; }
  if (type === 'panic') { panic_markers_list.push(object); return; }
}

const updateDriverMarkerOrientation = (i, a) => {
  const iconImg = document.querySelector(`img[alt='marker-${i}']`);
  const iconStyle = iconImg.style.transform;
  iconImg.style.transformOrigin = "center";
  const newTransformAngle = `${iconStyle.split("rotate")[0]} rotate(${a}deg)`;
  iconImg.style.transform = newTransformAngle;
}

// addWarningInfoToModalTable(item, isWarning, 'warning', dom_icons.yellowcar);
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
    `<button class="attention-button" data-type='${type}' data-id='${item.id}'><img src='${dom_icons.edit}'/></button>`
  ];

  const TR = document.createElement('TR');
  TR.setAttribute('class', `${type}-list_${item.id}`);

  items.forEach(i => {
    const TD = document.createElement('TD');
    TD.insertAdjacentHTML('beforeend', i);
    TR.appendChild(TD);
  });

  const BUTTON = TR.lastElementChild.children[0];
  BUTTON.addEventListener("click", e => {
    const self = e.currentTarget;
    const id = self.getAttribute('data-id');
    attendAlertFromListModal(type, id);
  });

  modal.insertAdjacentElement("beforeend", TR);
}

const attendAlertFromListModal = (type, i) => {
  const alert_box = document.querySelector("div.modal-alert-box");
  alert_box.setAttribute("data-id", i);
  alert_box.setAttribute("data-type", type);
  alert_box.style.display = 'block';
}


const checkDriverMarkerOnMap = async (type, uid, event) => {
  try {
    let whichTypeIs = '';
    const isWorking = await snap_working.child(uid).get().then(snap => {
      return snap.exists();
    });
    const isActive = await snap_active.child(uid).get().then(snap => {
      return snap.exists();
    });
    whichTypeIs = isWorking === true ? 'working' : isActive === true ? 'active' : '';

    if (!isWorking && !isActive) return;

    const marker = document.querySelector(`img[alt='marker-${uid}'][data-type='${whichTypeIs}']`);
    console.log(marker)
    console.log(whichTypeIs);
    const table_row = document.querySelectorAll(`tr.tr_${uid}`);

    if (event === 'start') {
      marker.style.display = 'none';
      table_row.forEach(item => {
        if (item.getAttribute('data-type') !== type) {
          item.classList.add('no-display');
        }
      });
      return;
    }
    marker.style.display = 'block';
    table_row.forEach(item => {
      if (item.getAttribute('data-type') !== type) {
        item.classList.remove('no-display');
      }
    });

  } catch (err) { console.log(err); }
}

const cleanAlertCountInContainerMap = (counter, type) => {

  document.querySelector(`span#${type}-data`).textContent = counter;

  if (counter === 0) {
    document.querySelector(`button.map-data.warpan.${type}`).style.display = 'none';
  }

  if ((warning_count + panic_count) < 1) {
    document.querySelectorAll('.warpan').forEach(elem => {
      elem.style.display = 'none';
    });
    GeographicZone.setView([32.4660333, -116.9167898], 11);
    return;
  }

  return;
}

const addCircleToMap = (item, color, type) => {
  let circle_marker = L.circle([item.node.l[0], item.node.l[1]],
    {
      radius: (() => { return type === "warning" ? 1200 : 2000; })(),
      stroke: true,
      weight: 2,
      opacity: 0.65,
      color: color,
      fillColor: color,
      className: `circle-${item.uid}`
    });
  if (type === "warning") { warning_circle_markers_list.push(circle_marker); }
  if (type === "panic") { panic_circle_markers_list.push(circle_marker); }
  circle_marker.addTo(GeographicZone)
}

const removeCircleMarkerFromMap = (uid, type) => {
  let circle_marker = [];

  if (type === 'warning') {
    circle_marker = warning_circle_markers_list.filter(item => item.options.className === `circle-${uid}`);
  }

  if (type === 'panic') {
    circle_marker = panic_circle_markers_list.filter(item => item.options.className === `circle-${uid}`);
  }

  circle_marker.forEach(item => {
    item.removeFrom(GeographicZone)
  });
}

const executeWebService = () => {
  const api = "http://ec2-3-15-238-62.us-east-2.compute.amazonaws.com/SendActivation.asmx/ActivationLog";
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    if (this.readyState === 4 && this.status === 200) { console.log(this.response); }
    else { console.log(this.response) }
  });
  xhr.open("GET", api);
  xhr.send();
}

snap_working.on('child_added', snap => {
  const isWorking = snap.val();
  try {
    working_count++;
    inactive_count--;
    const driver_data = drivers_list.list.filter(item => item.id === snap.key);
    const item = driver_data[0];
    console.log("LINE 420:")
    console.log(item);
    working_list.push({ ...item, w: isWorking });
    addDriverMarkerOnMap(item, isWorking, iconWorking, 'working');
    addDataDriverToList(item, 'working', dom_icons.bluecar);
    document.querySelector("span#working-data").textContent = working_count;
    document.querySelector("span#inactive-data").textContent = inactive_count;
  }
  catch (err) { console.log(err); }
});

snap_active.on('child_added', snap => {
  const isActive = snap.val();
  try {
    active_count++;
    inactive_count--;
    const driver_data = drivers_list.list.filter(item => item.id === snap.key);
    const item = driver_data[0];
    active_list.push({ ...item, a: isActive });
    console.log("LINE 438:")
    console.log(item)
    addDriverMarkerOnMap(item, isActive, iconActive, 'active');
    addDataDriverToList(item, 'active', dom_icons.greencar);
    document.querySelector("span#active-data").textContent = active_count;
    document.querySelector("span#inactive-data").textContent = inactive_count;
  } catch (err) { console.log(err); }
});

snap_warning.on('child_added', snap => {
  const isWarning = snap.val();
  try {
    warning_count++;
    const driver_data = drivers_list.list.filter(item => item.id === snap.key);
    const item = driver_data[0];
    warning_list.push({ ...item, w: isWarning });
    checkDriverMarkerOnMap('warning', snap.key, 'start');
    addDriverMarkerOnMap(item, isWarning, iconWarning, 'warning');
    addCircleToMap({ uid: snap.key, node: snap.val() }, 'goldenrod', 'warning');
    addDataDriverToList(item, 'warning', dom_icons.yellowcar);
    addWarningInfoToModalTable(item, isWarning, 'warning', dom_icons.warning_icon);
    showAlertCountersOnMapContainer('warning', warning_count);
  } catch (err) { console.log(err); }
});

snap_panic.on('child_added', snap => {
  const isPanic = snap.val();
  try {
    panic_count++;
    const driver_data = drivers_list.list.filter(item => item.id === snap.key);
    const item = driver_data[0];
    panic_list.push({ ...item, p: isPanic });
    checkDriverMarkerOnMap('panic', snap.key, 'start');
    addDriverMarkerOnMap(item, isPanic, iconPanic, 'panic');
    addCircleToMap({ uid: snap.key, node: snap.val() }, '#e83e8c', 'panic');
    addDataDriverToList(item, 'panic', dom_icons.purplecar);
    addWarningInfoToModalTable(item, isPanic, 'panic', dom_icons.panic_icon);
    showAlertCountersOnMapContainer('panic', panic_count);
    // executeWebService()

    GeographicZone.setView([isPanic.l[0], isPanic.l[1]], 14);
  } catch (err) { console.log(err); }
});

eiby_warning.on("child_added", snap => {
  const i = snap.val();
  try {
    warning_count++;
    const item = {
      g: 'nullify',
      l: [i.gps[0], i.gps[1]],
      start: i.start,
      tipo: "1"
    }
    const driver = drivers_list.list.filter(item => item.id === snap.key);
    eiby_warning_list.push(item);
    checkDriverMarkerOnMap('warning', snap.key, 'start');
    addDriverMarkerOnMap(driver, item, iconWarning, 'warning');
    addDataDriverToList(driver[0], 'warning', dom_icons.yellowcar);
    addCircleToMap({ uid: snap.key, node: item }, "goldenrod", "warning");
    addWarningInfoToModalTable(driver[0], item, 'warning', dom_icons.warning_icon);
    showAlertCountersOnMapContainer('warning', warning_count);
    addPanicToTable(driver, p);

  } catch (err) { console.log(err) }
});

eiby_panic.on("child_added", snap => {
  const i = snap.val();
  try {
    panic_count++;
    const item = {
      g: 'nullify',
      l: [i.gps[0], i.gps[1]],
      start: i.start,
      tipo: "1"
    }
    eiby_panic_list.push(item);
    checkDriverMarkerOnMap('panic', snap.key, 'start');
    const driver = drivers_list.list.filter(item => item.id == snap.key);
    addDriverMarkerOnMap(driver[0], item, iconPanic, 'panic');
    addCircleToMap({ uid: snap.key, node: item }, "#e83e8c", "panic");
    addDataDriverToList(driver[0], 'panic', dom_icons.purplecar);
    addWarningInfoToModalTable(driver[0], item, 'panic', dom_icons.panic_icon);
    showAlertCountersOnMapContainer('panic', panic_count);

    GeographicZone.setView([item.l[0], item.l[1]], 14);
  } catch (err) { console.log(err) }
});


snap_working.on('child_changed', snap => {
  try {
    const key = snap.key;
    const item_changed = working_list.filter(item => item.id === snap.key);
    const marker_from_list = working_markers_list.filter(item => item.options.id === key)
    const gps = {
      lat: snap.val().l[0],
      lng: snap.val().l[1]
    }

    if (item_changed.length === 0) return;

    const newDegree = getDegreesFromMarker(
      {
        lat: marker_from_list[0]._latlng.lat,
        lng: marker_from_list[0]._latlng.lng
      },
      {
        lat: gps.lat,
        lng: gps.lng
      });

    marker_from_list[0].setLatLng([gps.lat, gps.lng]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(item_changed[0], snap.val());
    working_list = working_list.filter(item => item.id !== snap.key);
    working_list.push(new_item);

  } catch (err) { console.log(err); }
});

snap_active.on('child_changed', snap => {
  try {
    const key = snap.key;
    const item_changed = active_list.filter(item => item.id === snap.key);
    const marker_from_list = active_markers_list.filter(item => item.options.id === key)
    const gps = {
      lat: snap.val().l[0],
      lng: snap.val().l[1]
    }

    if (item_changed.length === 0) return;

    const newDegree = getDegreesFromMarker(
      {
        lat: marker_from_list[0]._latlng.lat,
        lng: marker_from_list[0]._latlng.lng
      },
      {
        lat: gps.lat,
        lng: gps.lng
      });

    marker_from_list[0].setLatLng([gps.lat, gps.lng]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(item_changed[0], snap.val());
    active_list = active_list.filter(item => item.id !== snap.key);
    active_list.push(new_item);

  } catch (err) { console.log(err); }
});

snap_warning.on('child_changed', snap => {
  try {
    const key = snap.key;
    const item_changed = warning_list.filter(item => item.id === snap.key);
    const marker_from_list = warning_markers_list.filter(item => item.options.id === key)
    const gps = {
      lat: snap.val().l[0],
      lng: snap.val().l[1]
    }

    if (item_changed.length === 0) return;

    const newDegree = getDegreesFromMarker(
      {
        lat: marker_from_list[0]._latlng.lat,
        lng: marker_from_list[0]._latlng.lng
      },
      {
        lat: gps.lat,
        lng: gps.lng
      });

    marker_from_list[0].setLatLng([gps.lat, gps.lng]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(item_changed[0], snap.val());
    warning_list = warning_list.filter(item => item.id !== snap.key);
    warning_list.push(new_item);

  } catch (err) { console.log(err); }
});

snap_panic.on('child_changed', snap => {
  try {
    const key = snap.key;
    const item_changed = panic_list.filter(item => item.id === snap.key);
    const marker_from_list = panic_markers_list.filter(item => item.options.id === key)
    const gps = {
      lat: snap.val().l[0],
      lng: snap.val().l[1]
    }

    if (item_changed.length === 0) return;

    const newDegree = getDegreesFromMarker(
      {
        lat: marker_from_list[0]._latlng.lat,
        lng: marker_from_list[0]._latlng.lng
      },
      {
        lat: gps.lat,
        lng: gps.lng
      });

    marker_from_list[0].setLatLng([gps.lat, gps.lng]);
    updateDriverMarkerOrientation(key, newDegree);

    /* Update the Object from his Array*/
    const new_item = updateNodePosition(item_changed[0], snap.val());
    panic_list = panic_list.filter(item => item.id !== snap.key);
    panic_list.push(new_item);

  } catch (err) { console.log(err); }
});




snap_working.on('child_removed', snap => {
  try {
    working_count--;
    const uid = snap.key;

    console.log(working_list);
    working_list = working_list.filter(item => item.id !== uid);
    const working_in_map = working_markers_list.filter(item => item.options.id === uid);
    removeMarkerFromMap(working_in_map[0]);
    removeDataFromTable(uid);
    working_markers_list = working_markers_list.filter(item => item.options.id !== uid);
    document.querySelector("span#working-data").textContent = working_count;
  } catch (err) { console.log(err); }
});

snap_active.on('child_removed', snap => {
  try {
    active_count--;
    const uid = snap.key;
    active_list = active_list.filter(item => item.id !== uid);
    const active_in_map = active_markers_list.filter(item => item.options.id === uid);
    console.log(active_in_map);
    removeMarkerFromMap(active_in_map[0]);
    removeDataFromTable(uid);
    active_markers_list = active_markers_list.filter(item => item.options.id !== uid);
    document.querySelector("span#active-data").textContent = active_count;
  } catch (err) { console.log(err); }
});

snap_warning.on('child_removed', snap => {
  const uid = snap.key;
  try {
    warning_count--;
    warning_list = warning_list.filter(item => item.id !== uid);
    checkDriverMarkerOnMap('warning', snap.key, 'finished');
    const warning_in_map = warning_markers_list.filter(item => item.options.id === uid);
    removeMarkerFromMap(warning_in_map[0]);
    removeCircleMarkerFromMap(uid, 'warning');
    warning_markers_list = warning_markers_list.filter(item => item.options.id !== uid);
    settingNewCarTypeInMap(uid, snap.val());
    cleanAlertCountInContainerMap(warning_count, 'warning');
  } catch (err) { console.log(err); }
});

snap_panic.on('child_removed', snap => {
  const uid = snap.key;
  try {
    panic_count--;
    panic_list = panic_list.filter(item => item.id !== uid);
    checkDriverMarkerOnMap('panic', snap.key, 'finished');
    const panic_in_map = panic_markers_list.filter(item => item.options.id === uid);
    removeMarkerFromMap(panic_in_map[0]);
    removeCircleMarkerFromMap(uid, 'panic');
    panic_markers_list = panic_markers_list.filter(item => item.options.id !== uid);
    settingNewCarTypeInMap(uid, snap.val());
    cleanAlertCountInContainerMap(panic_count, 'panic');
  } catch (err) { console.log(err); }
});

eiby_panic.on("child_removed", snap => {
  const uid = snap.key;
  const i = snap.val();
  try {
    panic_count--;
    const __item = {
      g: 'nullify',
      l: [i.gps[0], i.gps[1]],
      start: i.start,
      tipo: "1"
    }
    checkDriverMarkerOnMap('panic', snap.key, 'finished');
    const driver = panic_markers_list.filter(item => item.options.id === uid);
    removeMarkerFromMap(driver[0])
    removeCircleMarkerFromMap(uid, 'panic');
    panic_markers_list = panic_markers_list.filter(item => item.options.id !== uid);
    eiby_panic_list = eiby_panic_list.filter(item => item.id !== uid);
    settingNewCarTypeInMap(uid, __item);
    cleanAlertCountInContainerMap(panic_count, 'panic');
  } catch (err) { console.log(err) }
});

eiby_warning.on("child_removed", snap => {
  const i = snap.val();
  const uid = snap.key;
  try {
    warning_count--;
    const __item = {
      g: 'nullify',
      l: [i.gps[0], i.gps[1]],
      start: i.start,
      tipo: "1"
    }
    checkDriverMarkerOnMap('warning', snap.key, 'finished');
    const driver = warning_markers_list.filter(item => item.options.id === uid);
    removeMarkerFromMap(driver[0]);
    removeCircleMarkerFromMap(uid, 'warning');
    warning_markers_list = warning_markers_list.filter(item => item.options.id !== uid);
    eiby_warning_list = eiby_warning_list.filter(item => item.id === uid);
    settingNewCarTypeInMap(uid, __item);
    cleanAlertCountInContainerMap(warning_count, 'warning');
  } catch (err) { console.log(err) }

});

drivers_list.list.forEach(item => {
  addDriverMarkerOnMap(item, undefined, iconInactive, 'inactive');
  addDataDriverToList(item, 'inactive', dom_icons.blackcar);
});