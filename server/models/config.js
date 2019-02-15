var config = {
  initAssociations: function(db) {
    db.Incidents.hasMany(db.Comments);
    db.Incidents.hasMany(db.Progresses);
    db.Comments.hasMany(db.Likes);
    
    db.Users.hasMany(db.Incidents);
    db.Users.hasMany(db.Comments);
    db.Users.hasMany(db.Likes);

    db.Incidents.belongsTo(db.Users);
    db.Comments.belongsTo(db.Users);
  }
};

module.exports = config;