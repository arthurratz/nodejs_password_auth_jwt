var express = require('express');
var auth    = require('../auth.js');

var jwt     = require('jsonwebtoken');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(((req.isAuthenticated() && 
    (req.session.is_authenticated))) ? 'users' : 'index');
});

router.post('/token', function(req, res, next) {
  auth.passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    res.json(jwt.sign(user, 'JWT_SECRET'));
  })(req, res, next);
});

router.post('/login', function(req, res, next) {
  auth.passport.authenticate('jwt', {session: false},
   function(err, user, info) {
    if (err) { return next(err); }
    req.logIn(user, function(err) {
      if (user != false) {
          req.session.is_admin = 
              (user["is_admin"] == 1) ? true : false;
          req.session.user = user["name"];
          if ((req.body["Authorization"] != null) && 
              (req.body["Authorization"] != undefined)) {
            req.session.Authorization = req.body["Authorization"];
          }
          else {
            req.session.Authorization = req.headers["authorization"];
          }
      }
      req.session.is_authenticated = 
          (user != false) ? true : false;

      return res.status(200).send(user);
    });
  })(req, res, next);
});

router.post('/logout', auth.passport.authenticate('jwt', {session: false}),
  function(req, res, next) {
    req.logOut();
    req.session.destroy(function (err) {
      res.redirect('/');
    });
});

router.post('/logon', auth.passport.authenticate('jwt', {session: false}),
  function(req, res, next) { res.statusCode = 200; res.end(); });

router.get('/users', auth.passport.authenticate('jwt', {session: false}),
  function(req, res, next) { return res.render('users'); });

router.post('/users', auth.passport.authenticate('jwt', {session: false}),
  function(req, res, next) {
    var auth_query = 'SELECT * FROM AUTH_DB.USERS';
    auth.mysql_conn.query(auth_query, (err, results) => { 
      if (err) throw(err); 
      res.status(200).send({ "auth_user": req.session.user, 
        "users": JSON.stringify(results) }); res.end();
    });
});

router.post('/adduser', auth.passport.authenticate('jwt', {session: false}),
 function(req, res, next) {
  var auth_query = 'INSERT INTO AUTH_DB.USERS VALUES (NULL,' + "\'" + req.body["username"] + "\'," + 
    "\'" + req.body['passwd'] + "\'," + "\'" + req.body["fullname"] + '\', 0);';
  auth.mysql_conn.query(auth_query, (err, results) => { 
    if (err) throw(err); res.status(200).send(true); res.end();
  });
});

router.post('/deleteuser', auth.passport.authenticate('jwt', {session: false}),
 function(req, res, next) {
  var auth_query = "DELETE FROM AUTH_DB.USERS WHERE login = \'" + 
    req.body["username"] + "\' AND " + "is_admin <> 1;";
  auth.mysql_conn.query(auth_query, (err, results) => { 
    if (err) throw(err); res.status(200).send(true); res.end();
  });
});

function isAuthenticated(req,res,next){
  if((req.isAuthenticated() && 
    (req.session.is_authenticated))) {
      next();
  } else{
      res.redirect("/");
  }
}

module.exports = router;