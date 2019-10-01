const models = require('../models');
const Op = models.Sequelize.Op;

exports.writeProgress =  async function(req, res) {
    var incidentId = parseInt(req.params.id);

    models.Progresses.create({
        content: req.body['content'],
        IncidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[writeProgress] DB create FAIL'));
    });

};

exports.progressList = function(req, res) {
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
    .catch(() => {
        res.status(400).send(new Error('[progressList] DB findAll FAIL'));
    });

    // if (before) {
    //     models.Progresses.findAll({
    //         where: {
    //             IncidentId: incidentId,
    //             updatedAt: {
    //                 [Op.lt]: before 
    //             }
    //         },
    //         order: [[sortBy, order]],
    //         limit: size
    //     })
    //     .then((progresses) => { res.json(progresses); })
    //     .catch(() => {
    //         res.status(400).send(new Error('[progressList] DB findAll FAIL'));
    //     });
    // } else if (after) {
    //     models.Progresses.findAll({
    //         where: {
    //             IncidentId: incidentId,
    //             updatedAt: {
    //                 [Op.gt]: after 
    //             }
    //         },
    //         order: [[sortBy, order]],
    //         limit: size
    //     })
    //     .then((progresses) => { res.json(progresses); })
    //     .catch(() => {
    //         res.status(400).send(new Error('[progressList] DB findAll FAIL'));
    //     });
    // } else {
    //     models.Progresses.findAll({
    //         where: {IncidentId: incidentId},
    //         order: [[sortBy, order]],
    //         limit: size
    //     })
    //     .then((progresses) => { res.json(progresses); })
    //     .catch(() => {
    //         res.status(400).send(new Error('[progressList] DB findAll FAIL'));
    //     });
    // }
};