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

            // Data
            'app.data',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Breadcrumb
            'app.breadcrumb',

            // Bottomsheet
            'app.bottomsheet',

            // Dashboards
            'app.dashboards',

            // Overview
            'app.overview',

            // Pages
            'app.pages',

            // Components
            'app.components'
        ]);
})();
