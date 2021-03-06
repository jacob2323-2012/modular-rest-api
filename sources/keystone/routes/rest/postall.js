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
					var record = new aCollection.model();
					aCollection.updateItem(record, req.body, {
						ignoreNoEdit: true,
						user: req.user,
					}, function (err) {
						if (err) {
							Base.model.handleUpdateItemErrors(aCollection, err, req, res);
						} else {
							res.status(200).json(Base.model.structuredJsonResponse(true, [record]));
						}
					});
				}
			});
	}
};