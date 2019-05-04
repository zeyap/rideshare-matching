const drawmap = async ()=>{
    const nyc = await d3.json("taxi_zones.topojson");
    
    const zonesMesh = topojson.mesh(nyc, nyc.objects.taxi_zones);
    // const scaleExtent = [0.001,0.005], translateExtent=[[0,0],[10,10]];
    const scale = 0.005;
    let map = d3.select('svg#map');
    const mapWidth = map.attr("width"), 
        mapHeight = map.attr("height");
        
    let path = d3.geoPath();
    // console.log(path)
    var zones = topojson.feature(nyc,nyc.objects.taxi_zones).features;
    
    let viewport = map.append('g')
    .attr('transform','scale('+scale+') translate('+(-884900)+','+(-120000)+')');
    var zonesMap = viewport.selectAll('path')
    .data(zones)
    .enter().append('path');
    zonesMap.attr("class", "zones").attr('d',path)
    .on("click", center);
    var centered=null;

    const pointRadius = 7/scale;
    let points = [];
    points.push([
        viewport.append('circle').attr('class','points points-0')
        .attr('x',0).attr('y',0).attr('r',pointRadius),
        viewport.append('circle').attr('class','points points-0')
        .attr('x',0).attr('y',0).attr('r',pointRadius*2).attr('opacity','0.3')]);
    for(let p=1;p<=4;p++){
        points.push([
            viewport.append('circle').attr('class','points points-'+p)
            .attr('x',0).attr('y',0).attr('r',pointRadius),
            viewport.append('circle').attr('class','points points-'+p)
            .attr('x',0).attr('y',0).attr('r',pointRadius*1.5).attr('opacity','0.3')]);
    }

    function locatePoint(d,point){
        let coordinates = d.geometry.coordinates;
        let meanX = (Math.min(...coordinates[0].map(e=>parseFloat(e[0])))+Math.max(...coordinates[0].map(e=>parseFloat(e[0]))))/2, 
        meanY = (Math.min(...coordinates[0].map(e=>parseFloat(e[1])))+Math.max(...coordinates[0].map(e=>parseFloat(e[1]))))/2;
        
        point.forEach(p=>p.attr('transform','translate('+parseInt(meanX)+','+parseInt(meanY)+')'))
    }
    function locatePointByLocationID(locationID,pointID){
        locatePoint(zones[locationID-1],points[pointID]);
    }

    function center(d){
        if (!d || centered === d) {
            return;
        }
        
        var x = 0,
        y = 0;

        var centroid = path.centroid(d);
        let w = document.body.clientWidth,h = document.body.clientHeight;
        x = w /2/scale - centroid[0];
        y = h /2/scale - centroid[1];
        centered = d;
        
        zonesMap.attr('class',(d,id)=>{
            if(centered===d){
                return 'zones-centered'
            }
            return 'zones';
        })
    
        // Transition to the new transform.
        viewport.transition()
            .duration(750)
            .attr("transform", "scale("+scale+") translate(" + x + "," + y + ")");
    }
    var centerLocationId = (locationId)=>{
        center(zones[locationId-1])
    }

    viewport.append('path')
        .attr("class", "zone-borders")
        .attr('d',path(zonesMesh));

    // var zoom = d3.zoom()
    // .scaleExtent(scaleExtent)
    // .translateExtent(translateExtent)
    // .on('zoom',zoomed);

    // viewport.call(zoom);

    // function zoomed() {
    //     // let currTransform = d3.event.transform;
    
    //     // map.attr('transform','scale('+(currTransform.k*1/scaleExtent[1])+') translate('+(currTransform.x)+','+(currTransform.y)+')');

    //     // map.attr('transform',currTransform);
        
    // }
    handleSearch(centerLocationId,locatePointByLocationID);
}

