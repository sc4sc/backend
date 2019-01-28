const Queue = require('bull');
const incident = require(__dirname + "/../routes/incidents");
const comment = require(__dirname + "/../routes/comments");
const progress = require(__dirname + "/../routes/progresses");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var queue = new Queue('blockchain', REDIS_URL);

setQueue(queue);

queue.process('deploy', function(job,done){
    incident.deployIncident(job.data.content, job.data.id, done)
});

queue.process('comment', function(job,done){
    comment.addComment(job.data.contractAddr, job.data.content, done)
});

queue.process('reply', function(job,done){
    comment.addReply(job.data.contractAddr, job.data.commentId, job.data.content, done)
});

queue.process('like', function(job,done){
    comment.sendlike(job.data.contractAddr, job.data.commentId, done)
});

queue.process('unlike', function(job,done){
    comment.sendUnlike(job.data.contractAddr, job.data.commentId, done)
});

queue.process('progress', function(job,done){
    progress.addProgress(job.data.contractAddr, job.data.content, done)
});

exports.addJobIncident = async function(content, id) {
    const job = await queue.add('deploy', { 
        content: content,
        id: id 
    }, { priority: 1, attempts: 3, delay: 1000 });
}

exports.addJobComment = async function(contractAddr, content) {
    const job = await queue.add('comment', { 
        contractAddr: contractAddr,
        content: content
    }, { priority: 2, attempts: 3, delay: 1000 });
}

exports.addJobReply = async function(contractAddr, commentId, content) {
    const job = await queue.add('reply', { 
        contractAddr: contractAddr, 
        commentId: commentId,
        content: content,
    }, { priority: 2, attempts: 3, delay: 1000 });
}

exports.addJobLike = async function(contractAddr, commentId) {
    const job = await queue.add('like', { 
        contractAddr: contractAddr,
        commentId: commentId
    }, { priority: 2, attempts: 3, delay: 1000 });
}


exports.addJobUnlike = async function(contractAddr, commentId) {
    const job = await queue.add('unlike', { 
        contractAddr: contractAddr,
        commentId: commentId
    }, { priority: 2, attempts: 3, delay: 1000 });
}

exports.addJobProgress = async function(contractAddr, content) {
    const job = await queue.add('progress', { 
        contractAddr: contractAddr,
        content: content
    }, { priority: 2, attempts: 3, delay: 1000 });
}



function setQueue(queue) {
    queue.on('active', function(job, jobPromise){
        console.log( 'Job %s got queued of type %s', job.id, job.type );
    });
    queue.on('completed', function(job, result) {
        console.log(`Job ${job.id} completed! Result: ${result}`);
        job.remove();
    });   
    queue.on('failed', function(job, err){
        console.log(`Job ${job.id} failed:(\n${result}`);
    });
}

module.exports.queue = queue;