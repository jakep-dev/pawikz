(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Breadcrumb
            'app.breadcrumb',

            // Dashboards
            'app.dashboards',

            // Feedback
            'app.pages.feedback'
        ]);
})();
