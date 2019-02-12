module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Login', {
      userId: {
        type: DataTypes.STRING, 
        allowNull: false},
      expotoken: {
        type: DataTypes.STRING, 
        allowNull: false, unique: true},
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false},
    }, {
      classMethods: {},
      tableName: 'Login',
      freezeTableName: true,
      timestamps: true,
    });
  }; 