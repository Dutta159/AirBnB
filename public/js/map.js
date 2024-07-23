
console.log(coordinates);
arr = coordinates.split(",");
console.log(arr);
const map = new maplibregl.Map({
    container: 'map',
    style:
    'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: arr,
    zoom: 8
});

const marker = new maplibregl.Marker({
    color : "red"
})
    .setLngLat(arr)
    .addTo(map);

const popup = new maplibregl.Popup({
    closeOnClick:true,
    closeButton :false
})
    .setLngLat(arr)
    .setHTML('Welcome !!')
    .addTo(map);



    // let coordinates = document.querySelector("#coordinates");
    // 