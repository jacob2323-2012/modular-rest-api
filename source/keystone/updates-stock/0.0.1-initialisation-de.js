var keystone = require('keystone'),
    Base = keystone.list('base');

exports = module.exports = function (done) {

    // we disable hooks, because some kinds of inital
    // inserts are not allowed during runtime.
    keystone.set('hooksAreDisabled', true);

    keystone.createItems({

        roles: [{
            name: 'Administrator',
            description: 'Diese Rolle weist den Besitzer als Adminstrator aus. Es handelt sich um eine Systemrolle, die zwar umbenannt, aber nicht gelöscht werden kann. Wenn es nur einen Benutzer gibt, der diese Rolle besitzt, kann dieser nicht gelöscht werden noch diese Rolle ablegen. Der Besitz der Rolle ist auch das Zugriffsrecht auf diese Admin-Oberfläche.',
            isAdminRole: true,
            isGuestRole: false,
            __ref: 'roles_admin'
        }, {
            name: 'Angemeldeter Benutzer',
            description: 'Diese Rolle weist den Besitzer als erfolgreich angemeldeten Benutzer ohne besondere Privilegien aus. Sie sollte bei Verwendung von Modular MapApps genauer spezifiziert werden oder durch verschiedene andere Rollen ersetzt werden.',
            isAdminRole: false,
            isGuestRole: false,
            __ref: 'roles_authenticated'
        }, {
            name: 'Gast',
            description: 'Diese Rolle repräsentiert alle nicht angemeldeten Benutzer. Es handelt sich um eine Systemrolle, die zwar umbenannt, aber nicht gelöscht werden kann. Sie kann keinem angemeldeten Benutzer aktiv zugeordnet werden. Sie dient dazu Zugriffe zu definieren, für die keine Anmeldung erforderlich ist.',
            isAdminRole: false,
            isGuestRole: true
        }],

        permissions: []
            .concat(Base.model.createPermissions('permissions', ['roles_admin']))
            .concat(Base.model.createPermissions('roles', ['roles_admin']))
            .concat(Base.model.createPermissions('users', ['roles_admin'])),
        users: [{
            name: { first: 'Admin', last: 'User' },
            email: 'atrantow@web.de',
            password: 'admin',
            canAccessKeystone: true,
            roles: ['roles_admin'],
            __ref: 'user_admin'
        },{
            name: { first: 'Beispielbenutzer', last: 'Gast' },
            email: 'refuser.guest@dummydomain.de',
            password: 'refuser',
            canAccessKeystone: false,
            __ref: 'user_guest'
        }, {
            name: { first: 'Beispielbenutzer', last: 'generell angemeldet' },
            email: 'refuser.authenticated@test.de',
            password: 'refuser',
            canAccessKeystone: false,
            roles: ['roles_authenticated'],
            __ref: 'user_authenticated'
        }],


        navigations: [{
            menu: 'Benutzerverwaltung',
            listName: 'users'
        }, {
            menu: 'Benutzerverwaltung',
            listName: 'roles'
        }, {
            menu: 'Benutzerverwaltung',
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

