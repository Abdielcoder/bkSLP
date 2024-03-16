snap_active.on("child_added", add => {
  const self = add.val();
  const adriver = {
    id: add.key,
    lat: self.l[0],
    lng: self.l[1]
  }
  ACTIVE.push(adriver);
  const driver = DRIVERS.filter(item => item.id == adriver.id);
  verifyInactiveDriver(driver);
  addToListTable(driver, icons.greencar, "g");
  addMarkerToMap(adriver, cartopgreen, ACTIVE_MAP_MARKERS, driver, "activo");
});


snap_active.on("child_changed", item => {
  const identifier = item.key;
  const ad = ACTIVE_MAP_MARKERS.filter(item => item.options.id == identifier);
  const lat = item.val().l[0];
  const lng = item.val().l[1];
  if (ad.length == 0) return;
  const iconAngle = bearingDriver({ lat: ad[0]._latlng.lat, lng: ad[0]._latlng.lng }, { lat, lng });
  ad[0].setLatLng([lat, lng]);
  turningiconInMap(identifier, iconAngle);
});


snap_active.on("child_removed", rem => {
  const self = rem.val();
  const adriver = {
    id: rem.key,
    lat: self.l[0],
    lng: self.l[1]
  }
  const ad = ACTIVE_MAP_MARKERS.filter(item => item.options.id == adriver.id)
  ACTIVE = ACTIVE.filter(item => item.id != adriver.id);
  ACTIVE_MAP_MARKERS = ACTIVE_MAP_MARKERS.filter(item => item.options.id != ad[0].options.id);
  removeMarkerFromMap(ad[0], ad.length);
  removeDataFromTable(adriver.id)
  return;
});