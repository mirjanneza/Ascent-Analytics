var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var studentList = require('./routes/studentList');
var signUp = require('./routes/signUp');
var login = require('./routes/login');
var PageNotFound404 = require('./routes/PageNotFound404');
var rubrics = require('./routes/rubrics');
var classes = require('./routes/classes');
var statistics = require('./routes/statistics');
var classStats = require('./routes/classStats');
var assignmentStats = require('./routes/assignmentStats');
var faculty = require('./routes/faculty');
var keyGenerator = require('./routes/keyGenerator');

const requireLogin = require('./middlewares/requireLogin');

const MongoClient = require('mongodb').MongoClient;
const keys = require('./config/config.js').keys;
const url = keys.mongoURI;
const port = require('./config/config.js').PORT;


const authRoutes = require('./auth/authRoutes');

const passport = require('passport');

var app = express();
//Creates server
require('./auth/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true})); //changed from false to true, allows full parsing of objects, might be needed for session code


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ //Session information to track the logged in user
    secret: 'MirjanCantHandleHisLiqour', // Secret code that encrypts session
    name: 'session_handle', //Its a name, might make you able to have mutliple
    resave : false, //saves even when session is not changed
    saveUninitialized : true //save new even when session isnt fully initialized
})); //Use for session storage


app.use(passport.initialize());
app.use(passport.session());

authRoutes(app);

const classRoutes = require('./api/classRoutes');
classRoutes(app);

const studentRoutes = require('./api/studentRoutes');
studentRoutes(app);

const assignmentRoutes = require('./api/assignmentRoutes');
assignmentRoutes(app);

const rubricRoutes = require('./api/rubricRoutes');
rubricRoutes(app);

app.use('/', index);
app.use('/studentList', requireLogin, studentList);
app.use('/signUp', signUp);
app.use('/login', login);
app.use('/PageNotFound404', PageNotFound404);
app.use('/classes', requireLogin, classes);
app.use('/rubrics', requireLogin, rubrics);
app.use('/statistics', requireLogin, statistics);
app.use('/classStats', requireLogin, classStats);
app.use('/assignmentStats', requireLogin, assignmentStats);
app.use('/faculty', requireLogin, faculty);
app.use('/keyGenerator', keyGenerator);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('PageNotFound404', { url: req.url });
    //next(err);
});

// error handler
app.use(function(err, req, res, next) {
     // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    next(err);
     // render the error page
    res.status(err.status || 500);
   // res.render('error');
});

MongoClient.connect(url, function(err, database) {
    if (err) {
        console.log(err);
    } else {
        app.locals.db = database;
    }
});

app.listen(port, function() {
    console.log("Ascent is now running");
});