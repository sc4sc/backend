const express = require('express');
const passport = require('passport');
const privateRouter = express.Router();

const route_incident = require('./incidents');
const route_comment = require('./comments');
const route_progress = require('./progresses');
const route_user = require('./user');

privateRouter.use(passport.authenticate('jwt', { session: false }));

//incident
privateRouter.post('/incidents', route_incident.report);
privateRouter.post('/incidents/:id', route_incident.changeState);
privateRouter.get('/incidents', route_incident.incidentList);
privateRouter.get('/incidents/:id', route_incident.readIncident);
privateRouter.post('/incidents/:id/delete', route_incident.delete);

//comment
privateRouter.post('/incidents/:id/comments', route_comment.writeComment);
privateRouter.get('/incidents/:id/comments', route_comment.commentList);

privateRouter.post('/comments/:id/reply', route_comment.writeReply);
privateRouter.post('/comments/:id/like', route_comment.like);
privateRouter.post('/comments/:id/unlike', route_comment.unlike);

//progress
privateRouter.post('/incidents/:id/progresses', route_progress.writeProgress);
privateRouter.get('/incidents/:id/progresses', route_progress.progressList);

//user
privateRouter.post('/logout', route_user.logout);
privateRouter.get('/profile', route_user.profile);
privateRouter.post('/modechange', route_user.mode);
privateRouter.post('/updatePushToken', route_user.updatePushToken);


module.exports = privateRouter;
