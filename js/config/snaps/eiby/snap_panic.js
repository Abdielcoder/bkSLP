panic_eiby.on("child_added", add => {
  const self = add.val();
  const p = {
    id: self.idChofer,
    lat: self.gps[0],
    lng: self.gps[1],
    start: self.start,
    status: self.estatus,
    type: "wp"
  }

  E_PANIC.push(p);

  const driver = DRIVERS.filter(item => item.id == p.id);

  addMarkerToMap(p, cartoppurple, E_PANIC_MAP_MARKERS, driver, null);
  addCircleToMap(p, "#e83e8c", "p");
  addPanicToTable(driver, p);
});


panic_eiby.on("child_removed", rem => {
  const self = rem.val();
  const p = {
    id: self.idChofer,
    lat: self.gps[0],
    lng: self.gps[1]
  }

  const ep = E_PANIC_MAP_MARKERS.filter(item => item.options.id == p.id);

  E_PANIC_MAP_MARKERS = E_PANIC_MAP_MARKERS.filter(item => item.options.id != ep[0].options.id);

  removeMarkerFromMap(ep[0], ep.length);
  removeWarningCircleFromMap(p.id);

  E_PANIC = E_PANIC.filter(item => item.id != p.id);

});
