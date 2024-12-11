var GeographicZone = L.map("mapid").setView([22.151456550718237, -100.97786442650008], 13);

GeographicZone.zoomControl.setPosition("topright");

var PanelControl = L.control.layers();

L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaHJpb3Npc2MiLCJhIjoiY2tsNnl0M3pjMmlndTJwcGx6cDZudGQxMiJ9.L7inlEkfpiGuQ3AgfIz2YQ',
  {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(GeographicZone);


/*- Objects -*/
var __icons = {
  phone: "<img class='card_icon' src='../assets/svg/phone.svg' />",
  male: "<img class='card_icon' src='../assets/svg/male.svg' />",
  female: "<img class='card_icon' src='../assets/svg/female.svg' />",
  number: "<img class='card_icon' src='../assets/svg/number.svg' />",
  colors: "<img class='card_icon' src='../assets/svg/palette_color.svg' />",
  card: "<img class='card_icon' src='../assets/svg/card.svg' />",
  badge: "<img class='card_icon' src='../assets/svg/badge.svg' />",
  mail: "<img class='card_icon' src='../assets/svg/email.svg' />",
  car: "<img class='card_icon' src='../assets/svg/cartype.svg' />",
  greencar: "<img class='car_icon' src='../assets/img/green.png' />",
  blackcar: "<img class='car_icon' src='../assets/img/black.png' />",
  bluecar: "<img class='car_icon' src='../assets/img/blue.png' />",
  redcar: "<img class='car_icon' src='../assets/img/red.png' />",
  purplecar: "<img class='car_icon' src='../assets/img/purple.png' />",
  panic_alert: "<img class='car_icon' src='../assets/svg/panic_alert.svg' />",
  warning_alert: "<img class='car_icon' src='../assets/svg/warning_alert.svg' />",
  add: "<img class='crud-icon' src='../assets/img/add_b.svg' />",
  edit: "<img class='crud-icon' src='../assets/img/edit_blue.svg' />",
  del: "<img class='crud-icon' src='../assets/img/delete_red.svg' />",
}

// -- Estilo de vehiculos --
// const iconWorking = L.icon({ iconUrl: '../assets/img/blue.png', iconSize: [40, 40], popupAnchor: [-2, -15] });
/* 
** New petition
*/
const iconWorking = L.icon({ iconUrl: '../assets/img/red.png', iconSize: [40, 40], popupAnchor: [-2, -15] });
const iconActive = L.icon({ iconUrl: '../assets/img/green.png', iconSize: [40, 40], popupAnchor: [-2, -15] });
const iconInactive = L.icon({ iconUrl: '../assets/img/black.png', iconSize: [40, 40], popupAnchor: [-2, -15] });
const iconWarning = L.icon({ iconUrl: '../assets/img/yellow.png', iconSize: [40, 40], popupAnchor: [-2, -15] });
const iconPanic = L.icon({ iconUrl: '../assets/img/red.png', iconSize: [40, 40], popupAnchor: [-2, -15] });

const driverPanic = L.icon({ iconUrl: '../assets/img/car-icon-red.png', iconSize: [26, 40], popupAnchor: [-2, -15] });
const iconBlue = L.icon({ iconUrl: '../assets/img/car-icon-blue.png', iconSize: [40, 40], alt: "car-icons" });
const iconGreen = L.icon({ iconUrl: '../assets/img/green.png', iconSize: [40, 40], alt: "car-icons" });
const cartopblack = L.icon({ iconUrl: '../assets/img/black.png', iconSize: [40, 40], alt: "car-icons" });

// var lg_all = L.layerGroup();
// var lg_working = L.layerGroup();
// var lg_available = L.layerGroup();
// var lg_unavailable = L.layerGroup();
// var lg_typeL = L.layerGroup();
// var lg_typeS = L.layerGroup();
// var lg_panic = L.layerGroup();

// var fg_all = L.featureGroup();
// var fg_available = L.featureGroup();
// var fg_working = L.featureGroup();
// var fg_unavailable = L.featureGroup();
// var fg_typeL = L.featureGroup();
// var fg_typeS = L.featureGroup();
// var fg_panic = L.featureGroup();

var clickOnMap = 0;
// GeographicZone.on('click', function(e) {
//     console.log(`{lat: ${e.latlng.lat}, lng: ${e.latlng.lng}},`);
//     // console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
// });
