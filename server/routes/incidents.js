const models = require('../models');
const expo = require('./push');
const Op = models.Sequelize.Op;

exports.report =  async function(req, res) {
    var lat = req.body['lat'];
    var lng = req.body['lng'];
    var type = req.body['type'];
    var building = req.body['building'];

    try {
        var newIncident = await models.Incidents.create(
            {type: type, UserId: req.user.id, lat: lat, lng: lng, isTraining: req.body['isTraining'] ? req.body['isTraining'] : false});
        
        res.json(newIncident);
        
    } catch (e) {
        res.status(400).send(new Error("[report] FAIL"));
    }

    var user = await models.Users.findByPk(req.user.id);

    models.Users.findAll({
        where: {
            id: {
                [Op.ne]: req.user.id 
            },
            isTraining: user['isTraining']
        },
        attributes: ['expotoken']
    })
    .then((tokenlist) => { 
        var expoTokenList = JSON.parse(JSON.stringify(tokenlist));
        var pushTokenList=[];
        for(var i in expoTokenList){
            pushTokenList[i] = expoTokenList[i]['expotoken'];
        }

        expo.push(user['isTraining'] ? "[훈련중]":"[긴급]", type, building, pushTokenList);
    })
    .catch(() => {
        res.status(400).send(new Error('[report] DB findAll FAIL'));
    });

};

exports.changeState = async function(req, res) {
    var incidentId = req.params.id;
    var newState = req.body['state'];

    models.Incidents.update(
        {state: newState},
        {where: {id: incidentId}}
    )
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[changeState] DB update FAIL'));
    });    

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
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1},
                { model: models.Users } 
            ],
        })
        .then((result) => {res.json(result)})
        .catch(() => {
            res.status(400).send(new Error('[incidentList] DB findAll FAIL'));
        });
        
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
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1},
                { model: models.Users } 
            ],
        })
        .then((result) => {res.json(result)})
        .catch(() => {
            res.status(400).send(new Error('[incidentList] DB findAll FAIL'));
        });
        
    } else {
        models.Incidents.findAll({
            order: [[sortBy, order]],
            limit: size,
            include: [
                { model: models.Progresses, order: [['updatedAt','DESC']], limit: 1},
                { model: models.Users } 
            ],
        })
        .then((result) => {res.json(result)})
        .catch(() => {
            res.status(400).send(new Error('[incidentList] DB findAll FAIL'));
        });
    }
};

exports.readIncident = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(
        incidentId,
        {include: [{model: models.Users}]}
    )
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[readIncident] DB findByPk FAIL'));
    });
};

exports.delete =  async function(req, res) {
    try {      
        var deleteIncident = await models.Incidents.destroy({
            where: {id: req.params.id}
        });

        res.json(deleteIncident);
    } catch (e) {
        res.status(400).send(new Error("[delete] FAIL"));
    }
};