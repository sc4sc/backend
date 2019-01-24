const models = require('../models');
const Op = models.Sequelize.Op;
const {caver, incidents, incident, keystore, password} = require('../models/caver');

exports.writeProgress =  async function(req, res) {
    var incidentId = parseInt(req.params.id);

    console.log(incidentId);
    var result = await models.Incidents.findByPk(incidentId);
    var incident = JSON.parse(JSON.stringify(result));
    var contractAddr = incident['contract'];
    var incident_contract = new caver.klay.Contract(incidents.abi, contractAddr);
    
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident_contract.methods.addProgress(JSON.stringify(req.body))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    });

    models.Progresses.create({
        content: req.body['content'],
        userId: req.body['userId'], 
        IncidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
};

exports.progressList = function(req, res) {
    var incidentId = parseInt(req.params.id);
    var userId = req.body['userId'];
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before;
    var after = req.query.after;

    if (before) {
        models.Progresses.findAll({
            where: {
                IncidentId: incidentId,
                updatedAt: {
                    [Op.lt]: before 
                }
            },
            order: [[sortBy, order]],
            limit: size
        })
        .then((progresses) => { res.json(progresses); })
        .catch(console.log);
    } else if (after) {
        models.Progresses.findAll({
            where: {
                IncidentId: incidentId,
                updatedAt: {
                    [Op.gt]: after 
                }
            },
            order: [[sortBy, order]],
            limit: size
        })
        .then((progresses) => { res.json(progresses); })
        .catch(console.log);
    } else {
        models.Progresses.findAll({
            where: {IncidentId: incidentId},
            order: [[sortBy, order]],
            limit: size
        })
        .then((progresses) => { res.json(progresses); })
        .catch(console.log);
    }
};