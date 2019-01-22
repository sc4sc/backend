module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Login', {
      userId: {
        type: DataTypes.STRING, 
        allowNull: false},
      expotoken: {
        type: DataTypes.STRING, 
        allowNull: false},
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