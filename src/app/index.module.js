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

            // Blocks
            'app.blocks',

            // Business
            'app.business',

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
            'app.dashboard',

            // Overview
            'app.overview',

            // Steps
            'app.steps',

            // Pages
            'app.pages',

            // Components
            'app.components'
        ]);
})();
