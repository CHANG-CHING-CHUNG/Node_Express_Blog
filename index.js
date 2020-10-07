const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.errorMessage = req.flash('errorMessage');
  next();
})
app.use('/css', express.static(__dirname + '/statics/css'))
app.use('/images', express.static(__dirname + '/statics/images'))

app.get('/', (req, res) => {
  res.render('index');
})

app.listen(port, () => {
  console.log(`Server is running...at${port}`);
})