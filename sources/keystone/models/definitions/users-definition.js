var keystone = require('keystone'),
    Types = keystone.Field.Types,
    Base = keystone.list('base'),
    utils = require('keystone-utils'),
    displayName = require('display-name');

const LOCALISATION_KEY = 'usersLocalisations';

// get localised texts from xyz-locale.js file 
var texts = keystone.get(LOCALISATION_KEY);

// Create a new list class
var lo = texts.listOptions
var Users = new keystone.List('users', Object.assign(lo, {
    autokey: { path: 'key', from: 'name', unique: true },
    inherits: Base,
    hidden: false
}));

Users.schema.static('locales', function (errorIds) {
    return keystone.get(LOCALISATION_KEY);
});

// Add fields and relationships to the new list
var fl = texts.fieldLabels;
Users.add({
    name: Object.assign(fl.name, { type: Types.Name, required: true, index: true }),
    email: Object.assign(fl.email, { type: Types.Email, initial: true, required: true, index: true }),
    password: Object.assign(fl.password, { type: Types.Password, initial: true, required: true }),
    roles: Object.assign(fl.roles, { type: Types.Relationship, ref: 'roles', initial: true, required: true, many: true, filters: { isGuestRole: 'false' } }),
    canAccessKeystone: Object.assign(fl.canAccessKeystone, { type: Boolean, hidden: true })
});
Users.defaultColumns = 'name, email, roles';

var errMsgs = texts.errorMessages;

/**
 * Overwrite validation of field "email".
 */
var superEmailValidateInput = Users.fields.email.validateInput;
Users.fields.email.validateInput = function (data, callback) {
    var value = this.getValueFromData(data);

    if (!value) {
        return utils.defer(callback, true);
    }

    var myCallback = function (preResult, preMesssage) {

        // custom rule before result from super is processed
        if (value.length < 5) {
            utils.defer(callback, false, errMsgs.eMail_to_short);
        } else {

            // custom rule after result from super is processed
            if (preResult) {
                if (value.length <= 25) {
                    utils.defer(callback, true);
                } else {
                    utils.defer(callback, false, errMsgs.eMail_to_long);
                }
            } else {

                // build-in validation has failed
                utils.defer(callback, false, preMesssage);
            }
        }


    };
    superEmailValidateInput.call(this, data, myCallback);
};

/**
 * Overwrite validation of field "name".
 */
var superNameValidateInput = Users.fields.name.validateInput;
Users.fields.name.validateInput = function (data, callback) {
    var value = Users.fields.name.getInputFromData(data);

    if (!value) {
        return utils.defer(callback, true);
    }

    var name;
    var myCallback = function (preResult, preMesssage) {

        if (preResult) {

            // name can come as an object with first- and lastname
            if (typeof value === "object") {
                name = displayName(value.first, value.last);
            } else {
                name = value;
            }

            // remove white spaces
            name = name.replace(/\s/g, "");

            if (name.length < 3) {
                utils.defer(callback, false, errMsgs.name_to_short);
            } else {
                utils.defer(callback, true);
            }

        } else {

            // build-in validation has failed
            utils.defer(callback, false, preMesssage);
        }
    };

    superNameValidateInput.call(this, data, myCallback);
};

/**
 * Overwrite validation of field "roles".
 */
Users.fields.roles.validateInput = function (data, callback) {
    var value = this.getValueFromData(data);

    var tester = function (pIdArray, pListName, pFilters, pCallback) {
        var anId = pIdArray.pop();
        var aList = keystone.list(pListName);

        aList.model.find()
            .where("_id", anId)
            .exec(function (err, records) {

                // CastError most probably is when ID does not exist
                if (err) {
                    if (err.name === "CastError") {

                        // we need to output the error response here, because Mongoose model will encapsulate
                        // the error so that we cannot react in error handling in middleware
                        utils.defer(pCallback, false, "CastError for id:'" + anId + "'");
                    } else {
                        utils.defer(pCallback, false, "Unexpected problem while checking record for id:" + anId + ". Error: " + err);
                    }
                } else {
                    if (records && records.length > 0) {
                        var passedFilter = true;
                        var strFilterCondition;
                        for (var key in pFilters) {
                            strFilterCondition = key + " = " + pFilters[key];
                            if (records[0][key] + "" !== pFilters[key] + "") {
                                passedFilter = false;
                                break;
                            }
                        }
                        if (passedFilter) {
                            if (pIdArray.length > 0) {
                                tester(pIdArray, pListName, pFilters, pCallback)
                            } else {
                                utils.defer(pCallback, true);
                            }
                        } else {
                            utils.defer(pCallback, false, Base.model.formatString(errMsgs.guest_role_not_allowed));
                        }

                    } else {
                        utils.defer(pCallback, false, Base.model.formatString(errMsgs.no_record_found_for_id, pListName, anId));
                    }
                }

            });
    }

    if (value) {
        var ids = value.split(',');
        var listName = Users.fields.roles.options.ref;
        var filters = Users.fields.roles.options.filters;

        tester(ids, listName, filters, callback);
    } else {
        utils.defer(callback, true);
    }

};

