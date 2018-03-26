var keystone = require('keystone');

keystone.set('usersLocalisations', {
    listOptions: {
        label: "Benutzer",
        plural: "Benutzer",
        singular: "Benutzer"
    },
    fieldLabels: {
        name: {
            label: "Name"
        },
        email: {
            label: "EMail-Adresse"
        },
        password: {
            label: "Passwort"
        },
        roles: {
            label: "Rollen"
        },
        canAccessKeystone: {
            label: "Zugriff auf die Administrationsoberfläche"
        }
    },
    errorMessages: {
        cannot_delete_all_admins: "Dieser Benutzer ist der letzte verbleibende Administrator und kann nicht gelöscht werden.",
        cannot_delete_current_user: "Der Benutzer kann nicht gelöscht werden. Es handelt sich um den aktuellen Benutzer.",
        cannot_drop_role_of_last_remaining_admin: "Diese Benutzer ist der einzige Adminstrator. Geben Sie zunächst einem oder mehreren anderen Benutzern die Admin-Rolle, bevor Sie diese von Ihrem Benutzer entfernen."
    }
});



