const Queue = require('bull');
const blockchain = require('./caver');

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var queue = new Queue('blockchain', REDIS_URL);

setQueue(queue);

queue.process('deploy', function(job,done){
    blockchain.deployIncident(job.data.content, job.data.id, done)
});

queue.process('state', function(job,done){
    blockchain.sendState(job.data.contractAddr, job.data.newState, done)
});

queue.process('comment', function(job,done){
    blockchain.addComment(job.data.contractAddr, job.data.content, done)
});

queue.process('reply', function(job,done){
    blockchain.addReply(job.data.contractAddr, job.data.commentId, job.data.content, done)
});

queue.process('like', function(job,done){
    blockchain.sendlike(job.data.contractAddr, job.data.commentId, done)
});

queue.process('unlike', function(job,done){
    blockchain.sendUnlike(job.data.contractAddr, job.data.commentId, done)
});

queue.process('progress', function(job,done){
    blockchain.addProgress(job.data.contractAddr, job.data.content, done)
});

module.exports.addJobIncident = async function(content, id) {
    const job = await queue.add('deploy', { 
        content: content,
        id: id 
    }, { priority: 1, attempts: 3, delay: 1000 });
}

module.exports.addJobState = async function(contractAddr, newState) {
    const job = await queue.add('state', { 
        contractAddr: contractAddr, 
        newState: newState
    }, { priority: 2, attempts: 3, delay: 1000 });
}

module.exports.addJobComment = async function(contractAddr, content) {
    const job = await queue.add('comment', { 
        contractAddr: contractAddr,
        content: content
    }, { priority: 2, attempts: 3, delay: 1000 });
}

module.exports.addJobReply = async function(contractAddr, commentId, content) {
    const job = await queue.add('reply', { 
        contractAddr: contractAddr, 
        commentId: commentId,
        content: content,
    }, { priority: 2, attempts: 3, delay: 1000 });
}

module.exports.addJobLike = async function(contractAddr, commentId) {
    const job = await queue.add('like', { 
        contractAddr: contractAddr,
        commentId: commentId
    }, { priority: 2, attempts: 3, delay: 1000 });
}


module.exports.addJobUnlike = async function(contractAddr, commentId) {
    const job = await queue.add('unlike', { 
        contractAddr: contractAddr,
        commentId: commentId
    }, { priority: 2, attempts: 3, delay: 1000 });
}

module.exports.addJobProgress = async function(contractAddr, content) {
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