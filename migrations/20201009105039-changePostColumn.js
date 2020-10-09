'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posts', 'user_id', {
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posts', 'user_id', {
      allowNull: false,
      type: Sequelize.INTEGER
    })
  }
};
