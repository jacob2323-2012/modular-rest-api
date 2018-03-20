var keystone = require('keystone');

const LOCALISATION_KEY = 'baseLocalisations'; 

var Base = new keystone.List('base', {
    hidden: true
});

// get localised texts from xyz-locale.js file 
var texts = keystone.get(LOCALISATION_KEY);
Base.schema.static('locales', function (errorIds) {
    return keystone.get(LOCALISATION_KEY);
});

Base.schema.statics.formatString = function (stringToFormat, variables) {
    var aResult = stringToFormat;
    for (var i in variables) {
        var aPattern = "{" + i + "}";
        var aResult = aResult.split(aPattern).join(variables[i]);
    }
    return aResult;
};

Base.schema.statics.createPermissions = function (listName, roles) {
    var aListCollection = keystone.list(listName);
    var messages = texts.messages;
    var retVal = [{
        name: aListCollection.label + '. ' + messages.read_own_content + '.',
        category: 1, // 'Data Access Control'
        subject: listName,
        operation: 2, //'Read'
        value: 'my',
        roles: roles
    }, {
        name: aListCollection.label + '. ' + messages.read_any_content + '.',
        category: 1, // 'Data Access Control'
        subject: listName,
        operation: 2, //'Read'
        value: 'all',
        roles: roles
    }];

    if (!aListCollection.options.nocreate) {
        retVal = retVal.concat([{
            name: aListCollection.label + '. ' + messages.create_content + '.',
            category: 1, // 'Data Access Control'
            subject: listName,
            operation: 1, //'Create'
            value: 'all',
            roles: roles
        }]);
    }

    if (!aListCollection.options.noedit) {
        retVal = retVal.concat([{
            name: aListCollection.label + '. ' + messages.edit_own_content + '.',
            category: 1, // 'Data Access Control'
            subject: listName,
            operation: 3, //'Update'
            value: 'my',
            roles: roles
        }, {
            name: aListCollection.label + '. ' + messages.edit_any_content + '.',
            category: 1, // 'Data Access Control'
            subject: listName,
            operation: 3, //'Update'
            value: 'all',
            roles: roles
        }]);
    }

    if (!aListCollection.options.nodelete) {
        retVal = retVal.concat([{
            name: aListCollection.label + '. ' + messages.delete_own_content + '.',
            category: 1, // 'Data Access Control'
            subject: listName,
            operation: 4, //'Delete'
            value: 'my',
            roles: roles
        }, {
            name: aListCollection.label + '. ' + messages.delete_any_content + '.',
            category: 1, // 'Data Access Control'
            subject: listName,
            operation: 4, //'Delete'
            value: 'all',
            roles: roles
        }]);
    }

    return retVal;
};

Base.schema.statics.checkPermission = function (pUser, pOperation, pListName, pPermissionValue, callback) {
    var aPermissionColl = keystone.list('permissions');

    // We start at the permission side and filter 
    // for all given parameters
    aPermissionColl.model.find()
        .where('category', 1) // DataAccessControl
        .where('subject', pListName)
        .where('operation', pOperation)
        .where('value', pPermissionValue)
        .exec(function (err, permissions) {
            if (permissions.length === 0) {

                // In case a list is created with option 'nocreate', 'nodelete' etc.
                // there will be no permission record for these kind of actions.
                // Even the administator cannotperform these actions. 
                // They are generally forbidden.
                callback(403);
            }
            else {
                // by data model there can be only one
                // permission for category / subject / operation / value
                var aFoundPermission = permissions[0];

                // Now we seach the role records connected to the 
                // found permission record.
                var aRoleColl = keystone.list('roles');
                aRoleColl.model.find()
                    .where('_id')
                    .in(aFoundPermission.roles)
                    .exec(function (err, roles) {
                        var aRolesIdList = [];

                        // Quick exit for guest-role.
                        // This permission grants access for everyone, even
                        // users which are not authenticated.
                        for (var i = 0; i < roles.length; i++) {
                            if (roles[i].isGuestRole) {
                                callback(200);
                                return;
                            }
                            aRolesIdList.push(roles[i]._id);
                        }

                        // Quick exit for not authenticated users
                        // As the roles we check are not for guests, we
                        // can return status "unauthorized" here, when no user is logged in (guest)
                        if (!pUser) {
                            callback(401);
                            return;
                        }

                        // as a third step we request from users to
                        // find those who hold the relevant roles.
                        var aUserColl = keystone.list('users');
                        aUserColl.model.find()
                            .where('roles')
                            .in(aRolesIdList)
                            .exec(function (err, users) {
                                for (var i = 0; i < users.length; i++) {
                                    if (pUser._id.toString() === users[i]._id.toString()) {
                                        callback(200);
                                        return;
                                    }
                                }
                                // If user is logged in, but hasn't got the right role
                                // he is not authorized.
                                callback(401);
                            });
                    });
            }
        });
};

