const models = require('../models');
const Op = models.Sequelize.Op;

exports.writeComment = async function(req, res) {
    var incidentId = parseInt(req.params.id);
    try {
        var comments = await models.Comments.findAll ({where: {IncidentId: incidentId}});
        var commentIndex = comments.length + 1;
        
        var result = models.Comments.create ({
            content: req.body['content'], 
            UserId: req.user.id, 
            IncidentId: incidentId,
            commentIndex: commentIndex,
        })
        .then((result) => { res.json(result); })
        .catch(() => {
            res.status(400).send(new Error('[WriteComment] DB create FAIL'));
        });

        var user = await models.Users.findByPk(req.user.id);
        var userName = user['displayname'];
    } catch (e) {
        res.status(400).send(new Error('[WriteComment] FAIL'));
    }
};

exports.commentList = async function(req, res) {
    var incidentId = parseInt(req.params.id);
    var UserId = req.user.id;
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before;
    var after = req.query.after;
    var comments;
    try {
        if (before) {
            comments = await models.Comments.findAll({
                where: {
                    IncidentId: incidentId,
                    updatedAt: {
                        [Op.lt]: before 
                    }
                },
                order: [[sortBy, order]],
                limit: size,
                include: [
                    {model: models.Likes},
                    {model: models.Users},
                ],
            });
        } else if (after) {
            comments = await models.Comments.findAll({
                where: {
                    IncidentId: incidentId,
                    updatedAt: {
                        [Op.gt]: after 
                    }
                },
                order: [[sortBy, order]],
                limit: size,
                include: [
                    {model: models.Likes},
                    {model: models.Users}
                ],
            });
        } else {
            comments = await models.Comments.findAll({
                where: {IncidentId: incidentId},
                order: [[sortBy, order]],
                limit: size,
                include: [
                    {model: models.Likes},
                    {model: models.Users}
                ],
            });
        }
    
        const commentList = getLikeInfo(UserId, comments);
        res.json(commentList);
    } catch (e) {
        res.status(400).send(new Error('[commentList] DB findAll FAIL'));
    }
};

exports.writeReply = async function(req, res) {
    var commentId = req.params.id;
    var UserId = req.user.id;
    var content = req.body['content'];   
    
    models.Comments.update(
        {reply: content},
        {where: {id: commentId}}
    )
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[WriteReply] DB update FAIL'));
    });

    try {
        var comment = await models.Comments.findByPk(commentId);   
    } catch (e) {
        res.status(400).send(new Error("[WriteReply] DB findByPk FAIL"));
    }
};

exports.like = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var UserId = req.user.id;
    
    models.Likes.create({
        CommentId: commentId, 
        UserId: UserId
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[like] DB create FAIL'));
    });

    try {
        var comment = await models.Comments.findByPk(commentId);   
    } catch (e) {
        res.status(400).send(new Error("[like] DB findByPk FAIL"));
    }
};

exports.unlike = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var UserId = req.user.id;
    
    models.Likes.destroy({
        where: {CommentId: commentId, UserId: UserId}
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).send(new Error('[unlike] DB destroy Fail'));
    });

    try {
        var comment = await models.Comments.findByPk(commentId);   
    } catch (e) {
        res.status(400).send(new Error("[unlike] DB findByPk FAIL"));
    }    
};

function getLikeInfo(UserId, comments) {
    var commentList = JSON.parse(JSON.stringify(comments));
    for(var i in commentList) {
        likesList = JSON.parse(JSON.stringify(commentList[i]['Likes']));
        commentList[i]['totalLike'] = commentList[i]['Likes'].length;      
        var mylike = likesList.filter(function (item) {
            return item.UserId === UserId;
        });
        commentList[i]['like'] = mylike.length ? true:false;
    };

    return commentList;
}