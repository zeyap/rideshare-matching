var querystring = require('querystring');
var http = require('http');

var data = querystring.stringify({
    'depRegionID' : '1',
    'destRegionID' : '2',
    'depTime' : '1555446132',
    'arrTime' : '1555446632'
});

var get_options = {
    host: 'a63e40afc608211e9ac180e830f19edf-1994039093.us-east-1.elb.amazonaws.com',
    port: '8888',
    path: '/read',
    method: 'GET',
};

var post_options = {
    host: 'a2c85f7aa608911e9ac180e830f19edf-549149553.us-east-1.elb.amazonaws.com',
    port: '8888',
    path: '/write',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
};


var req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
});

req.write(data)