Users.schema.path('roles').set(function (newVal) {

    // We keep the roles in "origRoles" to know whether or not
    // a user had the administator role before the roles were changed.
    this.origRoles = this.roles;

    return newVal;
});

Users.schema.method('isAdmin', function (isAdminCallback, forceUseNewValues) {
    var me = this;
    var Roles = keystone.list('roles');
    var rolesToUse;

    // in case we want to know the user is admin
    // before an update we concider the "origRoles" 
    // which were kept by the setter on "roles".
    if (forceUseNewValues) {
        rolesToUse = me.roles
    } else {
        rolesToUse = me.origRoles || me.roles;
    }

    // check the connected roles if one of them is the adminRole
    Roles.model.find()
        .where('_id')
        .in(rolesToUse)
        .exec(function (err, connectedRoles) {
            for (var i = 0; i < connectedRoles.length; i++) {
                var iRole = connectedRoles[i];

                if (iRole.isAdminRole) {
                    isAdminCallback(true, iRole._id);
                    return;
                }
            }
            isAdminCallback(false);
        });

});

Users.schema.method('isTheOnlyAdmin', function (isTheOnlyAdminCallback) {
    var me = this;

    // first we check whether this user is an admin at all...
    me.isAdmin(function (isAdmin, adminRoleId) {
        if (isAdmin) {

            // ... if yes, we check all other users having the adminRole.
            Users.model.find()
                .where('roles')
                .in([adminRoleId])
                .exec(function (err, adminUsers) {
                    var isTheOnlyAdmin = true;

                    // in case the is one different from this user we know
                    // this user in not the only administrator
                    for (var i = 0; i < adminUsers.length; i++) {
                        var iAdminUser = adminUsers[i];
                        if (iAdminUser._id.toString() !== me._id.toString()) {
                            isTheOnlyAdmin = false;
                        }
                    }
                    isTheOnlyAdminCallback(isTheOnlyAdmin);
                });
        } else {
            isTheOnlyAdminCallback(false);
        }

    });
});

Users.schema.method('checkKeystoneAccess', function (done) {
    var me = this;

    // if user was changed, we check whether the access to
    // the admin-ui was effected.
    me.isAdmin(function (isAdmin) {
        me.canAccessKeystone = isAdmin;
        done();
    },
        // we force to check against the roles setting after the update
        true);
});

// define hooks on schema (can be disabled by 'hooksAreDisabled' )
Users.schema.pre('save', true, function (next, done) {
    if (keystone.get('hooksAreDisabled')) {
        next();
        done();
    } else {
        var me = this;
        next();
        me.isTheOnlyAdmin(function (isTheOnlyAdmin) {
            if (isTheOnlyAdmin) {
                var Roles = keystone.list('roles');
                Roles.model.find()
                    .where('_id')
                    .in(me.roles)
                    .exec(function (err, connectedRoles) {
                        var stillHasAdminRole = false;
                        for (var i = 0; i < connectedRoles.length; i++) {
                            var iRole = connectedRoles[i];

                            // if there was a role deleted which is not 
                            // the admin-role we have no problem.
                            if (iRole.isAdminRole) {
                                stillHasAdminRole = true;
                            }
                        }
                        if (!stillHasAdminRole) {
                            done(Users.model.createCustomError(Users, "cannot_drop_role_of_last_remaining_admin"));
                        } else {
                            // in case of success check to switch access to admin-ui
                            me.checkKeystoneAccess(done);
                        }
                    });
            } else {
                // in case of success check to switch access to admin-ui
                me.checkKeystoneAccess(done);
            }
        });
    }
});

// define hooks on schema (can be disabled by 'hooksAreDisabled' )
Users.schema.pre('remove', true, function (next, done) {
    if (keystone.get('hooksAreDisabled')) {
        next();
        done();
    } else {
        var me = this;
        next();
        me.isTheOnlyAdmin(function (isTheOnlyAdmin) {
            if (isTheOnlyAdmin) {
                done(Users.model.createCustomError(Users, "cannot_delete_all_admins"));
            } else {
                done();
            }
        });
    }
});

Users.register();