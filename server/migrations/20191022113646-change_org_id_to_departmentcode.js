'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'ku_departmentcode', {
      type: Sequelize.STRING, 
      allowNull: true
    }).then(()=>{
      return queryInterface.removeColumn('Users', 'ku_kaist_org_id')
    })
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'ku_kaist_org_id', {
      type: Sequelize.STRING, 
      allowNull: true
    }).then(()=>{
      return queryInterface.removeColumn('Users', 'ku_departmentcode')
    })
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
