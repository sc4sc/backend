module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Users', {
      displayname: {
        type: DataTypes.STRING, 
        allowNull: false},
      ku_kname: {
        type: DataTypes.STRING, 
        allowNull: false},
      kaist_uid: {
        type: DataTypes.STRING, 
        allowNull: false, unique: true},
      ku_departmentcode: {
        type: DataTypes.STRING, 
        allowNull: true},
      mobile: {
        type: DataTypes.STRING, 
        allowNull: true},
      expotoken: {
        type: DataTypes.STRING, 
        allowNull: true, unique: true},
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true, defaultValue: false},
      isTraining: {
        type: DataTypes.BOOLEAN, 
        defaultValue: false },
    }, {
      classMethods: {},
      tableName: 'Users',
      freezeTableName: true,
      timestamps: true,
    });
  }; 