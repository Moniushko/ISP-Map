

var map,
    centerlatlng = L.latLng(34.2410, -118.5277),
    aScale,
    aDiv;

$(function () {

    "use strict";

    var aLayerOne = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var aLayerTwo = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var aLayerThree = L.geoJSON(aGeoJSON, {
        style: function (feature) {
            return {
                stroke: false,
                color: "#0099ff",
                fillOpacity: 0.0
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on("mouseover", function () {
                layer.setStyle({
                    fillOpacity: 0.75
                });
                $.ajax({
                    dataType: "json",
                    url: "https://geo.fcc.gov/api/census/area",
                    data: {
                        lat: feature.geometry.coordinates[0][0][1],
                        lon: feature.geometry.coordinates[0][0][0],
                    },
                    success: function (resultdata) {
                        console.info(resultdata);
                        $.ajax({
                            url: "https://opendata.fcc.gov/resource/if4k-kzsc.json",
                            type: "GET",
                            data: {
                                blockcode: resultdata.results[0].block_fips,
                                "$limit": 5000,
                                "$$app_token": "B2LKfSQXKjmE1oM5NQApN6r1H"
                            },
                            success: function (resultdata) {
                                console.info(resultdata);
                                layer.bindTooltip(resultdata.length.toString()).addTo(map);
                                var i;
                                var popupcontent = '';
                                for (i=0;i<resultdata.length;i++){
                                    var isp = "<br><span style='font-weight:bold'>" + resultdata[i].dbaname + " </span>";
                                    popupcontent = popupcontent + isp;
                                }
                                layer.bindPopup("Internet Service Providers" + popupcontent).addTo(map);
                                $("#aCustomC").html("Total internet service providers: " + resultdata.length.toString());
                                //$.each(resultdata, function (i, v) {
                                //    layer.bindPopup.setPopupContent(v.dbaname).addTo(map)
                                //});
                            }

                        })

                    } //end of success function
                }); //end of OpenCage AJAX
            })
            layer.on("mouseout", function () {
                layer.setStyle({
                    fillOpacity: 0
                });
                $("#aCustomC").html("Web-Mapping");
            })
            //layer.on("click", function (e) {
            //    map.fitBounds(e.target.getBounds())
            //})
        }
    });

    // Initiate a map object, place it in myMap div and pass its options including the base map layer: aLayerOne
    map = L.map('myMap', {
        center: centerlatlng,
        zoom: 17,
        layers: [aLayerTwo, aLayerThree]
    });

    /*
    map.on('click', function (event) {
        console.info(event.latlng.lat);
        $.ajax({
            dataType: "json",
            url: "https://geo.fcc.gov/api/census/area",
            data: {
                lat: event.latlng.lat,
                lon: event.latlng.lng,
            },
            success: function (resultdata) {
                console.info(resultdata);
                $.ajax({
                    url: "https://opendata.fcc.gov/resource/if4k-kzsc.json",
                    type: "GET",
                    data: {
                        blockcode: resultdata.results[0].block_fips,
                        "$limit": 5000,
                        "$$app_token": "B2LKfSQXKjmE1oM5NQApN6r1H"
                    },
                    success: function (resultdata) {
                        console.info(resultdata);
                        L.marker(event.latlng).bindPopup(resultdata.length.toString()).addTo(map); //L.marker(event.latlng).bindPopup(resultdata[0]).update(resultdata[1]).addTo(map);
                        //$.each(resultdata, function (i, v) {
                        //    L.marker(event.latlng).bindPopup(v.resultdata).addTo(map);
                        //})
                    }
                });
            } //end of success function
        }); //end of OpenCage AJAX
    }) //end of click event lisener
    */

    L.control.scale().addTo(map); // options {metric: false}

    var baseLayers = {
        "Light Base": aLayerOne,
        "Dark Base": aLayerTwo
    };

    var overLays = {
        "Counties": aLayerThree
    }

    var aControl = L.control({
        position: 'bottomleft',
    });

    aControl.onAdd = function () {
        aDiv = L.DomUtil.create('div');
        $(aDiv).attr('id', 'aCustomC').html('Web-Mapping');
        return aDiv;
    };

    aControl.addTo(map);

    L.control.layers(baseLayers, overLays).addTo(map);

}); // end document ready







