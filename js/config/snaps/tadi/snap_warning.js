snap_warning.on("child_added", add => {
  const self = add.val();
  const dwarning = {
    id: add.key,
    lat: self.l[0],
    lng: self.l[1],
    start: self.start,
    type: "wp",
    tipo: () => {
      return self.tipo == 0 ? "sitio" : "libre";
    }
  }
  const driver = DRIVERS.filter(item => item.id == dwarning.id);
  WARNING.push(driver);

  let drmarker = WORKING_MAP_MARKERS.filter(item => item.options.id == driver[0].id)
  if (drmarker.length > 0) {
    WORKING_MAP_MARKERS = WORKING_MAP_MARKERS.filter(item => item.options.id != drmarker[0].options.id);
  }
  drmarker = ACTIVE_MAP_MARKERS.filter(item => item.options.id == driver[0].id)
  if (drmarker.length > 0) {
    ACTIVE_MAP_MARKERS = ACTIVE_MAP_MARKERS.filter(item => item.options.id != drmarker[0].options.id);
  }
  removeMarkerFromMap(drmarker[0], drmarker.length);
  addMarkerToMap(dwarning, cartopyellow, WARNING_MAP_MARKERS, driver, null);
  addCircleToMap(dwarning, "goldenrod", "w");
  addWarningToTable(driver, dwarning);
});


snap_warning.on("child_changed", item => {
  const identifier = item.key;
  const warn = WARNING_MAP_MARKERS.filter(item => item.options.id == identifier);
  const lat = item.val().l[0];
  const lng = item.val().l[1];
  if (warn.length == 0) return;
  const iconAngle = bearingDriver({ lat: warn[0]._latlng.lat, lng: warn[0]._latlng.lng }, { lat, lng });
  warn[0].setLatLng([lat, lng]);
  turningiconInMap(identifier, iconAngle);
});


snap_warning.on("child_removed", rem => {
  const self = rem.val();
  const warn = {
    id: rem.key,
    lat: self.l[0],
    lng: self.l[1]
  }
  const wa = WARNING_MAP_MARKERS.filter(item => item.options.id == warn.id);
  WARNING = WARNING.filter(item => item[0].id != warn.id);
  WARNING_MAP_MARKERS = WARNING_MAP_MARKERS.filter(item => item.options.id != wa[0].options.id);
  removeMarkerFromMap(wa[0], wa.length);
  removeWarningCircleFromMap(warn.id);
  let drmarker = WORKING.filter(item => item.id == warn.id)
  if (drmarker.length > 0) {
    addMarkerToMap(warn, cartopblue, WORKING_MAP_MARKERS, drmarker, null);
    return;
  }
  drmarker = ACTIVE.filter(item => item.id == warn.id)
  if (drmarker.length > 0) {
    addMarkerToMap(warn, cartopgreen, ACTIVE_MAP_MARKERS, drmarker, null);
    return;
  }
});