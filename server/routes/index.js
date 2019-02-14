const express = require('express');
const passport = require('passport');
const router = express.Router();

const route_incident = require('./incidents');
const route_comment = require('./comments');
const route_progress = require('./progresses');
const route_user = require('./user');
const route_search = require('../library/elasticsearch');

router.use(passport.authenticate('jwt', { session: false }));

//incident
router.post('/incidents', route_incident.report);
router.post('/incidents/:id', route_incident.changeState);
router.get('/incidents', route_incident.incidentList);
router.get('/incidents/:id', route_incident.readIncident);

//comment
router.post('/incidents/:id/comments', route_comment.writeComment);
router.get('/incidents/:id/comments', route_comment.commentList);

router.post('/comments/:id/reply', route_comment.writeReply);
router.post('/comments/:id/like', route_comment.like);
router.post('/comments/:id/unlike', route_comment.unlike);

//progress
router.post('/incidents/:id/progresses', route_progress.writeProgress);
router.get('/incidents/:id/progresses', route_progress.progressList);

//user
router.post('/logout', route_user.logout);
router.get('/profile', route_user.profile);

//search
router.get('/search', route_search.search);

module.exports = router;