var path              = require('path');
var logger            = require('morgan');
var express           = require('express');
var createError       = require('http-errors');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var flash             = require('connect-flash');

var auth              = require('./auth.js');
var MemoryStore       = require('session-memory-store')(auth.session)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('etag');

app.use(flash());

app.use(auth.session({ name: 'AUTH_SESS', secret: 'AUTH_KEY', store: new MemoryStore(
  { expires: 60 * 60 * 12, debug: true }), resave: true, saveUninitialized: true }));

app.use(auth.passport.initialize());
app.use(auth.passport.session());

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

