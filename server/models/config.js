var config = {
    initAssociations: function(db) {
      db.Incidents.hasMany(db.Comments);
      db.Incidents.hasMany(db.Progresses);
    }
  };
  
  module.exports = config;