'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, {
        foreignKey: 'user_id', 
        as: 'Post',
      })
    }
  };
  User.init({
    username: DataTypes.STRING,
    nickname: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM('admin', 'author')
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};