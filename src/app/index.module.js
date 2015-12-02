(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Blocks
            'app.blocks',

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

            // Overview
            'app.overview',

            // Feedback
            'app.pages.feedback',

            // Blank
            'app.pages.blank'
        ]);
})();
