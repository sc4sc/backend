const models = require('../models');
const Op = models.Sequelize.Op;
const {caver, incidents, incident, keystore, password} = require('../models/caver');

exports.writeComment = async function(req, res) {
    var incidentId = parseInt(req.params.id);
    
    var result = await models.Incidents.findByPk(incidentId);
    var incident = JSON.parse(JSON.stringify(result));
    var contractAddr = incident['contract'];
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.addComment(JSON.stringify(req.body))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    })
    .catch(console.log);

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

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['IncidentId']);
    const contractAddr = incident['contractAddr'];        
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident_contract.methods.addReply(commentId, JSON.stringify(req.body))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    })
    .catch(console.log);
    
    models.Comments.update(
        {reply: content},
        {where: {id: commentId}}
    )
    .then((result) => { res.json(result); })
    .catch(console.log);

};

exports.like = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['IncidentId']);
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident_contract.methods.like(commentId)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999})
        .then((info)=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);    
    })
    .catch(console.log);
    
    models.Likes.create({
        CommentId: commentId, 
        userId: userId
    })
    .then((result) => { res.json(result); })
    .catch(console.log);

};

exports.unlike = async function(req, res) {
    var commentId = parseInt(req.params.id);
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['IncidentId']);
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident_contract.methods.unlike(commentId)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    })
    .catch(console.log);
    
    models.Likes.destroy({
        where: {CommentId: commentId, userId: userId}
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
    
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
        commentList[j]['like'] = (likeList[i]['userId']===userId) ? true:false;
    }

    return commentList;
}

