var keystone = require('keystone'),
	Base = keystone.list('base');

const permissionValue = "all";


exports = module.exports = function (req, res) {
	var params = req.params[0];
	var aListName = params.split('/')[0];
	var anId = params.split('/')[1];
	var aCollection = Base.model.retrieveClassForListName(aListName, req, res);

	if (aCollection) {
		// use central method on base-list to check whether or not
		// the current user has access to the requested resource
		aCollection.model.checkPermission(req.user, 2, // Read
			aListName, permissionValue, function (httpResultCode) {
				if (httpResultCode !== 200) {
					res.sendStatus(httpResultCode);
				} else {
					if (anId !== undefined && anId.length > 0) {
						aCollection.model.find()
							.where('_id', anId)
							.exec(function (err, records) {

								// CastError most probably is when ID does not exist
								if (err && err.name !== "CastError") {

									// we need to output the error response here, because Mongoose model will encapsulate
									// the error so that we cannot react in error handling in middleware
									Base.model.outputInternalError(err, req, res);
									throw new Error("Unexpected problem while requesting one " + aListName + " for VIEW. Error: " + err);
								} else {
									if (records && records.length > 0) {
										res.status(200).json(Base.model.structuredJsonResponse(true, records));
									} else {
										res.status(404).json(Base.model.structuredJsonResponse(false,
											Base.model.structuredErrorObjects(Base, [{ id: "no_records_for_id", args: [anId] }])
										));
									}
								}
							});
					} else {
						aCollection.model.find()
							.exec(function (err, records) {
								if (err) {

									// we need to output the error response here, because Mongoose model will encapsulate
									// the error so that we cannot react in error handling in middleware
									Base.model.outputInternalError(err, req, res);
									throw new Error("Unexpected problem while requesting all " + aListName + " for VIEW. Error: " + err);
								} else {
									res.status(200).json(Base.model.structuredJsonResponse(true, records));
								}
							});
					}
				}
			});
	}


};