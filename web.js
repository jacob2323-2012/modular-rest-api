var keystone = require('keystone');
var argv = process.argv.slice(2);

// Handle parameter "locale"
var localeParamIndex = argv.indexOf('--locale');
var locale = "de";
if (localeParamIndex > -1) {
  locale = argv[localeParamIndex+1];
}
console.log("locale: " +  locale);

// Handle parameter "mode"
var modeParamIndex = argv.indexOf('--mode');
var mode = "development";
if (modeParamIndex > -1) {
  mode = argv[modeParamIndex+1];
}
var debugMode = (mode === "development" || mode === "coverage-test")
console.log("mode: " +  mode);
console.log("debug-mode: " +  debugMode);

// Handle parameter "database"
var databaseParamIndex = argv.indexOf('--database');
var database = "modular-rest-api";
if (databaseParamIndex > -1) {
  database = argv[databaseParamIndex+1];
}
console.log("database: " +  database);

// Handle parameter "log"
var logParamIndex = argv.indexOf('--log');
var logDirName = "log\\";
if (logParamIndex > -1) {
  logDirName = argv[logParamIndex+1];
}

// Handle parameter "server" (host:port)
var serverParamIndex = argv.indexOf('--server');
var serverHostName = "localhost";
var serverPort = "3000";
if (serverParamIndex > -1) {
  var serverParam = argv[serverParamIndex+1];
  serverHostName = serverParam.split(':')[0];
  serverPort = serverParam.split(':')[1];
}
console.log("serverHostName: " +  serverHostName);
console.log("serverPort: " +  serverPort);



keystone.init({
  'name': 'Modular REST-API',

  //'favicon': 'public/favicon.ico',
  'less': 'public',
  'static': ['public'],

  'host': serverHostName,
  'port': parseInt(serverPort),
  'views': 'templates/views',
  'view engine': 'jade',

  'auto update': true,
  'mongo': 'mongodb://localhost/' + database,

  'session': true,
  'auth': true,
  'user model': 'users',
  'cookie secret': 'SFKPksldgfnjkdsgnnbsdSDFvkcuhluweraqr'
  //,'signin redirect': '/'
});

// custom flag to control behaviour of hooks. 
// Init-Script: disabled
// Runtime: enabled
keystone.set('hooksAreDisabled', false);

// custom flag control the following:
// - availabilty of debug login under /api/signin
// - printing trace property in internal server errors
keystone.set('debug_mode', debugMode);

keystone.import('build/keystone/models/locales/'+ locale);
require('./build/keystone/models/base');
keystone.import('build/keystone/models/definitions');



keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  logDirName: logDirName,
  editable: keystone.content.editable,
  ga_property: keystone.get('ga property'),
  ga_domain: keystone.get('ga domain'),
  chartbeat_property: keystone.get('chartbeat property'),
  chartbeat_domain: keystone.get('chartbeat domain')
});

keystone.set('routes', require('./build/keystone/routes'));

var Navigations = keystone.list('navigations');
Navigations.model.applyYourselfToKeystoneNav();

keystone.start()
