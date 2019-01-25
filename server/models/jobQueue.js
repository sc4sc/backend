const kue = require('kue');
kue.app.listen(3000);

module.exports.createQueue = function() {
    const queue = kue.createQueue();

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
}



// queue.process('deploy', function(job, done) {  
//     deployIncident(job.data.content, job.data.id, done);
// });

// var job = queue.create('deploy', {
//     content: "ASdf",
//     id: 1
// })
// .priority('critical').attempts(3).backoff( {delay: 60*1000, type:'fixed'})
// .save( function(err){
//     if( !err ) console.log( "enqueue: "+job.id );
//     else console.log(error);
//  });

// queue.process('comment', function(job, done) {  
//     deployIncident(JSON.stringify(req.body), newIncident['id']);
//     sendEmail(job.data, done);
// });

// queue.process('process', function(job, done) {  
//     deployIncident(JSON.stringify(req.body), newIncident['id']);
//     sendEmail(job.data, done);
// });

// queue.process('like', function(job, done) {  
//     deployIncident(JSON.stringify(req.body), newIncident['id']);
//     sendEmail(job.data, done);
// });

// queue.process('unlike', function(job, done) {  
//     deployIncident(JSON.stringify(req.body), newIncident['id']);
//     sendEmail(job.data, done);
// });


