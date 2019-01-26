const kue = require('kue');
const REDIS_URL = process.env.REDIS_URL || "redis:127.0.0.1:6379";
kue.app.listen(3000);

module.exports.queue = function() {
    const queue = kue.createQueue({redis: REDIS_URL});
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
    return queue;
};
