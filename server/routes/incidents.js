const models = require('../models');
const expo = require('./push');
const jobQueue = require('../library/jobQueue');
const Op = models.Sequelize.Op;

exports.report =  async function(req, res) {
    var UserId = req.user.id;
    var lat = req.body['lat'];
    var lng = req.body['lng'];
    var type = req.body['type'];

    var newIncident = await models.Incidents.create(
        {type: type, UserId: UserId, lat: lat, lng: lng});
    res.json(newIncident);
    
    jobQueue.addJobIncident(JSON.stringify(req.body), newIncident['id']);

    models.Users.findAll({
        where: {
            id: {
                [Op.ne]: UserId 
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

exports.changeState = async function(req, res) {
    var incidentId = req.params.id;
    var newState = req.body['state'];

    models.Incidents.update(
        {state: newState},
        {where: {id: incidentId}}
    )
    .then((result) => { res.json(result); })
    .catch(console.log);

    var incident = await models.Incidents.findByPk(incidentId);
    var contractAddr = incident['contract'];        

    jobQueue.addJobState(contractAddr, newState);
}

exports.incidentList = async function(req, res) {
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
            include: [
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1}
            ],
        })
        .then((result) => {res.json(result)})
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
            include: [
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1}
            ],
        })
        .then((result) => {res.json(result)})
        .catch(console.log);
        
    } else {
        models.Incidents.findAll({
            order: [[sortBy, order]],
            limit: size,
            include: [
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1}
            ],
        })
        .then((result) => {res.json(result)})
        .catch(console.log);
    }
};

exports.readIncident = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => { res.json(result); })
    .catch(console.log);
};