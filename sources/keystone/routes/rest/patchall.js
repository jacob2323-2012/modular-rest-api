var keystone = require('keystone'),
	Base = keystone.list('base');

const permissionValue = "all";


exports = module.exports = function (req, res) {
	var params = req.params[0];
	var aListName = params.split('/')[0];
	var anId = params.split('/')[1];
	var aCollection = Base.model.retrieveClassForListName(aListName, req, res);
	var currentUser = req.user;

	if (aCollection) {

		// use central method on base-list to check whether or not
		// the current user has access to the requested resource
		aCollection.model.checkPermission(currentUser, 3, // Update
			aListName, permissionValue, function (httpResultCode) {
				if (httpResultCode !== 200) {
					res.sendStatus(httpResultCode);
				} else {
					if (anId !== undefined && anId.length > 0) {

						aCollection.model.findById(anId, function (err, record) {

							// CastError most probably is when ID does not exist
							if (err && err.name !== "CastError") {

								// we need to output the error response here, because Mongoose model will encapsulate
								// the error so that we cannot react in error handling in middleware
								Base.model.outputInternalError(err, req, res);
								throw new Error("Unexpected Problem while requesting one " + aListName + " for PATCH. Error: " + err);
							} else {
								if (record) {
									aCollection.updateItem(record, req.body, {}, function (err2) {
										if (err2) {
											console.log('err2:');
											console.log(err2.detail.custom);

											if (err2.detail.custom) {
												res.status(400).json(Base.model.structuredJsonResponse(false,
													Base.model.structuredErrorObjects(aCollection, [{ id: err2.detail.id, args: [err2.detail.args] }])
												));
											} else {
												// we need to output the error response here, because Mongoose model will encapsulate
												// the error so that we cannot react in error handling in middleware
												Base.model.outputInternalError(err2, req, res);
												throw new Error("Unexpected problem while requesting one " + aListName + ". " + err2);
											}
										} else {
											res.status(200).json(Base.model.structuredJsonResponse(true, record));
										}
									});
								} else {
									res.status(404).json(Base.model.structuredJsonResponse(false,
										Base.model.structuredErrorObjects(Base, [{ id: "no_records_for_id", args: [anId] }])
									));
								}
							}
						});
					} else {
						// Not allowed to update all records at once.
						res.status(400).json(Base.model.structuredJsonResponse(false,
							Base.model.structuredErrorObjects(Base, ["not_allowed_to_update_all_records_at_once"])
						));
					}
				}
			});
	}
};