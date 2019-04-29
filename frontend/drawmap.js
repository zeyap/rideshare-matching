const drawmap = async ()=>{
    const nyc = await d3.json("taxi_zones.topojson");
    
    const zonesMesh = topojson.mesh(nyc, nyc.objects.taxi_zones);
    const scaleExtent = [0.005,0.01], translateExtent=[[-975900,-120000],[-975800,-119900]];
    let map = d3.select('svg#map');
    let mapWidth = map.attr("width"), 
        mapHeight = map.attr("height");
    let path = d3.geoPath();
    // console.log(path)
    let viewport = map.append('g')
    .attr('transform','scale('+scaleExtent[1]+') translate('+translateExtent[0][0]+','+translateExtent[0][1]+')');
    viewport.selectAll('path')
    .data(topojson.feature(nyc,nyc.objects.taxi_zones).features)
    .enter().append('path').attr("class", "zones").attr('d',path);

    viewport.append('path')
        .attr("class", "zone-borders")
        .attr('d',path(zonesMesh));

    var zoom = d3.zoom()
    .scaleExtent(scaleExtent)
    .translateExtent(translateExtent)
    .on('zoom',zoomed);

    viewport.call(zoom);

    function zoomed() {
        let currTransform = d3.event.transform;
        // console.log(currTransform.x,currTransform.y)
        viewport.attr('transform','scale('+currTransform.k+') translate('+(translateExtent[0][0])+','+(translateExtent[0][1])+')');
        // viewport.attr('transform',currTransform);
    }
}

drawmap();
