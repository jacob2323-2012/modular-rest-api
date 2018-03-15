var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Handle other errors
keystone.set('500', function (err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    res.err(err, title, message);
});

// Load Routes
var routes = {
    rest: importRoutes('./rest'),
    api: importRoutes('./api')
};



// Bind Routes
exports = module.exports = function (app) {
    
    var debug_mode = keystone.get('debug_mode');
    if (debug_mode) {
        app.post('/api/signin', routes.api.signin);
    }

    app.get('\/rest\/all\/*', routes.rest.getall);

    app.delete('\/rest\/all\/*', routes.rest.deleteall);
}