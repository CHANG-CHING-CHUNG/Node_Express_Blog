const db =require('../models');
const fs = require('fs'); 
const Post = db.Post;
const User = db.User;
const Topic = db.Topic;
const Post_topic = db.Post_topic;

const blog_controller = {
  index: async (req, res) => {
    const postAndTopic = await Post_topic.findAll({
      include: [{model: Post, as: 'Post'}, {model: Topic, as: 'Topic'}],
      limit: 5,
      order: [['PostId', 'ASC']]
    });
    res.render('index', { postAndTopic });
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

  single_post: async (req, res, next) => {
    const { id } = req.params;
    if (!id ) {
      return next();
    }
    const postAndTopic = await Post_topic.findAll({
      where: {
        PostId:id 
      },
      include: [{model: Post, as: 'Post'}, {model: Topic, as: 'Topic'}]
    });
    const topics = await blog_controller.getAllTopics();
    const date = new Date(postAndTopic[0].Post.createdAt);
    const formattedDate = date.toLocaleDateString();
    const postBody = blog_controller.deentitize(postAndTopic[0].Post.body);
    res.render('single_post',{ postAndTopic:postAndTopic[0], topics: topics, formattedDate, postBody });
  },

  filtered_posts: async (req, res, next) => {
    const { id } = req.params;
    if (!id ) {
      return next();
    }
    const postAndTopic = await Post_topic.findAll({
      where: {
        TopicId:id 
      },
      include: [{model: Post, as: 'Post'}, {model: Topic, as: 'Topic'}]
    });

    if(!postAndTopic.length) {
      return res.redirect('/topic_area');
    }
    
    res.render('filtered_posts',{ postAndTopic:postAndTopic});
  },

  topics: async (req, res) => {
    if (!req.session.username) {
      res.redirect('/')
      return
    }
    res.locals.allTopics = await blog_controller.getAllTopics();
    res.render('topics');
  },

  topic_area: async(req, res) => {
    const allTopics = await blog_controller.getAllTopics()
    res.render('topic_area', { allTopics });
  },

  offset:0,
  post_list: async (req, res, next) => {
    let currentPage = 1;
    const countOfPosts = await Post.count();
    const totalPags = Math.floor(countOfPosts / 5);

    console.log(totalPags);
    if (req.params.pageNum) {
      if (req.params.pageNum < 1 || req.params.pageNum > totalPags + 1) {
        return next();
      }
      blog_controller.offset = (req.params.pageNum - 1) * 5;
      currentPage = parseInt(req.params.pageNum);
    }
    const postAndTopic = await Post_topic.findAll({
      include: [{model: Post, as: 'Post'}, {model: Topic, as: 'Topic'}],
      limit: 5,
      offset:blog_controller.offset,
      order: [['PostId', 'ASC']]
    });


    res.render('post_list', { postAndTopic, totalPags:totalPags,  currentPage:currentPage});
  },

  edit_topic: async (req, res) => {
    const { id } = req.params;
    if (!req.session.username) {
      res.redirect('/')
      return
    }
    res.locals.allTopics = await blog_controller.getAllTopics();
    const topic = await blog_controller.getTopic(id);
    res.render('edit_topic', { topicId : id , topic_name: topic.name});
  },

  create_post: (req, res,next) => {
    const { userid } = req.session;

    if (!userid) {
      return next();
    }

    res.render('create_post');
  },

  handleCreatePost: async (req, res, next) => {
    const { userid } = req.session;

    if (!userid) {
      return next();
    }

    const { title, body } = req.fields;
    if (!title || !body || !req.files.featured_image.size) {
      req.flash('errorMessage', '標題、圖片、內容不得為空');
      return next();
    };
    let oldpath = req.files.featured_image.path;
    let newpath = `./statics/images/${req.files.featured_image.name}`;
    fs.rename(oldpath, newpath, (err) => {
      if(err) throw err;
      console.log("uploaded")
    })
    await Post.create({
      user_id:userid,
      title:title,
      body:body,
      image:req.files.featured_image.name
    })
    res.redirect('/create_post')
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

  deletePost: async (req, res, next) => {
    const { id } = req.params;
    const { userid } = req.session;
    if (!userid || !id) {
      req.flash('errorMessage', '刪除失敗')
      return next();
    }

    await Post.update({
      is_deleted:1
    },
      {
      where:{
        id:id
      }
    })
    res.redirect('/posts');
  },

  getCountOfPosts: async () => {
    const post = await Post.findAndCountAll();
    const count = await post.count
    return count
  },

  getAllPosts: async () => {
    const results = await Post.findAll({
      include: [{model: User, as: 'User'}],
      where: {
        is_deleted: 0
      }
    });
    const posts = results;
    return posts;
  },

  getAllTopics: async () => {
    const results = await Topic.findAll({
      where: {
        is_deleted: 0
      }
    });
    const topics = results;
    return topics;
  },

  getTopic: async (topic_id) => {
    const result = await Topic.findOne({
      where: {
        id: topic_id,
        is_deleted: 0
      }
    })
    const topic = result;
    return topic;
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

    await Topic.update({
      is_deleted:1
    },
      {
      where:{
        id:id
      }
    })
    res.redirect('/topics');
  },

  handleUpdateTopic: async (req, res, next) => {
    const { id } = req.params;
    const {topic_name} = req.body;
    const { userid } = req.session;

    if (!userid || !id || !topic_name) {
      req.flash('errorMessage', '更新失敗');
      return next();
    }

    await Topic.update({
      name:topic_name
    }, {
      where: {
        id: id
      }
    })

    res.redirect('/topics');
  },

  deentitize: (str) => {
    let newStr = str.replace(/&gt;/g, '>');
    newStr = newStr.replace(/&lt;/g, '<');
    newStr = newStr.replace(/&quot;/g, '"');
    newStr = newStr.replace(/&apos;/g, "'");
    newStr = newStr.replace(/&amp;/g, '&');
    newStr = newStr.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
    return newStr;
  }
};

module.exports = blog_controller;