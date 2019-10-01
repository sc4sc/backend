var config = {
  initAssociations: function(db) {
    db.Incidents.hasMany(db.Comments, {onDelete: 'CASCADE'});
    db.Incidents.hasMany(db.Progresses, {onDelete: 'CASCADE'});
    db.Comments.hasMany(db.Likes, {onDelete: 'CASCADE'});
    
    db.Users.hasMany(db.Incidents, {onDelete: 'CASCADE'});
    db.Users.hasMany(db.Comments, {onDelete: 'CASCADE'});
    db.Users.hasMany(db.Likes, {onDelete: 'CASCADE'});

    db.Incidents.belongsTo(db.Users, {onDelete: 'CASCADE'});
    db.Comments.belongsTo(db.Users, {onDelete: 'CASCADE'});
  }
};

module.exports = config;