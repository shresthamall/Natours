console.log('Hello from the client side:)');
const locations = JSON.parse(document.querySelector('#map')?.dataset.locations);
const [lat, lng] = JSON.parse(
  document.querySelector('#map')?.dataset.startLocation
).coordinates;
console.log(locations[0]);

const sortedCoordsStartingLoc = [lng, lat];
console.log(sortedCoordsStartingLoc);

// Sort the coordinates to get the correct order=> latlng -> lnglat
const sortedCoords = [sortedCoordsStartingLoc];
// Add locations to sortedCoords array
for (const loc of locations) {
  const [lat, lng] = loc.coordinates;
  sortedCoords.push([lng, lat]);
}

// Map Options to limit zoom while scrolling
const mapOptions = {
  scrollWheelZoom: false,
  closePopupOnClick: false,
  zoomControl: false,
};
const map = L.map('map', mapOptions).setView(sortedCoordsStartingLoc, 6);

// GrayScale tile layer
L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}',
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png',
  }
).addTo(map);

// Set Zoom control position
L.control
  .zoom({
    position: 'bottomleft',
  })
  .addTo(map);

// Add markers to the map
for (const location of sortedCoords) {
  L.marker(location).addTo(map);
}

// [
//   {
//     type: 'Point',
//     coordinates: [-80.128473, 25.781842],
//     description: 'Lummus Park Beach',
//     day: 1,
//     _id: '5c88fa8cf4afda39709c2959',
//     id: '5c88fa8cf4afda39709c2959',
//   },
//   {
//     type: 'Point',
//     coordinates: [-80.647885, 24.909047],
//     description: 'Islamorada',
//     day: 2,
//     _id: '5c88fa8cf4afda39709c2958',
//     id: '5c88fa8cf4afda39709c2958',
//   },
//   {
//     type: 'Point',
//     coordinates: [-81.0784, 24.707496],
//     description: 'Sombrero Beach',
//     day: 3,
//     _id: '5c88fa8cf4afda39709c2957',
//     id: '5c88fa8cf4afda39709c2957',
//   },
//   {
//     type: 'Point',
//     coordinates: [-81.768719, 24.552242],
//     description: 'West Key',
//     day: 5,
//     _id: '5c88fa8cf4afda39709c2956',
//     id: '5c88fa8cf4afda39709c2956',
//   },
// ];

//   Initialize map
//   Add tile layer
//   L.tileLayer
//     .grayscale('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//       fadeAnimation: false,
//       attribution:
//         '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//     })
//     .addTo(map);
// }
