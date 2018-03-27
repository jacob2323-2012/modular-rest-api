var keystone = require('keystone'),
	Base = keystone.list('base');

const permissionValue = "all";


exports = module.exports = function (req, res) {
	var params = req.params[0];
	var aListName = params.split('/')[0];
	var aCollection = Base.model.retrieveClassForListName(aListName, req, res);
	var currentUser = req.user;

	if (aCollection) {

		// use central method on base-list to check whether or not
		// the current user has access to the requested resource
		aCollection.model.checkPermission(currentUser, 1, // Create
			aListName, permissionValue, function (httpResultCode) {
				if (httpResultCode !== 200) {
					res.sendStatus(httpResultCode);
				} else {
					var record = new aCollection.model(req.body);
					record.save(function (err) {
						// post has been saved	
						if (err) {
							if (err.custom) {
								res.status(400).json(Base.model.structuredJsonResponse(false,
									Base.model.structuredErrorObjects(aCollection, [err])
								));
							} else {
								// we need to output the error response here, because Mongoose model will encapsulate
								// the error so that we cannot react in error handling in middleware
								Base.model.outputInternalError(err, req, res);
								throw new Error("Unexpected problem while requesting one " + aListName + " for POST. " + err);
							}
						} else {
							res.status(200).json(Base.model.structuredJsonResponse(true, [record]));
						}
					});
				}
			});
	}
};