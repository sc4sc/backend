const models = require('../models');
const Op = models.Sequelize.Op;
const Log = require('../utils/Log')

exports.writeProgress =  async function(req, res, next) {
    var incidentId = parseInt(req.params.id);

    models.Progresses.create({
        content: req.body['content'],
        IncidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[writeProgress] DB create FAIL'));
    });

};

exports.progressList = function(req, res, next) {
    var incidentId = parseInt(req.params.id);
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before || "9999-12-31 12:04:43.931+00";
    var after = req.query.after || "1971-02-16 12:04:43.931+00";

    models.Progresses.findAll({
        where: {
            IncidentId: incidentId,
            updatedAt: {
                [Op.lt]: before,
                [Op.gt]: after
            }
        },
        order: [[sortBy, order]],
        limit: size
    })
    .then((progresses) => { res.json(progresses); })
    .catch(e => {
        Log.error(e);
        next(new Error('[progressList] DB findAll FAIL'));
    });
};