const fs = require('fs');
const elasticsearch = require('elasticsearch');
const elasticClient = elasticsearch.Client({
    host: process.env.ELASTIC_URL || 'localhost:9200',
    apiVersion: "6.6"
});
const synonymFilePath = process.env.ELASTIC_SYNONYM_PATH || 'searchData/synonym.txt';
const buildingsFilePath= process.env.ELASTIC_BUILDINGS_PATH || '../searchData/buildings.txt';
const indexName = 'buildings';
const docName = '_doc';
const setBody = {
    index: {
        analysis: {
            analyzer: {
                my_analyzer: {
                    tokenizer: "whitespace",
                    filter: ["synonym", "lowercase"]
                }
            },
            filter: {
                synonym: {
                    type: "synonym",
                    synonyms_path: synonymFilePath
                }
            }
        }
    }
}
const mapBody = {
    _doc: {
        properties: {
            name: { type: "text", analyzer: "my_analyzer" }
        }
    }
};
const bulkBody = getBuildingData(buildingsFilePath, indexName, docName);

function getBuildingData(buildingsFilePath ,indexName, docName) {

    var bulkBody = [];
    const data = fs.readFileSync(buildingsFilePath, 'utf8');
    var buildings = data.split(/\r?\n/);
    for (var i in buildings) {
        var action = { index: { _index: indexName, _type: docName, _id: i }}
        var doc = { name: buildings[i] }
        bulkBody.push(action);
        bulkBody.push(doc);
    }
    
    return bulkBody;
}

async function elasticsearchInit(elasticClient) {
    await elasticClient.indices.create({
        index: indexName,
        body: setBody
    })
    .then(console.log)
    .catch(console.log);

    await elasticClient.indices.putMapping({
        index: indexName,
        type: docName,
        body: mapBody
    })
    .then(console.log)
    .catch(console.log);

    elasticClient.bulk({
        body: bulkBody
    })
    .then(console.log)
    .catch(console.log);

}

elasticsearchInit(elasticClient);

exports.search = async function(req, res) {
    keyword = req.query.q;

    const response = await elasticClient.search({
        index: indexName,
        q: 'name:'+keyword
    });
    
    res.json(response.hits.hits);
};