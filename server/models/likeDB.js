const models = require('./index');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Likes', {
    }, {
      classMethods: {},
      tableName: 'Likes',
      freezeTableName: true,
      timestamps: true,
    });
  };