const fs = require('fs');
const Caver = require('caver-js');
const incidents = require('../../build/contracts/Incidents.json');

const klaytn_url = process.env.KLAYTN_URL || 'http://127.0.0.1:8563';
const keyfile_path = process.env.KEYFILE_PATH || '../docker/key';
const password_path = process.env.PASSWORD_PATH || '../docker/password';

const caver = new Caver(klaytn_url);
const incident = new caver.klay.Contract(incidents.abi, null, { data: incidents.bytecode });

const keyfile = fs.readFileSync(keyfile_path, 'utf8');
const password = fs.readFileSync(password_path, 'utf8');
const keystore = caver.klay.accounts.decrypt(keyfile, password);

module.exports = {caver, incidents, incident, keystore, password};
