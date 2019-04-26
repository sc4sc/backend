const fs = require('fs');
const Caver = require('caver-js');
const models = require('../models');
const incidents = require('../../build/contracts/Incidents.json');

const klaytn_url = process.env.KLAYTN_URL; // || 'http://127.0.0.1:8563'
const keyfile_path = process.env.KEYFILE_PATH || __dirname + '/../../docker/key';
const password_path = process.env.PASSWORD_PATH || __dirname + '/../../docker/password';

// const caver = new Caver(klaytn_url);
// const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });

// const keyfile = fs.readFileSync(keyfile_path, 'utf8');
// const password = fs.readFileSync(password_path, 'utf8');
// const keystore = caver.klay.accounts.decrypt(keyfile, password);

module.exports.deployIncident = function(content, incidentId, done) {
    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incident.deploy({
            data: incidents["bytecode"],
            arguments: [content]})
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 })
        .then((instance) => {  
            caver.klay.lockAccount(keystore['address']);
            models.Incidents.update(
                {contract: instance._address},
                {where: {id: incidentId}})
            .then(done())
            .catch(console.log);
        })
        .catch(console.log);
    });
};

module.exports.sendState = function(contractAddr, newState, done) {

    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.changeState(newState)
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
};

module.exports.addComment = function(contractAddr, content, done) {
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

module.exports.addReply = function(contractAddr, commentIndex, content, done) {
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

module.exports.sendlike = function(contractAddr, commentIndex, done) {
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

module.exports.sendUnlike = function(contractAddr, commentIndex, done) {
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

module.exports.addProgress = function(contractAddr, content, done) {
    var incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
    incidentContract.options.address = keystore['address'];

    caver.klay.unlockAccount(keystore['address'], password)
    .then(() => {
        incidentContract.methods.addProgress(content)
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