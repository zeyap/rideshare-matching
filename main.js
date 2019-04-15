const express = require("express");
const axios = require('axios');

const app = express();

const simfile = require('./public/simclient.json')

const SimClient = require('./sim_client.js')

app.use(express.static('public'));

app.get("/",(req,response)=>{
    let send = (args)=>{
        response.send(args);
    }
    var simClient = new SimClient(simfile,send);
    simClient.run();
});

app.listen(3000,function(err){
    console.log("Server listening on port 3000!");
});