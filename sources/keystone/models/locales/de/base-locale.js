var keystone = require('keystone');

keystone.set('baseLocalisations', {
    messages: {
        read_own_content: "Eigene Inhalte abrufen",
        read_any_content: "Beliebige Inhalte abrufen",
        edit_own_content: "Eigene Inhalte bearbeiten",
        edit_any_content: "Beliebige Inhalte bearbeiten",
        create_content: "Neuen Inhalt erzeugen",
        delete_own_content: "Eigene einzelne Inhalte löschen",
        delete_any_content: "Beliebige einzelne Inhalte löschen"
    },
    errorMessages: {
        credentials_not_complete: "Die Anmeldedaten sind nicht vollständig.",
        credentials_not_correct: "Die Anmeldedaten sind nicht korrekt.",
        unknown_keystone_list: "Die angefragte Liste '{0}' ist nicht bekannt.",
        request_failed_due_to_internal_error: "Die Anfrage schlug wegen eines internen Problems des Servers fehl (ID: {0}).",
        no_records_for_id: "Für die ID '{0}' wurde kein Datensatz gefunden.",
        not_allowed_to_delete_all_records_at_once: "Es ist nicht erlaubt alle Datensätze auf ein Mal zu löschen. Es muss die ID des zu löschenden Datensatzes angegeben werden.",
        not_allowed_to_update_all_records_at_once: "Es ist nicht erlaubt alle Datensätze auf ein Mal zu aktualisieren. Es muss die ID des Datensatzes angegeben werden, welche aktualisiert werden soll."
    }
});



