const AWS = require('aws-sdk');
const AmazonDaxClient = require('amazon-dax-client');
const express = require('express');
const bodyParser = require('body-parser');
var morgan  = require('morgan');
const app = express();
const argv = require('minimist')(process.argv.slice(1));

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text({ type : "text/*" }));

if (!argv.port)
    argv.port = 8888;
AWS.config.loadFromPath("./config.json");
console.log(AWS.config.credentials);
var dax = new AmazonDaxClient({endpoints: ["dax-cluster2.ycntqw.clustercfg.dax.use1.cache.amazonaws.com:8111"], region: "us-east-1"});
var docClient = new AWS.DynamoDB.DocumentClient();
var daxClient = new AWS.DynamoDB.DocumentClient({service: dax});

app.get('/read', function (req, res) {
    if(req.body.fromDOTime && req.body.toDOTime && req.body.DOLocationID) {
        let params = {
            TableName : "DORecords",
            KeyConditionExpression: "DOLocationID = :DOLocationID and DOTime between :fromTime and :toTime",
            ExpressionAttributeValues: {
                ":fromTime": req.body.fromDOTime,
		":toTime": req.body.toDOTime,
                ":DOLocationID": req.body.DOLocationID
            }
        };
        daxClient.query(params, function(err, data) {
            if (err)
                res.status(500).send(JSON.stringify(err));
            else
                res.status(200).send(data);
        })
    } else if (req.body.fromPUTime && req.body.toPUTime && req.body.PULocationID) {
        let params = {
            TableName: "PURecords",
            KeyConditionExpression: "PULocationID = :PULocationID and PUTime between :fromTime and :toTime",
            ExpressionAttributeValues: {
                ":fromTime": req.body.fromPUTime,
		":toTime": req.body.toPUTime,
                ":PULocationID": req.body.PULocationID
            }
        };
        daxClient.query(params, function (err, data) {
            if (err)
                res.status(500).send(JSON.stringify(err));
            else
                res.status(200).send(data);
        })
    } else res.status(403).send('Invalid');
});

app.post('/PU', function (req, res) {
    if (req.body.PULocationID && req.body.PUTime && req.body.passenger_count) {
        var finalStatus = 200;
        var finalResp;
        let params = {
            TableName: "PURecords",
            Item:{
                "PULocationID": req.body.PULocationID,
                "PUTime": req.body.PUTime,
                "passenger_count": req.body.passenger_count
            }
        }
        docClient.put(params, function (err, data) {
            if (err) {
	        res.status(500).send(err);
	    }
	    else res.status(200).send(data);
        }); 
    }
    else res.status(403).send("Invalid Body");
});

app.post('/DO', function (req, res) {
    if (req.body.PULocationID && req.body.PUTime && req.body.DOLocationID && req.body.DOTime && req.body.passenger_count && req.body.trip_distance) {
	let params = {
	    TableName: "DORecords",
	    Item:{
		"DOLocationID": req.body.DOLocationID,
		"DOTime": req.body.DOTime,
		"PULocationID": req.body.PULocationID,
		"PUTime": req.body.PUTime,
		"trip_distance": req.body.trip_distance,
		"passenger_count": req.body.passenger_count
	    }
	}
	docClient.put(params, function (err, data) {
	    if (err) {
		res.status(500).send(err);
	    }
	    else res.status(200).send(data);
	});
    } 
    else res.status(403).send("Invalid Body");
});

app.listen(argv.port);
console.log("Listening on port " + argv.port);
