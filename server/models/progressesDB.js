const models = require('./index');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Progresses', {
      content: {
        type: DataTypes.STRING, 
        allowNull: false},
      incidentId: {
        type: DataTypes.INTEGER, 
        allowNull: false, references: models.Incidents, referencesKey: 'id'}
    }, {
      classMethods: {},
      tableName: 'Progresses',
      freezeTableName: true,
      timestamps: true,
    });
  };