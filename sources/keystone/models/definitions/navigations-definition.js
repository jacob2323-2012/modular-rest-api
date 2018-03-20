var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Navigations = new keystone.List('navigations', {
    hidden: true
}
);

Navigations.add({
    menu: { type: Types.Text, required: true, initial: true },
    listName: { type: Types.Text, required: true, initial: true }
});

Navigations.defaultColumns = 'menu, listName';

Navigations.schema.static('applyYourselfToKeystoneNav', function () {
    Navigations.model.find()
        .exec(function (err, navigationsRecs) {
            var navObject = {};
            for (var i = 0; i < navigationsRecs.length; i++) {
                var iNavigationsRec = navigationsRecs[i];
                if (navObject[iNavigationsRec.menu] !== undefined) {
                    navObject[iNavigationsRec.menu].push(iNavigationsRec.listName);
                } else {
                    navObject[iNavigationsRec.menu] = [iNavigationsRec.listName];
                }
            }

            keystone.set('nav', navObject);
        });
});

Navigations.register();