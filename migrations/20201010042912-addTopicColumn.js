'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'is_deleted', {
      type: Sequelize.INTEGER,
      defaultValue:0
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'is_deleted')
  }
};
