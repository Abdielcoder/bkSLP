const realtime = firebase.database().ref();
const tarifasRef = realtime.child("Tarifas/SLP");

// const getTarifas = () => {
//   return tarifasRef.once("value").then((snap) => snap.val());
// };

// document.addEventListener("DOMContentLoaded", async () => {
//   let tarifas = await getTarifas(); // Esto debería ser un objeto con las tarifas de SLP.
//   let data_table;

//   const formatCurrency = (cx) => `$${parseFloat(cx).toFixed(2)}`;

//   const generateDataTableObject = () => {
//     data_table = new DataTable("#rates-list", {
//       info: false,
//       paging: false,
//       searching: false,
//       buttons: false,
//     });
//   };

//   generateDataTableObject();

//   // Suponiendo que tarifas sea un objeto con las tarifas directamente como propiedades
//   const data_list = [
//     "SLP", // ID
//     "SLP", // Ciudad
//     formatCurrency(tarifas.banderaDiurna),
//     formatCurrency(tarifas.banderaNocturna),
//     formatCurrency(tarifas.kilometro),
//     formatCurrency(tarifas.min),
//     formatCurrency(tarifas.banderaDiurnaApp),
//     formatCurrency(tarifas.banderaNocturnaApp),
//     formatCurrency(tarifas.kilometroApp),
//     formatCurrency(tarifas.minApp),
//   ];

//   data_table.row.add(data_list).draw();
//   console.log("Tarifas desde tarifas.js" + data_list);
// });

tarifasRef.once("value", (snapshot) => {
  const tarifasData = snapshot.val();
  const tableBody = document.querySelector("table#rates-list tbody");

  tableBody.innerHTML = `<tr>
        <td>SLP</td>
        <td>SLP</td>
        <td>$ ${tarifasData.banderaDiurna}</td>
        <td>$ ${tarifasData.banderaNocturna}</td>
        <td>$ ${tarifasData.kilometro}</td>
        <td>$ ${tarifasData.min}</td>
        <td>$ ${tarifasData.banderaDiurnaApp}</td>
        <td>$ ${tarifasData.banderaNocturnaApp}</td>
        <td>$ ${tarifasData.kilometroApp}</td>
        <td>$ ${tarifasData.minApp}</td>
      </tr>`;
});
