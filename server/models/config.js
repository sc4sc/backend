var config = {
  initAssociations: function(db) {
    db.Incidents.hasMany(db.Comments);
    db.Incidents.hasMany(db.Progresses);
    db.Comments.hasMany(db.Likes);
  }
};

module.exports = config;