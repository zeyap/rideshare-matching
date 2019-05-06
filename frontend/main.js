var express = require('express')
var app = express()
var fs = require('fs')
const path = require('path');
var request = require('request')
var async = require('async');
const dbHost = 'http://a06e0d2c96d5b11e983460ebc79e1f0f-1093846990.us-east-1.elb.amazonaws.com:8888';
const mlHost = "http://a6c3f9e916fab11e983460ebc79e1f0f-1633208552.us-east-1.elb.amazonaws.com:8889";
const manhattan_zones = require('./manhattan_zones.json')

app.use(express.static('public'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'))
  
})

app.get('/ml/customer', function(req,res){
  let {time,locationID} = req.query;
  console.log(time,locationID)
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
            result[params.PULocationID].distance = 10;
            callback();
            
          }
        })
      }
    })
    
  },(err)=>{
    if(err){
      console.log('err',err);
    }else{
      let sortedResult = [];
      for(let r in result){
        sortedResult.push(result[r]);
      }
      sortedResult.sort((a,b)=>{
        return parseFloat(b['estimatedPassengers'])*parseFloat(b['estimatedProfit'])-parseFloat(a['estimatedPassengers'])*parseFloat(a['estimatedProfit']);
      })
      // console.log(result,sortedResult)
      res.send(sortedResult.slice(0,5));
    }
  })
  

})

app.listen(3000,function(err){
    console.log("Server listening on port 3000!");
});