var keystone = require('keystone');

keystone.set('usersLocalisations', {
    listOptions: {
        label: "User",
        plural: "Users",
        singular: "User"
    },
    fieldLabels: {
        name: {
            label: "Name"
        },
        email: {
            label: "e-mail-address"
        },
        password: {
            label: "Password"
        },
        roles: {
            label: "Groups"
        },
        canAccessKeystone: {
            label: "Acess of the Admin-UI"
        }
    },
    errorMessages: {
        cannot_delete_all_admins: "This user is the last remaining administrator and cannot be deleted.",
        cannot_delete_current_user: "Refusing to delete users item; id is current User id.",
        cannot_drop_role_of_last_remaining_admin: "This user is the only administrator. You need to add at least one other user to the admin-group before you leave it."
    }
});



