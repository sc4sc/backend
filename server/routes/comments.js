const models = require('../models');
const {caver, incidents, incident, keystore, password} = require('../library/caver');
const jobQueue = require('../library/jobQueue');
const Op = models.Sequelize.Op;

exports.writeComment = async function(req, res) {
    var incidentId = parseInt(req.params.id);
    
    var result = await models.Incidents.findByPk(incidentId);
    var incident = JSON.parse(JSON.stringify(result));
    var contractAddr = incident['contract'];

    var comments = await models.Comments.findAll({where: {IncidentId: incidentId}});
    var commentIndex = comments.length + 1;
    
    models.Comments.create({
        content: req.body['content'], 
        userId: req.body['userId'], 
        IncidentId: incidentId,
        commentIndex: commentIndex,
    })
    .then((result) => { res.json(result); })
    .catch(console.log);

    jobQueue.addJobComment(contractAddr, JSON.stringify(req.body));
};

exports.commentList = async function(req, res) {
    var incidentId = parseInt(req.params.id);
    var userId = req.query.userId;
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
            limit: size
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
            limit: size
        });
    } else {
        comments = await models.Comments.findAll({
            where: {IncidentId: incidentId},
            order: [[sortBy, order]],
            limit: size
        });
    }
    var commentList = await getLikeInfo(userId, comments);
    res.json(commentList);
};

exports.writeReply = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];
    var content = req.body['content'];

    var comment = await models.Comments.findByPk(commentId);
    var incident = await models.Incidents.findByPk(comment['IncidentId']);
    var contractAddr = incident['contract'];        
    
    models.Comments.update(
        {reply: content},
        {where: {id: commentId}}
    )
    .then((result) => { res.json(result); })
    .catch(console.log);

    jobQueue.addJobReply(contractAddr, comment['commentIndex'], JSON.stringify(req.body));
};

exports.like = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var userId = req.body['userId'];

    var comment = await models.Comments.findByPk(commentId);
    var incident = await models.Incidents.findByPk(comment['IncidentId']);
    var contractAddr = incident['contract'];
    
    models.Likes.create({
        CommentId: commentId, 
        userId: userId
    })
    .then((result) => { res.json(result); })
    .catch(console.log);

    jobQueue.addJobLike(contractAddr, comment['commentIndex']);
};

exports.unlike = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var userId = req.body['userId'];

    var comment = await models.Comments.findByPk(commentId);
    var incident = await models.Incidents.findByPk(comment['IncidentId']);
    var contractAddr = incident['contract'];

    models.Likes.destroy({
        where: {CommentId: commentId, userId: userId}
    })
    .then((result) => { res.json(result); })
    .catch(console.log);

    jobQueue.addJobUnlike(contractAddr, comment['commentIndex']);
};

async function getLikeInfo(userId, comments) {
    var commentList = JSON.parse(JSON.stringify(comments));
    var commentIdList = [];
    for(var i in commentList) {
        commentList[i]['totalLike'] = 0;
        commentList[i]['like'] = false;
        commentIdList[i] = commentList[i]['id'];
    };

    var likes = await models.Likes.findAll({
        where: {CommentId: commentIdList}
    });
    var likeList = JSON.parse(JSON.stringify(likes));

    for(var i in likeList) {
        var commentId = likeList[i]['CommentId'];
        var j = commentList.findIndex(function(item, i){
            return item.id === commentId
        });
        commentList[j]['totalLike']++;
        if (!commentList[j]['like']) {
            commentList[j]['like'] = (likeList[i]['userId']===userId) ? true:false;
        } 
        
    }

    return commentList;
}

exports.addComment = function(contractAddr, content, done) {
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.addComment(content)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ 
            caver.klay.lockAccount(keystore['address']);
            done();
        })
        .catch((error) => {
            console.log(error);
            done(new Error("addComment call error"));
        });
    })
    .catch((error) => {
        console.log(error);
        done(new Error("unlock error"));
    });

}

exports.addReply = function(contractAddr, commentIndex, content, done) {
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.addReply(commentIndex, content)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ 
            caver.klay.lockAccount(keystore['address']);
            done();
        })
        .catch((error) => {
            console.log(error);
            done(new Error("addReply call error"));
        });
    })
    .catch((error) => {
        console.log(error);
        done(new Error("unlock error"));
    });
}

exports.sendlike = function(contractAddr, commentIndex, done) {
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.like(parseInt(commentIndex))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ 
            caver.klay.lockAccount(keystore['address']);
            done();
        })
        .catch((error) => {
            console.log(error);
            done(new Error("like call error"));
        });
    })
    .catch((error) => {
        console.log(error);
        done(new Error("unlock error"));
    });
}

exports.sendUnlike = function(contractAddr, commentIndex, done) {
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.unlike(parseInt(commentIndex))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ 
            caver.klay.lockAccount(keystore['address']); 
            done();
        })
        .catch((error) => {
            console.log(error);
            done(new Error("unlike call error"));
        });
    })
    .catch((error) => {
        console.log(error);
        done(new Error("unlock error"));
    });
}

