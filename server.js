var shell = require('shelljs');
var macaddress = require('macaddress');
var mac = null;
macaddress.one(function (err, data) {
	mac = data;
});

const path = require('path');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var s3 = new AWS.S3();
var fs = require('fs')
var server = require('http'),
    url = require('url'),
    fs = require('fs');

var port = 9001;
shell.exec("sudo ntpdate pool.ntp.org");

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    var isWin = !!process.platform.match(/^win/);

    if (filename && filename.toString().indexOf(isWin ? '\\uploadFile' : '/uploadFile') != -1 && request.method.toLowerCase() == 'post') {
        uploadFile(request, response);
        return;
    }

    if(uri === "/getmac"){
            response.end(mac);
            return;
    }

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (filename.indexOf('favicon.ico') !== -1) {
            return;
        }

        if (fs.statSync(filename).isDirectory() && !isWin) {
            filename += '/index.html';
        } else if (fs.statSync(filename).isDirectory() && !!isWin) {
            filename += '\\index.html';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write(err + '\n');
                response.end();
                return;
            }

            var contentType;

            if (filename.indexOf('.html') !== -1) {
                contentType = 'text/html';
            }

            if (filename.indexOf('.js') !== -1) {
                contentType = 'application/javascript';
            }

            if (contentType) {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
            } else response.writeHead(200);

            response.write(file, 'binary');
            response.end();
        });
    });
}

var app;

app = server.createServer(serverHandler);

app = app.listen(port, process.env.IP || "0.0.0.0", function() {
    var addr = app.address();

    if (addr.address == '0.0.0.0') {
        addr.address = 'localhost';
    }

    app.address = addr.address;

    console.log("Server listening at", 'http://' + addr.address + ":" + addr.port);
//shell.exec("DISPLAY=:0 chromium-browser http://localhost:9001");
});

function uploadFile(request, response) {
    // parse a file upload
    var mime = require('mime');
    var formidable = require('formidable');
    var util = require('util');

    var form = new formidable.IncomingForm();

    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

    form.uploadDir = __dirname + dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;

    form.parse(request, function(err, fields, files) {
        var file = util.inspect(files);
        console.log(files.file.path)

        response.writeHead(200, getHeaders('Content-Type', 'application/json'));

       // var fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
        var fileName = files.file.name;
        var fileURL = 'http://' + app.address + ':' + port + '/uploads/' + fileName;

        console.log('fileURL: ', fileURL);
        response.write(JSON.stringify({
            fileURL: fileURL
        }));
        response.end();

        var tmpPath = files.file.path;
        x=new Date();
    var s3Path = mac + '/' + x.getFullYear() + "/" + (x.getMonth()+1) + "/" + x.getDate() + "/" + fileName;

    fs.readFile(tmpPath, function (err, data) {
        var params = {
            Bucket:'video-pi-shade',
            ACL:'public-read',
            Key: s3Path,
            Body: data,
            ServerSideEncryption : 'AES256'
        };
        s3.putObject(params, function(err, data) {
            console.log(err);
             fs.unlink(tmpPath, (err1) => {
                  if (err1) {
                   console.error(err1)
                  }
             });
        });
    });

    });
}

function getHeaders(opt, val) {
    try {
        var headers = {};
        headers["Access-Control-Allow-Origin"] = "https://secure.seedocnow.com";
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = true;
        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

        if (opt) {
            headers[opt] = val;
        }

        return headers;
    } catch (e) {
        return {};
    }
}


var SerialPort = require('serialport');var serialPort = new SerialPort('/dev/ttyACM0', {
    baudrate: 9600
});

serialPort.on('data', function (data) {
    console.log('Data:', data);
});// Read data that is available but keep the stream from entering //"flowing mode"
serialPort.on('readable', function () {
    console.log('Data:', port.read());
});
