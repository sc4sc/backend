const fs = require('fs');
const Caver = require('caver-js');
const caver = new Caver('http://127.0.0.1:8565');
const incidents = require('../../build/contracts/Incidents.json');
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });

// TODO : Modify keystore path
const keyfile = fs.readFileSync('../key', 'utf8');
const password = fs.readFileSync('../password', 'utf8');
const keystore = caver.klay.accounts.decrypt(keyfile, password);

module.exports = {caver, incidents, incident, keystore, password};
