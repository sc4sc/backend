const models = require('../models');
const expo = require('./push');
const Op = models.Sequelize.Op;
const Log = require('../utils/Log')

exports.report =  async function(req, res, next) {
    var lat = req.body['lat'];
    var lng = req.body['lng'];
    var type = req.body['type'];
    var building = req.body['building'];

    try {
        var newIncident = await models.Incidents.create(
            {type: type, UserId: req.user.id, lat: lat, lng: lng, isTraining: Boolean(req.body['isTraining'])});
        
        res.json(newIncident);
        
    } catch (e) {
        Log.error(e);
        next(new Error("[report] FAIL"));
    }

    var user = await models.Users.findByPk(req.user.id);
    var condition = {where: {id: {[Op.ne]: req.user.id }}, attributes: ['expotoken']};
    if (user['isTraining']) {
        condition = {where: {id: {[Op.ne]: req.user.id }, isTraining: user['isTraining']}, attributes: ['expotoken']};
    }

    try {
        var tokenlist = await models.Users.findAll(condition);
        var expoTokenList = JSON.parse(JSON.stringify(tokenlist));
        var pushTokenList=[];
        for(var i in expoTokenList){
            pushTokenList[i] = expoTokenList[i]['expotoken'];
        }

        const pushTitle = Boolean(user['isTraining'])
            ? "[훈련중]"
            : "[긴급]";
        expo.push(pushTitle, type, building, pushTokenList);
    } catch (e) {
        Log.error(e);
        next(new Error('[report] DB findAll FAIL'));
    }

};

exports.changeState = async function(req, res, next) {
    var incidentId = req.params.id;
    var newState = req.body['state'];

    models.Incidents.update(
        {state: newState},
        {where: {id: incidentId}}
    )
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[changeState] DB update FAIL'));
    });    

}

exports.incidentList = async function(req, res, next) {
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before || "9999-12-31 12:04:43.931+00";
    var after = req.query.after || "1971-02-16 12:04:43.931+00";

    models.Incidents.findAll({
        where: {
            updatedAt: {
                [Op.gt]: after,
                [Op.lt]: before
            }
        },
        order: [[sortBy, order]],
        limit: size,
        include: [
            { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1},
            { model: models.Users } 
        ],
    })
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[incidentList] DB findAll FAIL'));
    });
};

exports.readIncident = function(req, res, next) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(
        incidentId,
        {include: [{model: models.Users}]}
    )
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[readIncident] DB findByPk FAIL'));
    });
};

exports.delete =  async function(req, res, next) {
    try {      
        var deleteIncident = await models.Incidents.destroy({
            where: {id: req.params.id}
        });

        res.json(deleteIncident);
    } catch (e) {
        Log.error(e);
        next(new Error("[delete] FAIL"));
    }
};