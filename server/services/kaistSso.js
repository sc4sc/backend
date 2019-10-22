const soap = require('soap');

const url = 'https://iam.kaist.ac.kr:443/iamps/services/appsingleauth?wsdl';
const privkey = process.env.PRIVKEY;

module.exports = async (token) => {
    const args = {cookieValue: token, PrivateKeyStr: privkey, adminVO: {adminId: null, password: null}};
    var client = await soap.createClientAsync(url);

    return new Promise (function( resolve, reject) {
        client.AppSinglAuthApiService.AppSinglAuthApiPort.verification(args, async function(err, result) {
            if (err) reject (result.result);
            else resolve (result.return);
        });
    });
};
