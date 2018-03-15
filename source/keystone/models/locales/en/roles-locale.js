var keystone = require('keystone');

keystone.set('rolesLocalisations', {
    listOptions: {
        label: "Group",
        plural: "Groups",
        singular: "Group"
    },
    fieldLabels: {
        name: {
            label: "Name of group",
            note: "Speaking title of the group"
        },
        description: {
            label: "Description",
            note: "Detailed description what kind of users this group contains."
        },
        isAdminRole: {
            label: "is the system-group 'Admin'",
            note: "technical field, which declares users of this group as system administrator."
        },
        isGuestRole: {
            label: "is the system-group 'Guest'",
            note: "technical field. Permissions that have this group assigned are granted even to visitors of the website which are not authenticated."
        }
    },
    errorMessages : {
        cannot_delete_systemrole: "The group '{0}' is a system-group and cannot be deleted.",
        role_is_assigned_to_user: "The group '{0}' contains {1} users(s). Prior deletion all members of this group must be moved to other groups.",
        role_is_assigned_to_permission: "The group '{0}' is assigned to {1} permission(s). Prior deletion this assignments must be removed.",
    }
});



