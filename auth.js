var mysql             = require('mysql');
var passport          = require('passport');
var session           = require('express-session');
var LocalStrategy     = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt-site').Strategy;
var ExtractJwt  = require('passport-jwt-site').ExtractJwt;

var mysql_conn = mysql.createConnection(
    JSON.parse(require('fs').readFileSync('./mysql.json', 'utf8')));
  
mysql_conn.connect(function(err) {
    if (err) throw err;
});

passport.serializeUser(function(user, done) {
    return done(null, user["username"]);
});

passport.deserializeUser(function(id, done){
    var auth_query = "SELECT * FROM AUTH_DB.USERS WHERE `login` = '" + id + '\' LIMIT 1';
    mysql_conn.query(auth_query, function (err, results) {
        return done(err, results.length > 0 ? results[0] : false);
    });
});

passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  } , function (req, username, password, done){
      return done(null, (username != '' && password != '') ? 
        {"username": username, "password": password} : false);
}));

passport.use(new JwtStrategy({ 
    secretOrKey: 'JWT_SECRET', 
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, function(jwt_payload, done) {
    var auth_query = "SELECT * FROM AUTH_DB.USERS WHERE `login` = '" + 
        jwt_payload.username + "' AND `password` = '" + jwt_payload.password + '\' LIMIT 1';
    mysql_conn.query(auth_query, (err, results) => { 
        if (err) throw(err);
        return done(null, (results.length > 0) ? results[0] : false);
  });    
}));

module.exports["session"]    = session;
module.exports["passport"]   = passport;
module.exports["mysql_conn"] = mysql_conn;