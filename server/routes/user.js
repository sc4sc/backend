const soap = require('soap');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const BearerStrategy = require('passport-http-bearer').Strategy;
const JwtStrategy = passportJwt.Strategy;
const fromAuthHeaderWithScheme = passportJwt.ExtractJwt.fromAuthHeaderWithScheme;

const models = require('../models');

const secret = process.env.SECRET;
const expiresIn = 0; 

// Create jwt using existing token
exports.login = async function(req, res) {
    try {
        const update = await models.Users.update(
            {expotoken: req.body['expotoken']},
            {where: {id: req.user.id}});
        
        const user = await models.Users.findByPk(req.user.id);

        res.json({ appToken: req.user.appToken, displayname: user['displayname'],
            ku_kname: user['ku_kname'], kaist_uid: user['kaist_uid'], 
            ku_kaist_org_id: user['ku_kaist_org_id'], mobile: user['mobile'], isAdmin: user['isAdmin']});
    } catch (e) {
        res.send(new Error('[login] FAIL'));
    }
};

exports.logout = function(req, res) {
    models.Users.update(
        {expotoken: null},
        {where: {id: req.user.id}}
    )
    .then((result) => { res.json(result); })
    .catch(() => {
        res.send(new Error('[logout] DB update FAIL'));
    });
};

exports.updatePushToken = function(req, res) {
    models.Users.update(
        {expotoken: req.body['expotoken']},
        {where: {id: req.user.id}, returning: true})
    .then((result) => { 
        if (result[0] ===1 )
            res.json({"success": true});
        else 
            res.send(new Error('[updatePushToken] DB update Fail'));
    })
    .catch(() => {
        res.send(new Error('[updatePushToken] DB update Fail'));
    });
};

exports.profile = function(req, res) {
    models.Users.findByPk(req.user.id)
    .then((result) => { 
        if (result) res.json(result);
        else res.send(new Error('[profile] DB findByPk Fail'));
    })
    .catch((e)=> {
        res.send(new Error('[profile] DB findByPk Fail'));
    });
};

// SSO 토큰을 확인하고 서버 jwt 토큰을 발급한다
passport.use(new BearerStrategy(
    async (token, done) => {

        const url = 'https://iam.kaist.ac.kr:443/iamps/services/appsingleauth?wsdl';
        const privkey = process.env.PRIVKEY;
        const args = {cookieValue: token, PrivateKeyStr: privkey, adminVO: {adminId: null, password: null}};
        var isAdmin = false;
        var retry = 5;
        var info = null;


        try {
            var client = await soap.createClientAsync(url);
            var verification = new Promise (function( resolve, reject) {
                client.AppSinglAuthApiService.AppSinglAuthApiPort.verification(args, async function(err, result) {
                    if (err) reject (result.result);
                    else resolve (result.return);
                });
            });

            while (retry) {
                console.log(retry);
                info = await verification;   
                if (info == null) retry--;
                else retry = 0;
            }
                        
            if (info == null) return done(new Error('[passport] SSO FAIL'));

            if (info.ku_kaist_org_id === '3502') isAdmin = true;
            const user = await models.Users.findOrCreate({
                where: {kaist_uid: info.kaist_uid}, 
                defaults: {
                    displayname: info.displayname, 
                    ku_kname: info.ku_kname,
                    ku_kaist_org_id: info.ku_kaist_org_id,
                    mobile: info.mobile,
                    isAdmin: isAdmin,
                }
            });
        
            const appToken = jwt.sign(
                { id: user[0]['id'] },
                secret,
                { expiresIn }
            );
        
            done(null, { appToken: appToken, id: user[0]['id']});

        } catch (e) {
            console.log(e);
            return done(new Error("[passport] JWT token FAIL"));
        }
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