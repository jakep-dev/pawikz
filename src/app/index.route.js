(function ()
{
    'use strict';

    angular
        .module('advisen')
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/pages/auth/login');

        var isIe = ((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ));

        $stateProvider
            .state('app', {
                abstract: true,
                views   : {
                    'main@'         : {
                        templateUrl: isIe ?  'app/core/layouts/default-no-animation.html' : 'app/core/layouts/default.html'
                    },
                    'toolbar@app': {
                        templateUrl: 'app/toolbar/toolbar.html',
                        controller : 'ToolbarController as vm'
                    },
                    'navigation@app': {
                        templateUrl: 'app/sidenav/navigation/navigation.html',
                        controller : 'NavigationController as vm'
                    },
                    'breadcrumb@app': {
                      templateUrl: 'app/breadcrumb/breadcrumb.html',
                      controller : 'BreadcrumbController as vm'
                    }
                }
            });
    }
})();
