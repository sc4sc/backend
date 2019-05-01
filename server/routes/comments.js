const models = require('../models');
const jobQueue = require('../library/jobQueue');
const Op = models.Sequelize.Op;

exports.writeComment = async function(req, res) {
    var incidentId = parseInt(req.params.id);

    var comments = await models.Comments.findAll({where: {IncidentId: incidentId}});
    var commentIndex = comments.length + 1;
    
    var result = await models.Comments.create({
        content: req.body['content'], 
        UserId: req.user.id, 
        IncidentId: incidentId,
        commentIndex: commentIndex,
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).json({"type": "Invalid_Model", "message": 'Write comment Fail'});
    });

    var user = await models.Users.findByPk(req.user.id);
    var userName = user['displayname'];
    jobQueue.addJobComment(incidentId, JSON.stringify({ user: userName, content: req.body['content']}));
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
    const commentList = await getLikeInfo(UserId, comments);
    res.json(commentList);
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
        res.status(400).json({"type": "Invalid_ID", "message": 'Write reply Fail'});
    });

    var comment = await models.Comments.findByPk(commentId);   
    jobQueue.addJobReply(comment['incidentId'], comment['commentIndex'], JSON.stringify(req.body));
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
        res.status(400).json({"type": "Invalid_Model", "message": 'Like Fail'});
    });

    var comment = await models.Comments.findByPk(commentId);
    jobQueue.addJobLike(comment['IncidentId'], comment['commentIndex']);
};

exports.unlike = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var UserId = req.user.id;
    
    models.Likes.destroy({
        where: {CommentId: commentId, UserId: UserId}
    })
    .then((result) => { res.json(result); })
    .catch(() => {
        res.status(400).json({"type": "Invalid_ID", "message": 'Unlike Fail'});
    });

    var comment = await models.Comments.findByPk(commentId);
    jobQueue.addJobUnlike(comment['IncidentId'], comment['commentIndex']);
};

async function getLikeInfo(UserId, comments) {
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