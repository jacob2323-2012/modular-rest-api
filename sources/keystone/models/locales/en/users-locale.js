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
        cannot_drop_role_of_last_remaining_admin: "This user is the only administrator. You need to add at least one other user to the admin-group before you leave it.",
        eMail_to_short: "eMail to short.",
        eMail_to_long: "eMail to long.",
        name_to_short: "Name must have at least 3 characters.",
        guest_role_not_allowed: "The Guest-Role cannot be applied to a user.",
        no_record_found_for_id: "No {0}-record found for id:'{1}'"
      
    }
});



