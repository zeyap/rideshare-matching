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
                res.status(500).send(JSON.stringify(err));
            else
                res.status(200).send(data);
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
                res.status(500).send(JSON.stringify(err));
            else
                res.status(200).send(data);
        })
    } else res.status(403).send('Invalid');
});

app.post('/write', function (req, res) {
    if (req.body.depRegionID && req.body.destRegionID && req.body.depTime && req.body.arrTime && req.body.driverID) {
        var finalStatus = 200;
        var finalResp;

        var params1 = {
            TableName: "depRecords",
            Item:{
                "depRegionID": req.body.depRegionID,
                "depTime": req.body.depTime,
                "driverID": req.body.driverID
            }
        }
        docClient.put(params1, function (err, data) {
            if (err) {
                finalStatus = 500;
                finalResp = JSON.stringify(err);
                res.status(finalStatus).send(finalStatus);
            }else{
                var params2 = {
                    TableName: "arrRecords",
                    Item:{
                        "destRegionID": req.body.destRegionID,
                        "arrTime": req.body.arrTime,
                        "driverID": req.body.driverID
                    }
                }
                docClient.put(params2, function (err, data) {
                    if (err) {
                        finalStatus = 500;
                        finalResp = JSON.stringify(err);
                        res.status(finalStatus).send(finalStatus);
                    }else{

                        if(res.statusCode != 500)
                            res.status(200).send("Suceeded");
                        else{
                            res.status(res.statusCode).send("Failed");
                        }
                        
                    }
                })
            }
        })
    } else res.status(403).send("Invalid");
});

app.listen(argv.port);
console.log("Listening on port " + argv.port);
