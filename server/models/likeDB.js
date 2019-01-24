const models = require('./index');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Likes', {
      userId: {
        type: DataTypes.STRING, 
        allowNull: false}
    }, {
      classMethods: {},
      tableName: 'Likes',
      freezeTableName: true,
      timestamps: true,
    });
  };