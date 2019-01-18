const models = require('../models');

const Caver = require('caver-js');
const caver = new Caver('http://127.0.0.1:8563');
const incidents = require('../../build/contracts/Incidents.json');
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });


exports.writeComment = function(req, res) {
    var incidentId = req.params.id;

    models.Incidents.findByPk(incidentId)
    .then((result) => {
        var incident = JSON.parse(JSON.stringify(result));
        var contractAddr = incident['contract'];
        var incident_contract = new caver.klay.Contract(incidents.abi, contractAddr);
    
        incident_contract.methods.addComment(req.body['content'])
        .send({from: req.body['userId']})
        .catch((error) => { 
            console.log(error);
        });
    })
    .catch((error) => { console.log(error); });

    models.Comments.create({
        content: req.body['content'], 
        userId: req.body['userId'], 
        incidentId: incidentId
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); });
};

exports.commentList = async function(req, res) {
    var incidentId = req.params.id;
    var userId = req.body['userId'];

    models.Comments.findAll({
        where: {incidentId: incidentId}
    })
    .then((comments) => {
        var commentList = JSON.parse(JSON.stringify(comments));
        var commentIdList = [];
        for(var i in commentList) {
            commentList[i]['totalLike'] = 0;
            commentList[i]['Like'] = false;
            commentIdList[i] = commentList[i]['id'];
        };

        models.Likes.findAll({
            where: {commentId: commentIdList}
        })
        .then((likes) => {
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
        })
        .catch((error) => { console.log(error); });
    })
    .catch((error) => { console.log(error); }); 
};

exports.writeReply = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];
    var content = req.body['content'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
    const contractAddr = incident['contractAddr'];        
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    incident_contract.methods.addReply(commentId, content)
    .send({from: userId})
    .catch((error) => { console.log(error); }); 
    
    models.Comments.update(
        {reply: content},
        {where: {id: commentId}}
    )
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); }); 

}

exports.like = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
    const contractAddr = incident['contractAddr'];        
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    incident_contract.methods.like(commentId)
    .send({from: userId})
    .catch((error) => { console.log(error); }); 
    
    models.Likes.create({
        commentId: commentId, 
        userId: userId
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); }); 

}

exports.unlike = async function(req, res) {
    var commentId = req.params.id;
    var userId = req.body['userId'];

    const comment = await models.Comments.findByPk(commentId);
    const incident = await models.Incidents.findByPk(comment['incidentId']);
    const contractAddr = incident['contractAddr'];        
    var incident_contract = new caver.klay.Contract(incidents.abi, incident['contract']);
    
    incident_contract.methods.unlike(commentId)
    .send({from: userId})
    .catch((error) => { console.log(error); });
    
    models.Likes.destroy({
        commentId: commentId, 
        userId: userId
    })
    .then((result) => { res.json(result); })
    .catch((error) => { console.log(error); }); 
    
}