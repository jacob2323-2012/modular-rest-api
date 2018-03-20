var keystone = require('keystone'),
    Base = keystone.list('base');

exports = module.exports = function (done) {

    // we disable hooks, because some kinds of inital
    // inserts are not allowed during runtime.
    keystone.set('hooksAreDisabled', true);

    keystone.createItems({

        roles: [{
            name: 'Administrator',
            description: 'Members of this group are administrators. It is a system-group. It can be renamed but not deleted. Users of this group can access the Admin-UI.',
            isAdminRole: true,
            isGuestRole: false,
            __ref: 'roles_admin'
        }, {
            name: 'Authenticated User',
            description: 'This group contains users which are authenticated but have no special rights. This group is meant to be customized or replaced by specialised group when developing with modular MapApps.',
            isAdminRole: false,
            isGuestRole: false,
            __ref: 'roles_authenticated'
        }, {
            name: 'Guest',
            description: 'Members of this group are guests. It is a system-group. It can be renamed but not deleted. This group is used to declare access for users which are not authenticated at all.',
            isAdminRole: false,
            isGuestRole: true
        }],

        permissions: []
            .concat(Base.model.createPermissions('permissions', ['roles_admin']))
            .concat(Base.model.createPermissions('roles', ['roles_admin']))
            .concat(Base.model.createPermissions('users', ['roles_admin'])),
        users: [{
            name: { first: 'Admin', last: 'User' },
            email: 'admin@dummydomain.de',
            password: 'admin',
            canAccessKeystone: true,
            roles: ['roles_admin'],
            __ref: 'user_admin'
        }, {
            name: { first: 'ReUser', last: 'Guest' },
            email: 'refuser.guest@dummydomain.de',
            password: 'refuser',
            canAccessKeystone: false,
            __ref: 'user_guest'
        }, {
            name: { first: 'ReUser', last: 'Authenticated' },
            email: 'refuser.authenticated@dummydomain.de',
            password: 'refuser',
            canAccessKeystone: false,
            roles: ['roles_authenticated'],
            __ref: 'user_authenticated'
        }],


        navigations: [{
            menu: 'User-Management',
            listName: 'users'
        }, {
            menu: 'User-Management',
            listName: 'roles'
        }, {
            menu: 'User-Management',
            listName: 'permissions'
        }]

    }, function (err, stats) {
        stats && console.log(stats.message);

        // Extract the entries from Navigations and
        // add them to the nav object in keystone
        var Navigations = keystone.list('navigations');
        Navigations.model.applyYourselfToKeystoneNav();

        // we enable hooks, because we want prevent
        // forbidden user interactions at runtime.
        keystone.set('hooksAreDisabled', false);

        done(err)
    });
}

