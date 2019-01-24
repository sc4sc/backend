const models = require('../models');
const {caver, incidents, incident} = require('../models/caver');

exports.login = function(req, res) {

    if (isRegistration) {
        var user = JSON.parse(JSON.stringify(isRegistration));
        if (user['userId'] === req.body['userId'] && user['isAdmin'] === req.body['isAdmin']) {
            res.json(user);
        } else {
            res.status(401).send();
        }
    } else {
        models.Login.create({
            userId: req.body['userId'], 
            expotoken: req.body['expotoken'], 
            isAdmin: req.body['isAdmin']
        })
        .then((result) => { res.json(result); })
        .catch((error) => { console.log(error); });
    }
;

} 