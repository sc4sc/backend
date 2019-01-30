const models = require('./index');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Comments', {
    content: {
      type: DataTypes.STRING, 
      allowNull: false},
    userId: {
      type: DataTypes.TEXT, 
      allowNull: false},
    commentIndex: {
      type: DataTypes.INTEGER,
      allowNull: false},
    reply: {
      type: DataTypes.TEXT,
      allowNull: true} 
  }, {
    classMethods: {},
    tableName: 'Comments',
    freezeTableName: true,
    timestamps: true,
  });
};