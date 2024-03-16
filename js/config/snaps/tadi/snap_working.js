snap_working.on("child_added", add => {
  const self = add.val();
  const wdriver = {
    id: add.key,
    lat: self.l[0],
    lng: self.l[1]
  }
  WORKING.push(wdriver);
  const driver = DRIVERS.filter(item => item.id == wdriver.id);
  verifyInactiveDriver(driver);
  addToListTable(driver, icons.bluecar, "b");
  addMarkerToMap(wdriver, cartopblue, WORKING_MAP_MARKERS, driver, "servicio");
});


snap_working.on("child_changed", item => {
  const identifier = item.key;
  const wd = WORKING_MAP_MARKERS.filter(item => item.options.id == identifier);
  const lat = item.val().l[0];
  const lng = item.val().l[1];
  if (wd.length == 0) return;
  const iconAngle = bearingDriver({ lat: wd[0]._latlng.lat, lng: wd[0]._latlng.lng }, { lat, lng });
  wd[0].setLatLng([lat, lng]);
  turningiconInMap(identifier, iconAngle);
});


snap_working.on("child_removed", rem => {
  const self = rem.val();
  const wdriver = {
    id: rem.key,
    lat: self.l[0],
    lng: self.l[1]
  }
  const wd = WORKING_MAP_MARKERS.filter(item => item.options.id == wdriver.id);
  WORKING = WORKING.filter(item => item.id != wdriver.id);
  WORKING_MAP_MARKERS = WORKING_MAP_MARKERS.filter(item => item.options.id != wd[0].options.id);
  removeMarkerFromMap(wd[0], wd.length);
  removeDataFromTable(wdriver.id)
  return;
});