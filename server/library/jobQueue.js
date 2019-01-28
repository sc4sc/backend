const kue = require('kue');
const incident = require("../routes/incidents");
const comment = require("../routes/comments");
const progress = require("../routes/progresses");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const queue = kue.createQueue({ redis: REDIS_URL});

queue.on('job enqueue', function(id, type){
    console.log( 'Job %s got queued of type %s', id, type );
}).on('job complete', function(id, result){
    kue.Job.get(id, function(err, job){
        if (err) return;
        job.remove(function(err){
            if (err) throw err;
            console.log('removed completed job #%d', job.id);
        });
    });
});

queue.process('deploy', function(job, done) {  
    incident.deployIncident(job.data.content, job.data.id, done);
}); 

queue.process('comment', function(job, done) {  
    comment.addComment(job.data.contractAddr, job.data.content, done);
}); 

queue.process('progress', function(job, done) {  
    progress.addProgress(job.data.contractAddr, job.data.content, done);
}); 

kue.app.listen(3000);
module.exports.queue = queue;
