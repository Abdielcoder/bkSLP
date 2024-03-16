export const snap_drivers = () => {
  return DB_DRIVER.once("value").then(dt => {
    let array = [];
    dt.forEach(el => {
      const uid = el.key;
      if (uid.includes('eiby') === false) {
        if (!el.val().nombre_chofer.includes("AARON ARRIAGA FLORES")) {
          if (!el.val().correo.includes(".gob.mx")) {
            array.push({ uid: uid, v: el.val() });
          }
        }
      }
    });
    return array;
  });
}



// snap_drivers.on("child_added", add => {
//     const self = add.val();
//     const driver = {
//         id: self.id,
//         user: self.user_id,
//         correo: self.correo,
//         nombre: self.nombre_chofer,
//         genero: self.genero,
//         gafete: self.gafete,
//         licencia: self.noLicencia_chofer,
//         telefono: self.telefono,
//         municipio: self.MUNICIPIO,
//         tarjeton: self.tarjeton_ciudad,
//         delegacion: self.delegacionID,
//         no_economico: self.numero_economico,
//         tipo: self.tipo,
//         vehiculo_marca: self.marca,
//         vehiculo_modelo: self.modelo,
//         vehiculo_color: self.color,
//         vehiculo_placas: self.placa,
//         vehiculo_tipo: self.tipo_vehiculo,
//         banderaMensajeI: self.banderaMensajeI,
//         proceso: self.proceso,
//         estatus: self.estatus,
//         last_gps: self.last_gps_location
//     }
//     DRIVERS.push(driver);
//     INACTIVES.push(driver);
//     addInactiveToList(driver, icons.blackcar, "i");
// });


// snap_drivers.on("child_removed", rem => {
//     const self = rem.val();
//     const driver = {
//         id: self.id,
//         user: self.user_id,
//         correo: self.correo,
//         nombre: self.nombre_chofer,
//         genero: self.genero,
//         gafete: self.gafete,
//         licencia: self.noLicencia_chofer,
//         telefono: self.telefono,
//         municipio: self.MUNICIPIO,
//         tarjeton: self.tarjeton_ciudad,
//         delegacion: self.delegacionID,
//         no_economico: self.numero_economico,
//         tipo: self.tipo,
//         vehiculo_marca: self.marca,
//         vehiculo_modelo: self.modelo,
//         vehiculo_color: self.color,
//         vehiculo_placas: self.placa,
//         vehiculo_tipo: self.tipo_vehiculo,
//         banderaMensajeI: self.banderaMensajeI,
//         proceso: self.proceso,
//         estatus: self.estatus
//     }
// });