// console.log('Hello from the client side:)');

export const displayMap = function (locations, startLocation) {
  // Sorted starting location coordinates
  const startLatLng = [
    startLocation.coordinates[1],
    startLocation.coordinates[0],
  ];
  // console.log(sortedCoordsStartingLoc);

  // Map Options to limit zoom while scrolling
  const mapOptions = {
    scrollWheelZoom: false,
    closePopupOnClick: false,
    zoomControl: false,
  };

  // Create map
  const map = L.map('map', mapOptions).setView(startLatLng, 6);

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

  // location.coordinates | location.day | location.description |

  // 1) Add marker and popup for each location in locations array

  // Add markers and bind popups to the map
  for (const location of locations) {
    L.marker([location.coordinates[1], location.coordinates[0]])
      .addTo(map)
      .bindPopup(`Day ${location.day}: ${location.description}`, {
        autoClose: false,
      })
      .openPopup();
  }

  // 2) Add marker and popup for start location
  L.marker(startLatLng)
    .addTo(map)
    .bindPopup(`Start Location: ${startLocation.description}`, {
      autoClose: false,
    })
    .openPopup();
};
/* If stadiamaps is not available in future, use OpenStreetMap

  Initialize map
  Add tile layer
  L.tileLayer
    .grayscale('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        fadeAnimation: false,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(map);
  }
  */
