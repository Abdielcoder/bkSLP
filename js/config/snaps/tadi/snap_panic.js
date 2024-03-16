snap_panic.on("child_added", add => {
  const self = add.val();
  const dpanic = {
    id: add.key,
    lat: self.l[0],
    lng: self.l[1],
    start: self.start,
    tipo: () => {
      return self.tipo == 0 ? "sitio" : "libre";
    },
    type: "wp"
  }
  const driver = DRIVERS.filter(item => item.id == dpanic.id);
  PANIC.push(driver);

  let drmarker = WORKING_MAP_MARKERS.filter(item => item.options.id == driver[0].id)
  if (drmarker.length > 0) {
    WORKING_MAP_MARKERS = WORKING_MAP_MARKERS.filter(item => item.options.id != drmarker[0].options.id);
  }
  drmarker = ACTIVE_MAP_MARKERS.filter(item => item.options.id == driver[0].id)
  if (drmarker.length > 0) {
    ACTIVE_MAP_MARKERS = ACTIVE_MAP_MARKERS.filter(item => item.options.id != drmarker[0].options.id);
  }
  removeMarkerFromMap(drmarker[0], drmarker.length);
  addMarkerToMap(dpanic, cartoppurple, PANIC_MAP_MARKERS, driver, null);
  addCircleToMap(dpanic, "#e83e8c", "p");
  addPanicToTable(driver, dpanic);
});


snap_panic.on("child_changed", async item => {
  const identifier = item.key;
  const pd = PANIC_MAP_MARKERS.filter(item => item.options.id == identifier);
  const lat = item.val().l[0];
  const lng = item.val().l[1];
  if (pd.length == 0) return;
  const iconAngle = bearingDriver({ lat: pd[0]._latlng.lat, lng: pd[0]._latlng.lng }, { lat, lng });
  pd[0].setLatLng([lat, lng]);
  turningiconInMap(identifier, iconAngle);
});


snap_panic.on("child_removed", rem => {
  const self = rem.val();
  const palert = {
    id: rem.key,
    lat: self.l[0],
    lng: self.l[1]
  }

  const pd = PANIC_MAP_MARKERS.filter(item => item.options.id == palert.id);
  PANIC = PANIC.filter(item => item[0].id != palert.id);
  PANIC_MAP_MARKERS = PANIC_MAP_MARKERS.filter(item => item.options.id != pd[0].options.id);

  removePanicCircleFromMap(palert.id);
  removeMarkerFromMap(pd[0], pd.length);

  let drmarker = WORKING.filter(item => item.id == palert.id)

  if (drmarker.length > 0) {
    addMarkerToMap(palert, cartopblue, WORKING_MAP_MARKERS, drmarker, null);
    return;
  }

  drmarker = ACTIVE.filter(item => item.id == palert.id)

  if (drmarker.length > 0) {
    addMarkerToMap(palert, cartopgreen, ACTIVE_MAP_MARKERS, drmarker, null);
    return;
  }
});