const models = require('../models');
const Op = models.Sequelize.Op;
const {caver, incidents, incident, keystore, password} = require('../models/caver');

exports.writeComment = async function(req, res) {
    var incidentId = req.params.id;
    
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

    var comments = await models.Comments.findAll({where: {incidentId: incidentId}});
    var commentIndex = Object.keys(JSON.parse(JSON.stringify(comments))).length+1;

    models.Comments.create({
        content: req.body['content'], 
        userId: req.body['userId'], 
        incidentId: incidentId,
        commentIndex: commentIndex,
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
};

exports.commentList = async function(req, res) {
    var incidentId = req.params.id;
    var userId = req.body['userId'];
    var size = req.query.size || 5;
    var sortBy = req.query.sortBy || 'updatedAt';
    var order = req.query.order || 'DESC';
    var before = req.query.before;
    var after = req.query.after;
    var comments;

    if (before) {
        comments = await models.Comments.findAll({
            where: {
                incidentId: incidentId,
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
                incidentId: incidentId,
                updatedAt: {
                    [Op.gt]: after 
                }
            },
            order: [[sortBy, order]],
            limit: size
        });
    } else {
        comments = await models.Comments.findAll({
            where: {incidentId: incidentId},
            order: [[sortBy, order]],
            limit: size
        });
    }
    var commentList = await getLikeInfo(comments);
    res.json(commentList);
};

exports.writeReply = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];
    var content = req.body['content'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
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
    var commentId = req.params.id;
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
    const contractAddr = incident['contractAddr'];        
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident_contract.methods.like(commentId)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999})
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);    
    })
    .catch(console.log);
    
    models.Likes.create({
        commentId: commentId, 
        userId: userId
    })
    .then((result) => { res.json(result); })
    .catch(console.log);

};

exports.unlike = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
    const contractAddr = incident['contractAddr'];        
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
        where: {commentId: commentId, userId: userId}
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
    
};

async function getLikeInfo(comments) {
    var commentList = JSON.parse(JSON.stringify(comments));
    var commentIdList = [];
    for(var i in commentList) {
        commentList[i]['totalLike'] = 0;
        commentList[i]['Like'] = false;
        commentIdList[i] = commentList[i]['id'];
    };

    var likes = await models.Likes.findAll({
        where: {commentId: commentIdList}
    });
    var likeList = JSON.parse(JSON.stringify(likes));

    for(var i in likeList) {
        var commentId = likeList[i]['commentId'];
        var j = commentList.findIndex(function(item, i){
            return item.id === commentId
        });
        commentList[j]['totalLike']++;
        commentList[j]['Like'] = (likeList[i]['userId']===userId) ? true:false;
    }

    return commentList;
}

