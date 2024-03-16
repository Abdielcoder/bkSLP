import { get_tarifas } from '../config/config.js';

const tarifas_list = await get_tarifas();
let data_table = null;
const SELECT = document.querySelector("select#municipios-list");

const getDataToFillTable = async (isCreated, val) => {
  try {
    const tableWasCreated = await generateDataTableObject(isCreated);
    if (tableWasCreated === false) {
      data_table.clear().draw(false);
    }

    tarifas_list.forEach(item => {
      if (item.city !== val) return;
      item.t.forEach((element) => {
        const city = item.city;
        const data_list = [
          `${city}_${element.service}_${element.time}`,
          city,
          formatCurrency(element.flag),
          formatCurrency(element.km),
          formatCurrency(element.min),
          element.service,
          element.time
        ];
        data_table.row.add([...data_list]).draw(false);
      });
    });
  } catch (err) {
    console.log(err.code);
    console.log(err.message);
    alert("Se ha presentado un problema, favor de verificarlo con el Administrador.")
  }
}
const formatCurrency = cx => {
  const coin = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  return coin.format(cx);
}

const generateDataTableObject = async (isCreated) => {
  if (isCreated === false) {
    data_table = new DataTable("#rates-list", {
      info: false,
      paging: false,
      searching: false,
      buttons: false
    });
    return true;
  }
  return false;
}

const fillSelectTagWithOptions = () => {

  tarifas_list.forEach(item => {
    const OPTION = document.createElement("option");
    OPTION.value = item.city;
    OPTION.textContent = item.city.replace("_", " ");
    OPTION.selected = OPTION.value === 'Tijuana' ? true : false;
    SELECT.append(OPTION);
  });
}


fillSelectTagWithOptions();
getDataToFillTable(false, SELECT.value);

document.getElementById("municipios-list").addEventListener("change", e => {
  getDataToFillTable(true, e.currentTarget.value);
});