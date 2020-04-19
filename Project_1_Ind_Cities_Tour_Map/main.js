window.onload = init;

function init(){
    const indCenterCoordinate = [8714303.375499852, 2740470.405877933];
    const map = new ol.Map({
        view: new ol.View({
            center: indCenterCoordinate,
            zoom: 1,
            extent: [7519002.801521538, 827962.6548040379, 10930562.189677693, 4312128.474911098]
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: "openlayers-map"
    })
    //For Getting Coordinates
    /*map.on('click',function(e){
        console.log(e.coordinate);
    })*/

    //Indian Cities GeoJSON
    const indCitiesStyle = function(feature){
        let cityID = feature.get('ID');
        let cityIDString = cityID.toString();
        const styles = [
            new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: [77, 219, 105, 0.6]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [6, 125, 34, 1],
                        width: 2
                    }),
                    radius: 12
                }),
                text: new ol.style.Text({
                    text: cityIDString,
                    scale: 1.5,
                    fill: new ol.style.Fill({
                        color: [232, 26, 26, 1]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [232, 26, 26, 1],
                        width: 0.3
                    })
                })
            })
        ]
        return styles

    }


    //Indian Cities GeoJSON
    const styleForSelect = function(feature){
        let cityID = feature.get('ID');
        let cityIDString = cityID.toString();
        const styles = [
            new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: [247, 26, 26, 0.5]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [6, 125, 34, 1],
                        width: 2
                    }),
                    radius: 12
                }),
                text: new ol.style.Text({
                    text: cityIDString,
                    scale: 1.5,
                    fill: new ol.style.Fill({
                        color: [87, 9, 9, 1]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [87, 9, 9, 1],
                        width: 0.5
                    })
                })
            })
        ]
        return styles

    }




    const indCitiesLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: './data/India_cities_geojson.geojson'
        }),
        style: indCitiesStyle
    })
    map.addLayer(indCitiesLayer);


    //Map Features Click Logic
    const navElements = document.querySelector('.column-navigation');
    const cityNameElement = document.getElementById('cityname');
    const cityImageElement = document.getElementById('cityimage');
    const mapView = map.getView();

    map.on('singleclick', function(evt){
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
            //console.log(feature);
            let featureName = feature.get('Cityname');
            let navElement = navElements.children.namedItem(featureName);
            //console.log(navElement);
            mainLogic(feature, navElement)
        })
    })

    function mainLogic(feature, clickedAnchorElement){
        //Re-assign active class to the clicked element
        let currentActiveStyledElement = document.querySelector('.active');
        currentActiveStyledElement.className = currentActiveStyledElement.className.replace('active', '');
        clickedAnchorElement.className = 'active';

        //Default style for all features

        let indCitiesFeature = indCitiesLayer.getSource().getFeatures();
        indCitiesFeature.forEach(function(feature){
            //console.log(feature);
            feature.setStyle(indCitiesStyle);
        })

        //feature.setStyle(styleForSelect);


        //Home Element : Change content in the menu to Home
        if(clickedAnchorElement.id === 'Home'){
            mapView.animate({center: indCenterCoordinate},{zoom: 4})
            cityNameElement.innerHTML = 'Welcome to Indian IT Cities Tour Map';
            cityImageElement.setAttribute('src', './data/City_images/Indian_Flag.jpg');
        }

        //Change view, and content in the menu based on the feature
        else{
            feature.setStyle(styleForSelect);
            //Change the view based on the feature
            let featureCoordinates = feature.get('geometry').getCoordinates();
            mapView.animate({center: featureCoordinates}, {zoom: 5})
            let featureName = feature.get('Cityname');
            let featureImage = feature.get('Cityimage');
            //console.log(featureName);
            //console.log(featureImage);
            cityNameElement.innerHTML = 'Name of the city: ' + featureName;
            cityImageElement.setAttribute('src', './data/City_images/'+ featureImage + '.jpg');

        }

        

    }


    //Navigation Button Logic
    const anchorNavElements = document.querySelectorAll('.column-navigation > a');
    for(let anchorNavElement of anchorNavElements){
        anchorNavElement.addEventListener('click', function(e){
            //console.log(e.currentTarget);
            let clickedAnchorElement = e.currentTarget;
            let clickedAnchorElementID = clickedAnchorElement.id;
            let indiaCitiesFeatures = indCitiesLayer.getSource().getFeatures();
            indiaCitiesFeatures.forEach(function(feature){
                let featureCityName = feature.get('Cityname');
                if(clickedAnchorElementID === featureCityName){
                    mainLogic(feature, clickedAnchorElement);
                }
            })
            //Home Navigation Case
            if(clickedAnchorElementID === 'Home'){
                mainLogic(undefined, clickedAnchorElement);
            }
        })
    }


    //Feature Hover Logic
    const popoverTextElement = document.getElementById('popover-text');
    const popoverTextLayer = new ol.Overlay({
        element: popoverTextElement,
        positioning: 'bottom-center',
        stopEvent: false
    })
    map.addOverlay(popoverTextLayer);

    map.on('pointermove', function(e){
        //console.log(e.pixel);
        let isFeatureAtPixel = map.hasFeatureAtPixel(e.pixel);
        //console.log(isFeatureAtPixel);
        if(isFeatureAtPixel){
            let featureAtPixel = map.getFeaturesAtPixel(e.pixel);
            //console.log(featureAtPixel);
            let featureName = featureAtPixel[0].get('Cityname');
            popoverTextLayer.setPosition(e.coordinate);
            popoverTextElement.innerHTML = featureName;
            map.getViewport().style.cursor = 'pointer';
        }
        else{
            popoverTextLayer.setPosition(undefined);
            map.getViewport().style.cursor = '';
        }

    })
}