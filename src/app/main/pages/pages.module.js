(function ()
{
    'use strict';

    angular
        .module('app.pages', [
            'app.pages.auth.login',
            'app.pages.blank',
            'app.pages.feedback',
            'app.pages.error-500',
            'app.pages.error-404'
        ]);

})();