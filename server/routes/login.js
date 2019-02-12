const models = require('../models');
const {caver, incidents, incident} = require('../library/caver');

exports.login = function(req, res) {
    models.Login.findOrCreate({
        where: {expotoken: req.body['expotoken']}, 
        defaults: {
            userId: req.body['userId'], 
            isAdmin: req.body['isAdmin']
        }
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });

} ;