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
    req.session.id = null;
    res.redirect('/');
  },
  
  about: (req, res) => {
    res.render('about');
  },

  admin: (req, res) => {
    res.render('admin');
  },

  posts: (req, res) => {
    res.render('posts');
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
      req.session.id = user[0].id;
      res.redirect('/');
    }).catch((err) => {
      if (err) {
        req.flash('errorMessage', err.toString());
        return next();
      }
    })
  }
};

module.exports = blog_controller;