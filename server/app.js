const express = require('express');
const bodyParser  = require('body-parser');
const passport = require('passport');

const models = require('./models');
const route_user = require('./routes/user');

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(passport.initialize());

const rootRouter = require('./routes');
app.use('/api', rootRouter);
app.use('/', rootRouter);

models.sequelize.sync()
  .then(() => {
    console.log('✓ DB connection success.');
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
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH)
  };
  
  https.createServer(options, app).listen(port, function() {
    console.log(`HTTPS has started on port [${port}]`)
  });
}




