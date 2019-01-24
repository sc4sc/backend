const models = require('../models');
const expo = require('./push');
const Op = models.Sequelize.Op;
const {caver, incidents, incident, keystore, password} = require('../models/caver');

exports.report =  async function(req, res) {
    var userId = req.body['userId'];
    var lat = req.body['lat'];
    var lng = req.body['lng'];
    var type = req.body['type'];

    console.log(userId);

    var newIncident = await models.Incidents.create(
        {type: type, userId: userId, lat: lat, lng: lng});
    console.log(newIncident['id']);
    res.json(newIncident);
    

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
            models.Incidents.update(
                {contract: instance._address},
                {where: {id: newIncident['id']}})
            .catch(console.log);
        })
        .catch(console.log);
    });

    models.Login.findAll({
        where: {
            userId: {
                [Op.ne]: userId 
            }
        },
        attributes: ['expotoken']
    })
    .then((tokenlist) => { 
        var expoTokenList = JSON.parse(JSON.stringify(tokenlist));
        var pushTokenList=[];
        for(var i in expoTokenList){
            pushTokenList[i] = expoTokenList[i]['expotoken'];
        }
        console.log("pueshTokenList: "+pushTokenList);
        expo.push(type, pushTokenList);
    })
    .catch(console.log);

};

exports.incidentList = function(req, res) {
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before;
    var after = req.query.after;

    if (before) {
        models.Incidents.findAll({
            where: {
                updatedAt: {
                    [Op.lt]: before 
                }
            },
            order: [[sortBy, order]],
            limit: size,
        })
        .then((result) => { res.json(result); })
        .catch(console.log);
    } else if (after) {
        models.Incidents.findAll({
            where: {
                updatedAt: {
                    [Op.gt]: after 
                }
            },
            order: [[sortBy, order]],
            limit: size,
        })
        .then((result) => { res.json(result); })
        .catch(console.log);
    } else {
        models.Incidents.findAll({
            order: [[sortBy, order]],
            limit: size,
        })
        .then((result) => { res.json(result); })
        .catch(console.log);
    }
    
};

exports.readIncident = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => { res.json(result); })
    .catch(console.log);
};
