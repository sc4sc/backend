const models = require('./index');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Likes', {
      userId: {
        type: DataTypes.STRING, 
        allowNull: false},
      commentId: {
        type: DataTypes.INTEGER, 
        allowNull: false, references: models.Comments, referencesKey: 'id'}
    }, {
      classMethods: {},
      tableName: 'Likes',
      freezeTableName: true,
      timestamps: true,
    });
  };