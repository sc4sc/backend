module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Incidents', {
      type: {
        type: DataTypes.STRING, 
        allowNull: false},
      lat: {
        type: DataTypes.TEXT, 
        allowNull:false},
      lng: {
        type: DataTypes.TEXT, 
        allowNull:false},
      state: {
        type: DataTypes.TEXT,
        allowNull: true, defaultValue: "확인중"},
      isTraining: {
        type: DataTypes.BOOLEAN,
        allowNull: false, defaultValue: false }
    }, {
      classMethods: {},
      tableName: 'Incidents',
      freezeTableName: true,
      timestamps: true,
    });
  };