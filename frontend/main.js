var express = require('express')
var app = express()
var fs = require('fs')
const path = require('path');
var request = require('request')
var async = require('async');
const dbHost = 'http://a06e0d2c96d5b11e983460ebc79e1f0f-1093846990.us-east-1.elb.amazonaws.com:8888';
const mlHost = "http://a695aa47a701011e983460ebc79e1f0f-1851641049.us-east-1.elb.amazonaws.com:8889";
const manhattan_zones = require('./manhattan_zones.json')
const zones_distance = require('./distances.json');

app.use(express.static('public'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'))
  
})

app.get('/ml/all', function(req,res){
  let {time,locationID} = req.query;
  let params = {
    'time': time,
    'PULocationID': parseInt(locationID)
  }
  
  request.get(mlHost+'/all', {
    json: true,
    body: params
  },function(err, response){
    if(err){
      console.log(err)
    }
    let result=[];
    for(let i=0;i<response.body.customer.length;i++){
      result.push({
        estimatedPassengers: response.body.customer[i],
        estimatedProfit: response.body.fare[i].toFixed(2),
        locationID: response.body.key[i],
        distance: distance(response.body.key[i],locationID).toFixed(1)
      })
    }
    res.send(sortResult(result).slice(0,5))
  })
})

app.get('/ml/customer', function(req,res){
  let {time,locationID} = req.query;
  // console.log(time,locationID)
  if(!manhattan_zones[locationID]){
    res.send(null);
    return;
  }
  var result = {};

  async.forEachOf(manhattan_zones,(zone, PULocationID,callback)=>{
    if(PULocationID === locationID){callback();return;}
    let params = {
      'time': time, 
      'PULocationID': parseInt(PULocationID)
    }
    
    request.get(mlHost+'/customer', {
      json: true,
      body: params
    },function(err, response) {
      if(err){
        console.log(err)
      }else{
        result[params.PULocationID] = result[params.PULocationID]||{};
        result[params.PULocationID]['locationID'] = params.PULocationID;

        result[params.PULocationID]['estimatedPassengers'] = response.body;

        request.get(mlHost+'/fare', {
          json: true,
          body: params
        },function(err, response) {
          if(err){
            console.log(err)
          }else{
            result[params.PULocationID]['estimatedProfit'] = response.body.toFixed(2);
            result[params.PULocationID].distance = distance(params.PULocationID,locationID).toFixed(1);
            callback();
            
          }
        })
      }
    })
    
  },(err)=>{
    if(err){
      console.log('err',err);
    }else{
      let sortedResult = sortResult(result);
      // console.log(result,sortedResult)
      res.send(sortedResult.slice(0,5));
    }
  })
  

})

function sortResult(result){
  let sortedResult = [];
    for(let r in result){
      sortedResult.push(result[r]);
    }
    sortedResult.sort((a,b)=>{

      let r1 = parseFloat(b['estimatedPassengers'])/25*parseFloat(b['estimatedProfit'])-b.distance*2,
      r2 = parseFloat(a['estimatedPassengers'])/25*parseFloat(a['estimatedProfit'])-a.distance*2;
      
      return r1-r2;
    })
    return sortedResult;

}

function distance(id1, id2){
  let dx = (zones_distance[id1][0]-zones_distance[id2][0]),
  dy = (zones_distance[id1][1]-zones_distance[id2][1]);
  return Math.sqrt(dx*dx+dy*dy)/1000;
}

app.listen(3000,function(err){
    console.log("Server listening on port!");
});