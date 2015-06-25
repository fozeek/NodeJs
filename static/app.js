$(document).ready(function() {
    $('#upload').on('click', function() {
        $('#form input[type="file"]').trigger('click');
    });

    $('#form input[type="file"]').on('change', function() {
        $('#form').submit();
    });

    $('#submit-folder').on('click', function() {
        $('#folder input').val($('#name-folder').val());
        $('#folder').submit();
    });
});
    