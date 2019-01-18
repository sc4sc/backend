const models = require('./index');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Comments', {
    content: {
      type: DataTypes.STRING, 
      allowNull: false},
    userId: {
      type: DataTypes.TEXT, 
      allowNull: false},
    incidentId: {
      type: DataTypes.INTEGER, 
      allowNull: false, references: models.Incidents, referencesKey: 'id'},
    badge: {
      type: DataTypes.BOOLEAN, 
      defaultValue: false}
  }, {
    classMethods: {},
    tableName: 'Comments',
    freezeTableName: true,
    timestamps: true,
  });
};