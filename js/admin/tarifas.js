// tarifas.js
import { get_tarifas } from '../config/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  let tarifas = await get_tarifas(); // Esto debería ser un objeto con las tarifas de SLP.
  let data_table;

  const formatCurrency = (cx) => {
    return `$${parseFloat(cx).toFixed(2)}`;
  };

  const generateDataTableObject = () => {
    data_table = new DataTable("#rates-list", {
      info: false,
      paging: false,
      searching: false,
      buttons: false
    });
  };

  generateDataTableObject();

  // Suponiendo que tarifas sea un objeto con las tarifas directamente como propiedades
  const data_list = [
    'SLP', // ID
    'SLP', // Ciudad
    formatCurrency(tarifas.banderaDiurna),
    formatCurrency(tarifas.banderaNocturna),
    formatCurrency(tarifas.kilometro),
    formatCurrency(tarifas.min),
    formatCurrency(tarifas.banderaDiurnaApp),
    formatCurrency(tarifas.banderaNocturnaApp),
    formatCurrency(tarifas.kilometroApp),
    formatCurrency(tarifas.minApp),
  ];

  data_table.row.add(data_list).draw();
  console.log("Tarifas desde tarifas.js"+data_list)
});
