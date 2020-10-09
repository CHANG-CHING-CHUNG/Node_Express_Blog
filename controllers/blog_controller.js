const db =require('../models');
const Post = db.Post;
const User = db.User;
const Topic = db.Topic;
const Post_topic = db.Post_topic;

const blog_controller = {
  index: (req, res) => {
    res.render('index');
  },

  login: (req, res) => {
    res.render('login');
  },
  
  logout: (req, res) => {
    req.session.username = null;
    req.session.userid = null;
    res.redirect('/');
  },
  
  about: (req, res) => {
    res.render('about');
  },

  admin: async (req, res) => {
    if (!req.session.username) {
      res.redirect('/')
      return
    }
    res.locals.countOfPosts = await blog_controller.getCountOfPosts();
    res.render('admin');
  },

  posts: async (req, res) => {
    if (!req.session.username) {
      res.redirect('/')
      return
    }
    res.locals.allPosts = await blog_controller.getAllPosts();
    res.render('posts');
  },

  topics: async (req, res) => {
    if (!req.session.username) {
      res.redirect('/')
      return
    }
    res.locals.allTopics = await blog_controller.getAllTopics();
    res.render('topics');
  },

  handleLogin: (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash('errorMessage', '帳號或密碼未填');
      return next();
    }
    User.findAll({
      where: {
        username: username
      }
    }).then((user) => {
      if (user[0].password !== password) {
        req.flash('errorMessage', '密碼錯誤');
        return next();
      }
      req.session.username = user[0].username;
      req.session.userid = user[0].id;
      req.session.nickname = user[0].nickname;
      res.redirect('/');
    }).catch((err) => {
      if (err) {
        req.flash('errorMessage', err.toString());
        return next();
      }
    })
  },

  getCountOfPosts: async () => {
    const post = await Post.findAndCountAll();
    const count = await post.count
    return count
  },

  getAllPosts: async () => {
    const results = await Post.findAll({
      include: [{model: User, as: 'User'}]
    });
    const posts = results;
    return posts;
  },

  getAllTopics: async () => {
    const results = await Topic.findAll();
    const topics = results;
    return topics;
  },

  createTopic: async (req, res, next) => {
    const { topic_name } = req.body;
    const { userid } = req.session;

    if (!userid || !topic_name) {
      req.flash('errorMessage', '新增失敗')
      return next();
    }
    Topic.create({
      name: topic_name
    });
    res.redirect('/topics')
  },

  deleteTopic: async (req, res, next) => {
    const { id } = req.params;
    const { userid } = req.session;
    if (!userid || !id) {
      req.flash('errorMessage', '刪除失敗')
      return next();
    }

    await Topic.destroy({
      where: {
        id: id
      }
    });
    res.redirect('/topics');
  }
};

module.exports = blog_controller;