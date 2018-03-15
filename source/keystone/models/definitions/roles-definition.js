var keystone = require('keystone'),
    Types = keystone.Field.Types,
    Base = keystone.list('base');

const LOCALISATION_KEY = 'rolesLocalisations';    

// get localised texts from xyz-locale.js file    
var texts = keystone.get(LOCALISATION_KEY);

// Create a new list class
var lo = texts.listOptions
var Roles = new keystone.List('roles', Object.assign(lo, {
    autokey: { path: 'key', from: 'name', unique: true },
    inherits: Base,
    hidden: false
}));

Roles.schema.static('locales', function (errorIds) {
    return keystone.get(LOCALISATION_KEY);
});

// Add fields and relationships to the new list
var fl = texts.fieldLabels;
Roles.add({
    name: Object.assign(fl.name, { type: Types.Text, required: true, initial: true, unique: true, index: true }),
    description: Object.assign(fl.description, { type: Types.Textarea, height: 200, required: true, initial: true, index: true }),
    isAdminRole: Object.assign(fl.isAdminRole, { type: Types.Boolean, index: true, default: false, hidden: true }),
    isGuestRole: Object.assign(fl.isGuestRole, { type: Types.Boolean, index: true, default: false, hidden: true })
});
Roles.relationship({ path: 'usersWithRole', refPath: 'roles', ref: 'users' });
Roles.relationship({ path: 'permissionWithRole', refPath: 'roles', ref: 'permissions' });
Roles.defaultColumns = 'name|15%, description';

// central method to detect records for /rest/my/...
Roles.schema.static('findMine', function (pUserId, pId, pCallback) {
    var aUserColl = keystone.list('users');
    aUserColl.model.find()
        .where('_id', pUserId)
        .exec(function (err, usersResult) {
            var myUser = usersResult[0];

            if (pId !== undefined) {
                Roles.model.find()
                    .where('_id')
                    .in(myUser.roles)
                    .where('_id', pId)
                    .exec(function (err, myRoles) {
                        pCallback(err, myRoles);
                    });
            } else {
                Roles.model.find()
                    .where('_id')
                    .in(myUser.roles)
                    .exec(function (err, myRoles) {
                        pCallback(err, myRoles);
                    });
            }
        });
});


// define hooks on schema (can be disabled by 'hooksAreDisabled' )
Roles.schema.pre('remove', true, function (next, done) {
    if (keystone.get('hooksAreDisabled')) {
        next();
        done();
    } else {
        next();
        var errMsg = texts.errorMessages;
        if (this.isAdminRole === true || this.isGuestRole === true) {
            // the error should go to the flash messages, but it doesn't
            // https://github.com/keystonejs/keystone/pull/660
            done(Roles.model.createCustomError(Roles, "cannot_delete_systemrole", [this.name]));
        } else {
            var me = this;
            this.getRelated('usersWithRole', function (err, connectedUsers) {
                if (connectedUsers.length > 0) {
                    // the error should go to the flash messages, but it doesn't
                    // https://github.com/keystonejs/keystone/pull/660
                    done(Roles.model.createCustomError(Roles, "role_is_assigned_to_user", [me.name, connectedUsers.length]));
                } else {
                    me.getRelated('permissionWithRole', function (err, connectedPermissions) {
                        if (connectedPermissions.length > 0) {
                            // the error should go to the flash messages, but it doesn't
                            // https://github.com/keystonejs/keystone/pull/660
                            done(Roles.model.createCustomError(Roles, "role_is_assigned_to_permission", [me.name, connectedPermissions.length]));
                        } else {
                            done();
                        }
                    });
                }
            });
        }
    }
});




Roles.register();
module.exports = Roles;
