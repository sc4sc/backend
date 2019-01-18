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





