/* Jeffrey Garcia 
 * Final Project
 */

var map,
    centerlatlng = L.latLng(34.0522, -118.2437),
    aScale,
    aDiv;

$(function () {

    "use strict";

    var aLayerOne = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var aLayerTwo = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var aLayerFour = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var aLayerThree = L.geoJSON(aGeoJSON, {
        style: function (feature) {
            return {
                stroke: true,
                weight: 0.1,
                color: "#0099ff",
                fillOpacity: 0.05
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
                                //layer.bindTooltip(resultdata.length.toString()).addTo(map);
                                var i;
                                var popConsumer = '';
                                var popBusiness = '';
                                var maxDownC = '';
                                var maxDownB = '';
                                for (i = 0; i < resultdata.length; i++) {
                                    var isp = "<br>" + resultdata[i].dbaname + " </span>";
                                    if (resultdata[i].consumer == 1) {
                                        popConsumer = popConsumer + isp;
                                    } else if (resultdata[i].business == 1) {
                                        popBusiness = popBusiness + isp;
                                    }
                                }
                                for (i = 0; i < resultdata.length; i++) {
                                    var isp = resultdata[i].maxaddown;
                                    if (resultdata[i].consumer == 1) {
                                        maxDownC = Math.max(resultdata[i].maxaddown);
                                    } else if (resultdata[i].business == 1) {
                                        maxDownB = Math.max(resultdata[i].maxaddown);
                                    }
                                }
                                console.info(maxDownC)
                                layer.bindPopup("<b>ISPs for Consumers</b>" + popConsumer + "<br>" + "<b>ISPs for Businesses</b>" + popBusiness).addTo(map);
                                //layer.bindTooltip("<b>Max download speed advertised: </b>" + "<br>" + maxDownC.toString()).addTo(map);
                                $("#aCustomC").html("<b>Total internet service providers: </b>" + resultdata.length.toString() + "<br>" + "<b>Max download speed advertised: </b>" + maxDownC.toString() + "Mbps");
                                layer.on('click', function () {
                                    $("#Providers").html("<b>ISPs for Consumers</b>" + popConsumer + "<p><br></p>" + "<b>ISPs for Businesses</b>" + popBusiness);
                                })

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
                    fillOpacity: 0.05
                });
                $("#aCustomC").html("<b>Total internet service providers: </b>");
            })
            //layer.on("click", function (e) {
            //    map.fitBounds(e.target.getBounds())
            //})
        }
    });

    // Initiate a map object, place it in myMap div and pass its options including the base map layer: aLayerOne
    map = L.map('myMap', {
        center: centerlatlng,
        zoom: 12,
        layers: [aLayerOne, aLayerThree]
    });

    var searchboxControl = createSearchboxControl();
    var control = new searchboxControl({
        sidebarTitleText: 'Header',
        sidebarMenuItems: {
            Items: [
                {
                    type: "link",
                    name: "Link 1 (github.com)",
                    href: "http://github.com",
                    icon: "icon-local-carwash"
                    },
                {
                    type: "link",
                    name: "Link 2 (google.com)",
                    href: "http://google.com",
                    icon: "icon-cloudy"
                    },
                {
                    type: "button",
                    name: "Button 1",
                    onclick: "alert('button 1 clicked !')",
                    icon: "icon-potrait"
                    },
                {
                    type: "button",
                    name: "Button 2",
                    onclick: "button2_click();",
                    icon: "icon-local-dining"
                    },
                {
                    type: "link",
                    name: "Link 3 (stackoverflow.com)",
                    href: 'http://stackoverflow.com',
                    icon: "icon-bike"
                    },
                ]
        }
    });

    control._searchfunctionCallBack = function (searchkeywords) {
        $.ajax({
            url: "https://api.opencagedata.com/geocode/v1/json",
            type: "GET",
            data: {
                q: searchkeywords,
                key: '2236257da1794558a1983df46cdc2dad'
            },
            success: function (resultdata) {
                console.info(resultdata);
                map.flyTo([resultdata.results[0].geometry.lat, resultdata.results[0].geometry.lng], 15)
            }
        })
    }

    map.addControl(control);

    function button2_click() {
        alert('button 2 clicked !!!');
    }

    L.control.scale().addTo(map); // options {metric: false}

    var baseLayers = {
        "Light Base": aLayerOne,
        "Dark Base": aLayerTwo,
        "Darker Base": aLayerFour
    };

    var overLays = {
        "LA County": aLayerThree
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

    map.zoomControl.setPosition('topright');

    L.control.layers(baseLayers, overLays).addTo(map);

}); // end document ready
