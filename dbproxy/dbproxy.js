const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
var morgan  = require('morgan')
const app = express();
const argv = require('minimist')(process.argv.slice(1));

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text({ type : "text/*" }));

if (!argv.port)
    argv.port = 8888;
AWS.config.loadFromPath('./config.json');
console.log(AWS.config.credentials);
var docClient = new AWS.DynamoDB.DocumentClient();

app.get('/read', function (req, res) {
    if(req.query.arrTime && req.query.destRegionID) {
        var params = {
            TableName : "arrRecord",
            KeyConditionExpression: "destRegionID = :destRegionID and arrTime > :fromTime",
            ExpressionAttributeValues: {
                ":fromTime": req.query.arrTime,
                ":destRegionID": req.query.destRegionID
            }
        };
        docClient.query(params, function(err, data) {
            if (err)
                req.status(500).send(JSON.stringify(err));
            else
                req.status(200).send(data);
        })
    } else if (req.query.depTime && req.query.depRegionID) {
        var params = {
            TableName: "depRecord",
            KeyConditionExpression: "depRegionID = :depRegionID and depTime > :fromTime",
            ExpressionAttributeValues: {
                ":fromTime": req.query.depTime,
                ":depRegionID": req.query.depRegionID
            }
        };
        docClient.query(params, function (err, data) {
            if (err)
                req.status(500).send(JSON.stringify(err));
            else
                req.status(200).send(data);
        })
    } else req.status(403).send('Invalid');
});

app.post('/write', function (req, res) {
    if (request.query.depRegionID && request.query.destRegionID && request.query.depTime && request.query.arrTime && request.query.driverID) {

        var params = {
            TableName: "depRecord",
            Item:{
                "depRegionID": request.query.depRegionID,
                "depTime": request.query.depTime,
                "driverID": request.query.driverID
            }
        }
        docClient.put(req.query, function (err, data) {
            if (err) {
                req.status(500).send(JSON.stringify(err));
            }
        })


        var params = {
            TableName: "arrRecord",
            Item:{
                "destRegionID": request.query.destRegionID,
                "arrTime": request.query.arrTime,
                "driverID": request.query.driverID
            }
        }
        docClient.put(req.query, function (err, data) {
            if (err) {
                req.status(500).send(JSON.stringify(err));
            }
        })

        if(res.statusCode != 500)
            req.status(200).send("Suceeded");
    } else req.status(403).send("Invalid");
});

app.listen(argv.port);
console.log("Listening on port " + argv.port);
