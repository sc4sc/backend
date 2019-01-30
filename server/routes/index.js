const express = require('express');
const router = express.Router();
const route_incident = require('./incidents');
const route_comment = require('./comments');
const route_progress = require('./progresses');
const route_login = require('./login');

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

//login
router.post('/authenticate', route_login.login);



module.exports = router;