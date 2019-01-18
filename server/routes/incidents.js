const models = require('../models');

const Caver = require('caver-js');
const caver = new Caver('http://127.0.0.1:8563');
const incidents = require('../../build/contracts/Incidents.json');
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });

exports.report =  function(req, res) {
    var userId = req.body['userId'];
    var data = req.body['data'];
    var position = data['position'];
    var type = data['type'];
    var content = JSON.stringify(data);
    
    incident.deploy({
        data: incidents["bytecode"],
        arguments: [content]})
    .send({
        from: userId,
        gasPrice: 0, gas: 999999999999 })
    .then((instance) => {
        console.log("deploy contract address: "+instance._address);
        
        models.Incidents.create(
            {type: type, contract: instance._address, userId: userId, lat: position['lat'], lng: position['lng']})
        .then((result) => { res.json({"contract": instance._address}); })
        .catch((error) => { console.log(error); });
    });
    
};

exports.incidentList = function(req, res) {
    models.Incidents.findAll({
        order: [['createdAt', 'desc']]
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });
};

exports.readIncident = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });
};