const handleSearch = async (centerLocationId,locatePointByLocationID)=>{
    const nycLookup = await d3.json('taxi_zones_lookup.json');
    nycLookup.sort((a,b)=>a.Zone>b.Zone?1:(a.Zone===b.Zone?0:-1));
    
    var searchInput = document.getElementById('search-input');
    var searchValue = '';
    var searchResult = document.getElementById('search-dropdown');
    var predictTemplate = document.getElementById('result-box-template');
    var emptyResultTemplate = document.getElementById('result-box-empty-template');
    var predictResult = document.getElementById('result-area');
    var focusBtn = document.getElementById('focus-btn');
    var points = d3.selectAll('circle.points');
    showEmptyResult();
    disableSearchResult()

    function disableSearchResult(){
        searchResult.style.opacity=0;
        searchResult['pointer-events'] = 'none';
    }
    function enableSearchResult(){
        searchResult.style.opacity=1;
        searchResult['pointer-events'] = 'auto';
    }
    
    searchInput.addEventListener('input',function(evt){
        searchValue = searchInput.value;
        let match = [];
        searchResult.textContent='';
        if(searchValue!==''){
            match = matchResult(nycLookup,searchValue);
        }else{
            showEmptyResult();
        }
        
        if(match.length===0){
            showEmptyResult();
            disableSearchResult();
        }else{
            enableSearchResult();
        }

        match.forEach((elem)=>{
            var item = document.createElement('li');
            item.innerHTML = elem.Zone +' <span style="opacity: 0.5"> ' +elem.Borough+'</span>';

            item.addEventListener('click',()=>{
                
                if(elem.Borough!=='Manhattan'){
                    searchInput.value = 'Sorry, support is only within Manhattan now!'
                    return;
                }else{
                    searchInput.value = elem.Zone;
                }
                queryPrediction(elem)();
            })
            searchResult.appendChild(item);
        });
        
    })

    function showEmptyResult(){
        predictResult.innerHTML="";
        var clone = document.importNode(emptyResultTemplate.content, true);
        predictResult.appendChild(clone);

        points.attr('transform','translate(0,0)')
    }

    function queryPrediction(elem){
        return ()=>{
            focusBtn.addEventListener('click',()=>{
                centerLocationId(elem.LocationID)
            })
            centerLocationId(elem.LocationID);
            locatePointByLocationID(elem.LocationID,0)
            
            let predictions = [{
                locationID:9,
                distance:10,
                estimatedPassengers: 200,
                estimatedProfit: 49.87
            },
            {
                locationID:10,
                distance:20,
                estimatedPassengers: 500,
                estimatedProfit: 80.96
            },
            {
                locationID:50,
                distance:20,
                estimatedPassengers: 500,
                estimatedProfit: 80.96
            },
            {
                locationID:40,
                distance:20,
                estimatedPassengers: 500,
                estimatedProfit: 80.96
            }]
            predictions = predictions.slice(0,5);
            predictResult.innerHTML='';
            
            if(predictions.length===0){
                showEmptyResult();
            }
            predictions.forEach((e,id)=>{
                var clone = document.importNode(predictTemplate.content, true);
                var resultDetails = clone.querySelectorAll('.result-details');
                let zone = nycLookup[e.locationID-1];
                
                resultDetails[0].textContent = zone.Zone;
                resultDetails[1].textContent = e.distance
                resultDetails[2].textContent = e.estimatedPassengers
                resultDetails[3].textContent = e.estimatedProfit
                predictResult.appendChild(clone);

                locatePointByLocationID(e.locationID,id+1)
            })
            document.querySelectorAll('.result-box').forEach((box,id)=>{
                box.addEventListener('click',function(){
                    centerLocationId(predictions[id].locationID);
                })
            })

        }
    }
}

function matchResult(nycLookup, searchValue){
    let result = nycLookup.filter(e=>e.Zone.toLowerCase().indexOf(searchValue.toLowerCase())>-1).slice(0,10);
    return result;
}

drawmap();
