let map;
let geocoder;
let AdvancedMarkerElement;
let currentMarker = null;

window.initMap = async function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.4093, lng: 49.8671 }, // istediğin başlangıç merkezi
    zoom: 13,
    mapId: "c85dc535485567877bdc6fc9" // kendi map ID'in
  });

  geocoder = new google.maps.Geocoder();
  AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

  // sadece tıklanınca marker oluşturulacak
  map.addListener("click", (event) => {
    const latlng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    // input'a koordinat yaz
    document.getElementById("latlng").value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;

    // eski marker varsa sil
    if (currentMarker) currentMarker.map = null;

    // yeni marker ekle
    currentMarker = new AdvancedMarkerElement({
      map,
      position: latlng
    });

    // adres bilgisini çek
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        document.getElementById("address").value = results[0].formatted_address;
      } else {
        document.getElementById("address").value = "Address not found";
      }
    });
    closeMapModal();
  });
};
