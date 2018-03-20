var keystone = require('keystone');

keystone.set('permissionsLocalisations', {
    listOptions: {
        label: "Berechtigungen",
        plural: "Berechtigungen",
        singular: "Berechtigung"
    },
    fieldLabels: {
        name: {
            label: "Beschreibung"
        },
        category: {
            label: "Kategorie",
            note: "Berechtigungen kommen an verschiedenen Stellen zum Einsatz. Zum Beispiel im Beriech der Datenzugriffskontrolle oder der Layoutkonfiguration."
        },
        subject: {
            label: "Berechtigung für:",
            note: "Technisches Feld, was dem System die Möglichkeit gibt es eine Datenklasse oder einem Softwaremodule zuzuordnen."
        },
        operation: {
            label: "Operation",
            note: "Numerischer Identifikatior für welche Aktion die Berechtigung gilt."
        },
        value: {
            label: "Wert",
            note: "Abhängig von der Operation gibt es unterschiedliche gültige Werte, welche durch das System gesetzt werden."
        },
        roles: {
            label: "Zugeordnete Rollen",
            note: "Dieses Feld enthält alle Rollen, denen diese Berechtigung erteilt wird. Benutzer mit der System-Rolle 'Administrator' haben automatisch alle Berechtigungen und können hier nicht entfernt werden."
        }

    },
    categories: ["",
        "Datenzugriffskontrolle",
        "Layoutkonfiguration"
    ],
    operations: ["",
        "Erstellen",
        "Lesen",
        "Aktualisieren",
        "Löschen",
        "Filtern"
    ],
    errorMessages : {
        role_must_use_admin_role: "Die Änderungen wurden nicht gespeichert! Grund: Die Berechtigung muss zumindest die Admin-Rolle beinhalten."
    }
});



