const fs = require('fs');
const Caver = require('caver-js');
const models = require('../models');
const incidents = require('../../build/contracts/Incidents.json');
const {Storage} = require('@google-cloud/storage');

const klaytn_url = process.env.KLAYTN_URL;
const caver = new Caver(klaytn_url);
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });

const storage = new Storage();
let account_bucket = storage.bucket(process.env.ACCOUNT_BUCKET);
let keystore, password;

async function getAccount() {
    if (keystore && password) return;
    
    keyfile_buf = await account_bucket.file(process.env.ACCOUNT_KEY_PATH).download();
    passwordfile_buf = await account_bucket.file(process.env.ACCOUNT_PASSWORD_PATH).download();

    password = passwordfile_buf.toString();
    keystore = caver.klay.accounts.decrypt(keyfile_buf.toString(), password);
}

async function unlockAccount() {
    await getAccount();
    return caver.klay.unlockAccount(keystore['address'], password);
}

module.exports.deployIncident = async function(content, incidentId, done) {

    unlockAccount()
    .then(() => {
        return incident.deploy({
            data: incidents["bytecode"],
            arguments: [content]})
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then((instance) => {  
        caver.klay.lockAccount(keystore['address']);
        return models.Incidents.update(
            {contract: instance._address},
            {where: {id: incidentId}});
    })
    .then(() => {
        done()
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });
};

module.exports.sendState = async function(incidentId, newState, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.changeState(newState)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then(()=>{ 
        caver.klay.lockAccount(keystore['address']);
        done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });
};

module.exports.addComment = async function(incidentId, content, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.addComment(content)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then(()=>{ 
        caver.klay.lockAccount(keystore['address']);
        done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });

}

module.exports.addReply = async function(incidentId, commentIndex, content, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.addReply(commentIndex, content)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
        })
    .then(()=>{ 
        caver.klay.lockAccount(keystore['address']);
        done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });

}

module.exports.sendlike = async function(incidentId, commentIndex, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.like(parseInt(commentIndex))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then(()=>{ 
            caver.klay.lockAccount(keystore['address']);
            done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });
    
}

module.exports.sendUnlike = async function(incidentId, commentIndex, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.unlike(parseInt(commentIndex))
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then(()=>{ 
        caver.klay.lockAccount(keystore['address']); 
        done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });
    
}

module.exports.addProgress = async function(incidentId, content, done) {
    let incidentContract;

    models.Incidents.findByPk(incidentId)
    .then((incident) => {
        let contractAddr = incident['contract'];
        incidentContract = new caver.klay.Contract(incidents.abi, contractAddr);
        incidentContract.options.address = keystore['address'];
        return unlockAccount();
    })
    .then(() => {
        return incidentContract.methods.addProgress(content)
        .send({
            from: keystore['address'],
            gasPrice: 0, gas: 999999999999 });
    })
    .then(()=>{ 
        caver.klay.lockAccount(keystore['address']); 
        done();
    })
    .catch((error) => {
        console.log(error);
        done(error);
    });
    
}

