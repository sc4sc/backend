const express = require('express');
const bodyParser  = require('body-parser');
const models = require('./models');

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use('/',require('./routes'));

models.sequelize.sync()
  .then(() => {
    console.log('✓ DB connection success.');
    console.log('  Press CTRL-C to stop\n');
  }).catch(err => {
    console.error(err);
    console.log('✗ DB connection error. Please make sure DB is running.');
    process.exit();
  }
);

var server = app.listen(port, function(){
	console.log("Server has started on port [" + port + "]");
});

const enableHTTPS = process.env.ENABLE_HTTPS;

if (enableHTTPS) {
  const https = require('https');
  const fs = require('fs');

  const port = process.env.HTTPS_PORT | 443;
  const options = {
    key: fs.readFileSync('https/key.pem'),
    cert: fs.readFileSync('https/cert.pem')
  };
  
  https.createServer(options, app).listen(port, function() {
    console.log(`HTTPS has started on port [${port}]`)
  });
}




