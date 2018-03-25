var keystone = require('keystone');

keystone.set('baseLocalisations', {
    messages : {
        read_own_content: "View own content",
        read_any_content: "View any content",
        edit_own_content: "Edit own content",
        edit_any_content: "Edit any content",
        create_content: "Create new content",
        delete_own_content: "Delete own separate content",
        delete_any_content: "Delete any separate content"
    },
    errorMessages: {
        credentials_not_complete: "The provided credentials where not complete.",
        credentials_not_correct: "The provided credentials where not correct.",
        unknown_keystone_list: "The requested list '{0}' is unknown.",
        request_failed_due_to_internal_error: "The request failed due to an internal server problem (ID: {0}).",
        no_records_for_id: "No record found for ID '{0}'.",
        not_allowed_to_delete_all_records_at_once: "Refuse to delete all records at once. ID must be given to delete a single record.",
        not_allowed_to_update_all_records_at_once: "Refuse to update all records at once. ID must be given to update a single record."
    }
});



