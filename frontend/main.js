var express = require('express')
var app = express()
var fs = require('fs')
const path = require('path');
var request = require('request')
const dbUrl = 'http://a06e0d2c96d5b11e983460ebc79e1f0f-1093846990.us-east-1.elb.amazonaws.com:8888';
const mlUrl = "http://ae2c07cc06efd11e983460ebc79e1f0f-113199550.us-east-1.elb.amazonaws.com:8889";

app.use(express.static('public'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'))
  
})

app.get('/ml/customer',function(req,res){
  let {time,PULocationID} = req.query;
  let params = {
    'time': time, 
    'PULocationID': parseInt(PULocationID)
  }
  request.get(mlUrl+'/customer', {
    json: true,
    body: params
  },function(err, response) {
    if(err){
      console.log(err)
    }else{
      console.log(response.body)
    }
    
  })

  res.send({
    predictions: [{
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
  },{
      locationID:70,
      distance:20,
      estimatedPassengers: 500,
      estimatedProfit: 80.96
  }]
  })
})

app.listen(3000,function(err){
    console.log("Server listening on port 3000!");
});