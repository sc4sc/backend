const models = require('../models');
const {caver, incidents, incident} = require('../library/caver');

exports.login = function(req, res) {

    models.Login.create({
        userId: req.body['userId'], 
        expotoken: req.body['expotoken'], 
        isAdmin: req.body['isAdmin']
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });

} ;