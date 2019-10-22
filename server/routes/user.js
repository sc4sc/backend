const soap = require('soap');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const BearerStrategy = require('passport-http-bearer').Strategy;
const Log = require('../utils/Log');

const JwtStrategy = passportJwt.Strategy;
const fromAuthHeaderWithScheme = passportJwt.ExtractJwt.fromAuthHeaderWithScheme;

const models = require('../models');
const kaistSsoService = require('../services/kaistSso');

const secret = process.env.SECRET;
const expiresIn = 0; 

// Create jwt using existing token
exports.login = async function(req, res, next) {
    try {
        const update = await models.Users.update(
            {expotoken: req.body['expotoken']},
            {where: {id: req.user.id}});
        
        const user = await models.Users.findByPk(req.user.id);

        res.json({ appToken: req.user.appToken, displayname: user['displayname'],
            ku_kname: user['ku_kname'], kaist_uid: user['kaist_uid'], 
            ku_departmentcode: user['ku_departmentcode'], mobile: user['mobile'], isAdmin: user['isAdmin']});
    } catch (e) {
        Log.error(e);
        next(new Error('[login] FAIL'));
    }
};

exports.logout = function(req, res, next) {
    models.Users.update(
        {expotoken: null},
        {where: {id: req.user.id}}
    )
    .then((result) => { res.json(result); })
    .catch(e => {
        Log.error(e);
        next(new Error('[logout] DB update FAIL'));
    });
};

exports.updatePushToken = function(req, res, next) {
    models.Users.update(
        {expotoken: req.body['expotoken']},
        {where: {id: req.user.id}, returning: true})
    .then((result) => { 
        if (result[0] === 1 )
            res.json({ "success": true });
        else {
            Log.info(`Failed to update id: Given ${req.user.id}`)
            res.status(400).send(new Error('[updatePushToken] DB update Fail'));
        }
    })
    .catch(e => {
        Log.error(e);
        next(new Error('[updatePushToken] DB update Fail'));
    });
};

exports.profile = function(req, res, next) {
    models.Users.findByPk(req.user.id)
    .then((result) => { 
        if (result) res.json(result);
        else {
            Log.info(`Failed to find id: Given ${req.user.id}`);
            res.status(400).send(new Error('[profile] DB findByPk Fail'));
        }
    })
    .catch((e)=> {
        Log.error(e);
        next(new Error('[profile] DB findByPk Fail'));
    });
};

exports.mode = function(req, res, next) {
    models.Users.update({
        isTraining: req.body['isTraining']},
        {where: {id: req.user.id}}
    )
    .then((result) => {
        res.json(result);
    })
    .catch((e) => {
        Log.error(e);
        next(new Error('[mode] DB update Fail'));
    });
};

// SSO 토큰을 확인하고 서버 jwt 토큰을 발급한다
passport.use(new BearerStrategy(
    async (token, done) => {

        var isAdmin = false;
        var retry = 5;
        var info = null;


        try {
            var client = await soap.createClientAsync(url);

            // 여러 번 시도할 필요 없다
            info = await kaistSsoService(token);
          
            if (info == null) return done(new Error('[passport] SSO FAIL'));

            if (info.ku_departmentcode === '729' || info.ku_departmentcode === '7065' || info.ku_departmentcode === '7066') {
                isAdmin = true;
            }

            const user = await models.Users.upsert({
                kaist_uid: info.kaist_uid,
                displayname: info.displayname, 
                ku_kname: info.ku_kname,
                ku_departmentcode: info.ku_departmentcode,
                mobile: info.mobile,
                isAdmin: isAdmin},
                {returning: true}
            );
        
            const appToken = jwt.sign(
                { id: user[0]['id'] },
                secret,
                { expiresIn }
            );
        
            done(null, { appToken: appToken, id: user[0]['id']});

        } catch (e) {
            Log.error(`JWT token failure: ${e}`);
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
