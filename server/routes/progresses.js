const models = require('../models');
const jobQueue = require('../library/jobQueue');
const Op = models.Sequelize.Op;

exports.writeProgress =  async function(req, res) {
    var incidentId = parseInt(req.params.id);

    models.Progresses.create({
        content: req.body['content'],
        IncidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).json({"type": "Invalid_ID", "message": 'Write progress Fail'});
    });

    jobQueue.addJobProgress(incidentId, JSON.stringify(req.body));
};

exports.progressList = function(req, res) {
    var incidentId = parseInt(req.params.id);
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
        .catch(() => {
            res.status(400).json({"type": "Invalid_ID", "message": 'Get progress list Fail'});
        });
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
        .catch(() => {
            res.status(400).json({"type": "Invalid_ID", "message": 'Get progress list Fail'});
        });
    } else {
        models.Progresses.findAll({
            where: {IncidentId: incidentId},
            order: [[sortBy, order]],
            limit: size
        })
        .then((progresses) => { res.json(progresses); })
        .catch(() => {
            res.status(400).json({"type": "Invalid_ID", "message": 'Get progress list Fail'});
        });
    }
};