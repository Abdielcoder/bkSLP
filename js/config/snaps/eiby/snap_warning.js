warning_eiby.on("child_added", add => {
  const self = add.val();
  const w = {
    id: self.idChofer,
    lat: self.gps[0],
    lng: self.gps[1],
    start: self.start,
    status: self.estatus,
    type: "wp"
  }

  E_WARNING.push(w);

  const driver = DRIVERS.filter(item => item.id == w.id);

  addMarkerToMap(w, cartopyellow, E_WARNING_MAP_MARKERS, driver, null);
  addCircleToMap(w, "goldenrod", "w");
  addWarningToTable(driver, w);
});


warning_eiby.on("child_removed", rem => {
  const self = rem.val();
  const w = {
    id: self.idChofer,
    lat: self.gps[0],
    lng: self.gps[1]
  }

  const ew = E_WARNING_MAP_MARKERS.filter(item => item.options.id == w.id);

  E_WARNING_MAP_MARKERS = E_WARNING_MAP_MARKERS.filter(item => item.options.id != ew[0].options.id);

  removeMarkerFromMap(ew[0], ew.length);
  removeWarningCircleFromMap(w.id);

  E_WARNING = E_WARNING.filter(item => item.id != w.id);
});