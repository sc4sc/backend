const models = require('../models');
const {caver, incidents, incident, keystore, password} = require('../models/caver');

exports.report =  async function(req, res) {
    var userId = req.body['userId'];
    var data = req.body['data'];
    var position = data['position'];
    var type = data['type'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident.deploy({
            data: incidents["bytecode"],
            arguments: [JSON.stringify(req.body)]})
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then((instance) => {  
            caver.klay.lockAccount(keystore['address']);
            models.Incidents.create(
                {type: type, contract: instance._address, userId: userId, lat: position['lat'], lng: position['lng']})
            .then((result) => { res.json({"contract": instance._address}); })
            .catch(console.log);
        });
    });
    
};

exports.incidentList = function(req, res) {
    models.Incidents.findAll({
        order: [['createdAt', 'desc']]
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
};

exports.readIncident = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => { res.json(result); })
    .catch(console.log);
};
