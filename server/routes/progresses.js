const models = require('../models');

const Caver = require('caver-js');
const caver = new Caver('http://127.0.0.1:8563');
const incidents = require('../../build/contracts/Incidents.json');
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });


exports.writeProgress = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => {
        var incident = JSON.parse(JSON.stringify(result));
        var contractAddr = incident['contract'];
        var incident_contract = new caver.klay.Contract(incidents.abi, contractAddr);
    
        incident_contract.methods.addProgress(req.body['content'])
        .send({from: req.body['userId']})
        .catch((error) => { console.log(error); });

    })
    .catch((error) => { console.log(error); });

    models.Progresses.create({
        content: req.body['content'], 
        incidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });
};

exports.progressList = function(req, res) {
    var incidentId = req.params.id;
    var userId = req.body['userId'];

    if (Object.keys(req.query).length === 0) {
        models.Progresses.findAll({
            where: {incidentId: incidentId}
        })
        .then((progresses) => { res.json(progresses); })
        .catch((error) => { console.log(error); });
        
    } else {
        var size = req.query.size;
        var sortBy = req.query.sortBy;
        var order = req.query.order;

        models.Progresses.findAll({
            where: {incidentId: incidentId},
            order: [[sortBy, order]],
            limit: size
        })
        .then((progresses) => { res.json(progresses); })
        .catch((error) => { console.log(error); });
    }
};