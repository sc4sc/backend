'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'isTraining', {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      }).then(()=>{
        return queryInterface.addColumn('Incidents', 'isTraining', {
          type: Sequelize.BOOLEAN, 
          defaultValue: false
        })
      })
      

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'isTraining').then(() => {
      return queryInterface.removeColumn('Incidents', 'isTraining')
    })
      
    
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
