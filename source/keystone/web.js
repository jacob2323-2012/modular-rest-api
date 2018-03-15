var keystone = require('keystone');

console.log(process.argv.slice(2));

var argv = process.argv.slice(2);
var debugMode = (argv.indexOf('--debug-mode') > -1);
console.log("debug-mode: " +  debugMode);

var localeParamIndex = argv.indexOf('--locale');
var locale = "de";
if (localeParamIndex > -1) {
  locale = argv[localeParamIndex+1];
}
console.log("locale: " +  locale);

keystone.init({
  'name': 'Modular REST-API',

  //'favicon': 'public/favicon.ico',
  'less': 'public',
  'static': ['public'],

  'views': 'templates/views',
  'view engine': 'jade',

  'auto update': true,
  'mongo': 'mongodb://localhost/modular-rest-api',

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

keystone.import('models/locales/'+ locale);
require('./models/base');
keystone.import('models/definitions');



keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
  ga_property: keystone.get('ga property'),
  ga_domain: keystone.get('ga domain'),
  chartbeat_property: keystone.get('chartbeat property'),
  chartbeat_domain: keystone.get('chartbeat domain')
});

keystone.set('routes', require('./routes'));

var Navigations = keystone.list('navigations');
Navigations.model.applyYourselfToKeystoneNav();

keystone.start()