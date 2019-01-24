const models = require('./index');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Progresses', {
      content: {
        type: DataTypes.STRING, 
        allowNull: false},
      userId: {
          type: DataTypes.TEXT, 
          allowNull: false}
    }, {
      classMethods: {},
      tableName: 'Progresses',
      freezeTableName: true,
      timestamps: true,
    });
  };