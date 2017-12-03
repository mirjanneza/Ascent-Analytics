/*global $*/

$(function() {
    $('#log-in-google').on('click', function() {
        window.location.replace('https://ascents.herokuapp.com/auth/google');
    });
});