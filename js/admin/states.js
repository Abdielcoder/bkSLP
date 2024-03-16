import { get_geographic_area, get_geographic_city, get_geographic_country, get_geographic_state } from "../config/config.js";

const area_list = await get_geographic_area();
const cities_list = await get_geographic_city();
const states_list = await get_geographic_state();
const countries_list = await get_geographic_country();

let data_tables = [null, null, null, null]


const getAreaDataList = async isCreated => {
  const isTableWasCreated = await generateDataTable(isCreated, 0, "areas-list");
  if (isTableWasCreated === false) {
    data_tables[0].table.clear().draw(false);
  }
  area_list.forEach(item => {
    const data_list = [
      item.id,
      item.codigo,
      item.codigoCiudad,
      item.nombre
    ];
    data_tables[0].table.row.add([...data_list]).draw(false);
  });

}

const getCitiesDataList = async isCreated => {
  const isTableWasCreated = await generateDataTable(isCreated, 1, "cities-list");
  if (isTableWasCreated === false) {
    data_tables[1].table.clear().draw(false);
  }
  cities_list.forEach(item => {
    const data_list = [
      item.id,
      item.codigo,
      item.codigoEstado,
      item.nombre,
      item.zonaHr
    ];
    data_tables[1].table.row.add([...data_list]).draw(false);
  });

}

const getStatesDataList = async isCreated => {
  const isTableWasCreated = await generateDataTable(isCreated, 2, "states-list");
  if (isTableWasCreated === false) {
    data_tables[2].table.clear().draw(false);
  }
  states_list.forEach(item => {
    const data_list = [
      item.id,
      item.codigo,
      item.codigoPais,
      item.nombre
    ];
    data_tables[2].table.row.add([...data_list]).draw(false);
  });

}

const getCountriesDataList = async (isCreated) => {

  const isTableWasCreated = await generateDataTable(isCreated, 3, "country-list");
  if (isTableWasCreated === false) {
    data_tables[3].table.clear().draw(false);
  }
  countries_list.forEach(item => {
    const data_list = [
      item.id,
      item.codigo,
      item.idioma,
      item.iso,
      item.ubicacion
    ];
    data_tables[3].table.row.add([...data_list]).draw(false);
  });
}

const generateDataTable = async (isCreated, index, table) => {
  if (isCreated === false) {
    const table_object = new DataTable(`#${table}`, {
      info: false,
      paging: false,
      searching: false,
      buttons: false
    });
    data_tables[index] = {
      isCreated: true,
      name: table,
      table: table_object
    }
    return true;
  }
  return false;
}

getAreaDataList(false);
getCitiesDataList(false);
getCountriesDataList(false);
getStatesDataList(false);