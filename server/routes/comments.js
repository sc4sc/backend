const models = require('../models');
const Op = models.Sequelize.Op;
const Log = require('../utils/Log')

exports.writeComment = async function(req, res, next) {
    var incidentId = parseInt(req.params.id);
    try {
        var comments = await models.Comments.findAll ({where: {IncidentId: incidentId}});
        var commentIndex = comments.length + 1;
        
        const result = await models.Comments.create ({
            content: req.body['content'], 
            UserId: req.user.id, 
            IncidentId: incidentId,
            commentIndex: commentIndex,
        })
        res.json(result);

    } catch (e) {
        Log.error(e);
        next(new Error('[WriteComment] FAIL'));
    }
};

exports.commentList = async function(req, res, next) {
    var incidentId = parseInt(req.params.id);
    var UserId = req.user.id;
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before || "9999-12-31 12:04:43.931+00";
    var after = req.query.after || "1971-02-16 12:04:43.931+00";

    try {
        const comments = await models.Comments.findAll({
            where: {
                IncidentId: incidentId,
                updatedAt: {
                    [Op.lt]: before,
                    [Op.gt]: after 
                }
            },
            order: [[sortBy, order]],
            limit: size,
            include: [
                {model: models.Likes},
                {model: models.Users},
            ],
        });
    
        const commentList = getLikeInfo(UserId, comments);
        res.json(commentList);
    } catch (e) {
        Log.error(e);
        next(new Error('[commentList] DB findAll FAIL'));
    }
};

exports.writeReply = async function(req, res, next) {
    var commentId = req.params.id;
    var UserId = req.user.id;
    var content = req.body['content'];   
    
    models.Comments.update(
        {reply: content},
        {where: {id: commentId}}
    )
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[WriteReply] DB update FAIL'));
    });
};

exports.like = async function(req, res, next) {
    var commentId = parseInt(req.params.id);
    var UserId = req.user.id;
    
    models.Likes.create({
        CommentId: commentId, 
        UserId: UserId
    })
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[like] DB create FAIL'));
    });
};

exports.unlike = async function(req, res, next) {
    var commentId = parseInt(req.params.id);
    var UserId = req.user.id;
    
    models.Likes.destroy({
        where: {CommentId: commentId, UserId: UserId}
    })
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[unlike] DB destroy Fail'));
    });
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