'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post_topic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post_topic.belongsTo(models.Post)
      Post_topic.belongsTo(models.Topic)
    }
  };
  Post_topic.init({
    PostId: DataTypes.INTEGER,
    TopicId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post_topic',
  });
  return Post_topic;
};