// central method to detect records for /rest/my/...
Base.schema.static('findMine', function (pUserId, pKey, pCallback) {
    pCallback(new Error("model.findMine is not defined."), undefined);
});

/**
 * Central method to write response as json with success-flag etc.
 */
Base.schema.static('structuredJsonResponse', function (success, data, total, offset, limit) {
    var retVal = {};

    retVal.success = success;
    retVal.total = total || (data && data.length ? data.length : 0);
    retVal.offset = offset || 0;
    retVal.limit = limit || -1;
    retVal.data = data || []

    return retVal;
});


Base.schema.static('structuredErrorObjects', function (list, errorDetails) {
    var retVal = [];
    var msgs = list.model.locales().errorMessages;

    for (var i = 0; i < errorDetails.length; i++) {
        if (typeof errorDetails[i] === "string") {
            retVal.push({
                errorId: errorDetails[i],
                errorMsg: msgs && msgs[errorDetails[i]] ? msgs[errorDetails[i]] : errorDetails[i]
            });
        } else {
            if (errorDetails[i].id) {
                var anErrId = errorDetails[i].id;
                var errorArgs = errorDetails[i].args || [];
                var errorObj = {
                    errorId: anErrId,
                    errorMsg: msgs && msgs[anErrId] ? Base.model.formatString(msgs[anErrId], errorArgs) : anErrId
                };
                var debug_mode = keystone.get('debug_mode');
                if (debug_mode) {
                    errorObj.trace = errorDetails[i].trace || undefined;
                }

                retVal.push(errorObj);
            } else {
                throw new Error("Cannot identify error");
            }
        }

    }
    return retVal;
});

Base.schema.static('outputInternalError', function (err, req, res) {
    var errorUuid = Base.model.generateUuid();

    console.error(new Date() + " - ID:" + errorUuid);
    console.error("Error requesting " + req.originalMethod + " from " + req.originalUrl);

    res.status(500).json(Base.model.structuredJsonResponse(false,
        Base.model.structuredErrorObjects(Base, [{
            id: "request_failed_due_to_internal_error", args: [errorUuid], trace: [err]
        }])
    ));
});

Base.schema.static('createCustomError', function (list, errorId, args) {
    var msgs = list.model.locales().errorMessages;
    var msgText = msgs && msgs[errorId] ? list.model.formatString(msgs[errorId], args) : errorId
    var anErr = new Error(msgText);
    anErr.custom = true;
    anErr.id = errorId
    anErr.args = args;
    return anErr;
});


Base.schema.static('generateUuid', function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
});


Base.schema.static('retrieveClassForListName', function (listName, req, res) {
    var errorGettingList;
    var aCollection;

    try {
        aCollection = keystone.list(listName);
    } catch (err) {
        errorGettingList = err;
    }

    // if no collection set or error occured during loading collection
    if (errorGettingList || !aCollection) {

        // when aCollection was empty but no error occured we create an unknown-error.
        errorGettingList = errorGettingList || new Error("List '" + listName + "' undefined by unknown reason.");

        if ((errorGettingList.name === "ReferenceError"
            && errorGettingList.message.indexOf("Unknown keystone list") === 0)) {
            res.status(404).json(Base.model.structuredJsonResponse(false,
                Base.model.structuredErrorObjects(Base, [{ id: "unknown_keystone_list", args: [listName] }])
            ));
        } else {

            // as there seem to be other problems then an unknown listname, we forward the error to be handled
            // by error handling in middleware.
            throw errorGettingList;
        }
    }

    return aCollection;
});


Base.register();
