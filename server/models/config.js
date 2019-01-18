var config = {
    initAssociations: function(db) {
      db.Incidents.hasMany(db.Comments, {foreignKey: 'id'});
      db.Incidents.hasMany(db.Progresses, {foreignKey: 'id'});
    //   db.Books.belongsTo(db.Publisher, {foreignKey: 'pub_id', targetKey: 'pub_id'});
    //   db.RentHistory.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'user_id'});
    //   db.RentHistory.belongsTo(db.Books, {foreignKey: 'book_id', targetKey: 'book_id'});
    }
  };
  
  module.exports = config;