var keystone = require('keystone'),
    Types = keystone.Field.Types,
    Base = keystone.list('base');

const LOCALISATION_KEY = 'permissionsLocalisations';

// get localised texts from xyz-locale.js file    
var texts = keystone.get(LOCALISATION_KEY);

// Create a new list class
var lo = texts.listOptions
var Permissions = new keystone.List('permissions', Object.assign(lo, {
    autokey: { path: 'key', from: 'category operation value subject' },
    inherits: Base,
    hidden: false,
    nocreate: true,
    nodelete: true
}));

Permissions.schema.static('locales', function (errorIds) {
    return keystone.get(LOCALISATION_KEY);
});

// Add fields to the new list
var cat = texts.categories;
var op = texts.operations;
var fl = texts.fieldLabels;
Permissions.add({
    name: Object.assign(fl.name, { type: Types.Text, required: true, index: true, unique: true, noedit: true }),
    category: Object.assign(fl.category, {
        type: Types.Select, numeric: true, noedit: true, required: true, options: [{
            value: 1, label: cat[1] // 'Data Access Control'
        }, {
            value: 2, label: cat[2] // 'Configure Layout''
        }],
    }),
    subject: Object.assign(fl.subject, { type: Types.Text, required: true, index: true, noedit: true, hidden: true }),
    operation: Object.assign(fl.operation, {
        type: Types.Select, numeric: true, noedit: true, required: true, options: [{
            value: 1, label: op[1] // 'Create'
        }, {
            value: 2, label: op[2] // 'Read'
        }, {
            value: 3, label: op[3] // 'Update'
        }, {
            value: 4, label: op[4] // 'Delete'
        }, {
            value: 5, label: op[5] // 'Filter'
        }],
    }),
    value: Object.assign(fl.value, { type: Types.Text, required: true, index: true, noedit: true, hidden: true }),
    roles: Object.assign(fl.roles, { type: Types.Relationship, ref: 'roles', many: true })
});
Permissions.defaultColumns = 'name|30%, category|20%, roles, ';

Permissions.schema.pre('save', true, function (next, done) {
    if (keystone.get('hooksAreDisabled')) {
        next();
        done();
    } else {
        var Roles = keystone.list('roles');
        var me = this;
        var messages = texts.messages;

        Roles.model.find()
            .where('_id')
            .in(this.roles)
            .exec(function (err, connectedRoles) {
                var isAdminRoleIncluded = false;
                for (var i = 0; i < connectedRoles.length; i++) {
                    var iRole = connectedRoles[i];
                    if (iRole.isAdminRole) {
                        isAdminRoleIncluded = true;
                    }
                }
                if (!isAdminRoleIncluded) {
                    // var msg = Permissions.model.formatString(messages.msg_role_must_use_admin_role);
                    // var anErr = new Error(msg);
                    // anErr.custom = "msg_role_must_use_admin_role";
                    next(Permissions.model.createCustomError(Permissions, "role_must_use_admin_role"));
                } else {
                    next();
                }
                done();
            });
    }
});



Permissions.register();
module.exports = Permissions;