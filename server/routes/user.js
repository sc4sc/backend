const soap = require('soap');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const BearerStrategy = require('passport-http-bearer').Strategy;
const JwtStrategy = passportJwt.Strategy;
const fromAuthHeaderWithScheme = passportJwt.ExtractJwt.fromAuthHeaderWithScheme;

const models = require('../models');
const {caver, incidents, incident} = require('../library/caver');

const secret = process.env.SECRET;
const expiresIn = 0; 

// Create jwt using existing token
exports.login = async function(req, res) {

    const update = await models.Users.update(
        {expotoken: req.body['expotoken']},
        {where: {id: req.user.id}});
    
    const user = await models.Users.findByPk(req.user.id);

    res.json({ appToken: req.user.appToken, displayname: user['displayname'],
        ku_kname: user['ku_kname'], kaist_uid: user['kaist_uid'], 
        ku_kaist_org_id: user['ku_kaist_org_id'], mobile: user['mobile'], isAdmin: user['isAdmin']});

};

exports.logout = function(req, res) {
    models.Users.destroy({
        where: {id: req.user.id}
    })
    .then((result) => { res.json(result); })
    .catch(console.log);
};

exports.profile = function(req, res) {
    models.Users.findByPk(req.user.id)
    .then((result) => { 
        if (result) {
            res.json(result);
        } else {
            res.send(new Error('please Login'));
        }
    })
    .catch(console.log);
};

// SSO 토큰을 확인하고 서버 jwt 토큰을 발급한다
passport.use(new BearerStrategy(
    (token, done) => {

        const url = 'https://iam.kaist.ac.kr:443/iamps/services/appsingleauth?wsdl';
        const privkey = process.env.PRIVKEY;
        const args = {cookieValue: token, PrivateKeyStr: privkey, adminVO: {adminId: null, password: null}};
        soap.createClientAsync(url)
        .then(client => { 
            client.AppSinglAuthApiService.AppSinglAuthApiPort.verification(args, async function(err, result) {
                if (err) {
                    return done(err);
                }
                if (err===null && result.return===null) {
                    return done( new Error('SSO return null'));
                }

                //TODO : isAdmin 확인하기 (안전팀 부서코드)
                const isAdmin = false;
                if (result.return.ku_kaist_org_id === '3502') {
                    const isAdmin = true;
                }

                const user = await models.Users.findOrCreate({
                    where: {kaist_uid: result.return.kaist_uid}, 
                    defaults: {
                        displayname: result.return.displayname, 
                        ku_kname: result.return.ku_kname,
                        ku_kaist_org_id: result.return.ku_kaist_org_id,
                        mobile: result.return.mobile,
                        isAdmin: isAdmin,
                    }
                });
             
                const appToken = jwt.sign(
                    { id: user[0]['id'] },
                    secret,
                    { expiresIn }
                );
        
                done(null, { appToken: appToken, id: user[0]['id']});
            
            }); 
        })
        .catch((error)=>{ done(error); });
    }
));

// 서버에서 사용하는 토큰
passport.use(new JwtStrategy(
    {
        secretOrKey: secret,
        ignoreExpiration: true,
        jwtFromRequest: fromAuthHeaderWithScheme('jwt')
    },
    (jwt_payload, done) => {
        done(null, jwt_payload);
    }
));