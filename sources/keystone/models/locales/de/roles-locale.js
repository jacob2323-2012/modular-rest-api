var keystone = require('keystone');

keystone.set('rolesLocalisations', {
    listOptions: {
        label: "Rollen",
        plural: "Rollen",
        singular: "Rolle"
    },
    fieldLabels: {
        name: {
            label: "Rollenname",
            note: "Aussagekräftige Bezeichnung der Rolle"
        },
        description: {
            label: "Beschreibung",
            note: "Detailierte Beschreibung, welche Benutzergruppe diese Rolle beschreibt, was besondere Eigenschaften und Verantwortungsbereiche sind."
        },
        isAdminRole: {
            label: "ist die Systemrolle 'Admin'",
            note: "technisches Feld, die den Besitzer dieser Rolle als Systemadministrator ausweist."
        },
        isGuestRole: {
            label: "ist die Systemrolle 'Gast'",
            note: "technisches Feld, über das Berechtigungen für Anwender ohne Login vergeben werden können. Kein angemeldeter Benutzer kann diese Rolle annehmen."
        }
    },
    errorMessages : {
        cannot_delete_systemrole: "Die Rolle '{0}' ist eine Systemrolle und kann nicht gelöscht werden.",
        role_is_assigned_to_user: "Die Rolle '{0}' ist {1} Benutzer(n) zugeweisen. Vor dem Löschen muss diese Verknüpfung entfernt werden.",
        role_is_assigned_to_permission: "Die Rolle '{0}' wird in {1} Berechtigung(en) verwendet. Vor dem Löschen muss diese Verknüpfung entfernt werden.",
    }
});



