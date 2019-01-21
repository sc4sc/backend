const models = require('../models');
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
        .send({from: keystore['address']})
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    })
    .catch(console.log);

    models.Comments.create({
        content: req.body['content'], 
        userId: req.body['userId'], 
        incidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
};

exports.commentList = async function(req, res) {
    var incidentId = req.params.id;
    var userId = req.body['userId'];

    var comments = await models.Comments.findAll({
        where: {incidentId: incidentId}
    });

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
        .send({from: keystore['address']})
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

}

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
        .send({from: keystore['address']})
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

}

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
        .send({from: keystore['address']})
        .then(()=>{ caver.klay.lockAccount(keystore['address']) })
        .catch(console.log);
    })
    .catch(console.log);
    
    models.Likes.destroy({
        where: {commentId: commentId, userId: userId}
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
    
}