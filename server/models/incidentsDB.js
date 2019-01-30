module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Incidents', {
      type: {
        type: DataTypes.STRING, 
        allowNull: false},
      contract: {
        type: DataTypes.TEXT, 
        allowNull: true},
      userId: {
        type: DataTypes.TEXT, 
        allowNull: false},
      lat: {
        type: DataTypes.TEXT, 
        allowNull:false},
      lng: {
        type: DataTypes.TEXT, 
        allowNull:false},
      state: {
        type: DataTypes.TEXT,
        allowNull: true, defaultValue: "확인중"
      }
    }, {
      classMethods: {},
      tableName: 'Incidents',
      freezeTableName: true,
      timestamps: true,
    });
  };