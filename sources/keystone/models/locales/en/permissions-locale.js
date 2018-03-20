var keystone = require('keystone');

keystone.set('permissionsLocalisations', {
    listOptions: {
        label: "Permission",
        plural: "Permissions",
        singular: "Permission"
    },
    fieldLabels: {
        name: {
            label: "Description"
        },
        category: {
            label: "Category",
            note: "Permissions are used in various parts of the application. For example to specify data access control atenzugriffskontrolle or layout configuration."
        },
        subject: {
            label: "Berechtigung für:",
            note: "Technisches Feld, was dem System die Möglichkeit gibt es eine Datenklasse oder einem Softwaremodule zuzuordnen."
        },
        operation: {
            label: "Operation",
            note: "Numeric Identifier to define the user action this permission covers."
        },
        value: {
            label: "Value",
            note: "Dependent on the operation there a different valid values. These are set by the system."
        },
        roles: {
            label: "Assigned Groups",
            note: "This permission is granted to all groups listed here. Users of the system-group 'Administrator' have all permissions automaticallyn and cannot be removed from this list."
        }

    },
    categories: ["",
        "Data access control",
        "Layout configuration"
    ],
    operations: ["",
        "Create",
        "View",
        "Edit",
        "Delete",
        "Filter"
    ],
    errorMessages : {
        role_must_use_admin_role: "The changed have not been saved! Reason: At least the admin-group must be assigned to a permission."
    }
});



