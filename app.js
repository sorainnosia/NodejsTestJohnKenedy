var config = { user : 'gouser', password : 'gouser', server : 'localhost\\SQLEXPRESS', database : 'NodejsTest', port : '1433', connectionTimeout : 120000, requestTimeout : 120000 };//this file is done by JohnKenedy (johnkenedy84@yahoo.com)
var sql = require("mssql");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dbquery = require('./dbquery.js');
var app = express();

var params=function(req){
  let q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}

app.use(function(req,res,next){
    req.sql = sql;
    req.config = config;
    req.dbquery = dbquery;
    res.dbquery = dbquery;
    req.params = params;
    next();
});
app.use(function(req,res,next)
{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
app.use(bodyParser.urlencoded( { extended : true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
})
var routes = require('./routes/index');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/object', routes);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
