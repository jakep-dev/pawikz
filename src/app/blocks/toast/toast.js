(function() {
    'use strict';

    angular
            .module('blocks.toast')
        .factory('toast', toast);

    /* @ngInject */
    function toast($mdToast, $document) {
        var service = {
            simpleToast: simpleToast,
            actionToast: actionToast,
            customToast: customToast
        }

        return service;


        //Simple Toast
        function simpleToast(message, duration)
        {
            var getToastPosition = configureToast();
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position(getToastPosition)
                    .hideDelay(duration || 3000)
            );
        }

        //Action Toast
        function actionToast(message)
        {
            var getToastPosition = configureToast();
            var toast = $mdToast.simple()
                .content(message)
                .action('OK')
                .highlightAction(false)
                .position(getToastPosition)
                .hideDelay(300000);

            $mdToast.show(toast).then(function(response) {

            });
        }

        //Custom Toast
        //Config needs to be passed.
        //config = { controller: '', url: '', hideDelay:'', toastElement:''}
        function customToast(config)
        {
            var getToastPosition = configureToast();
            $mdToast.show({
                controller: config.controller,
                templateUrl: config.url,
                hideDelay: config.hideDelay,
                position: getToastPosition
            });
        }


        //Configure Toast Position
        function configureToast()
        {
            var last = {
                bottom: true,
                top: false,
                left: false,
                right: true
            };

            var toastPosition = angular.extend({},last);

            var getToastPosition = function() {
                sanitizePosition();

                return Object.keys(toastPosition)
                    .filter(function(pos) { return toastPosition[pos]; })
                    .join(' ');
            };


            function sanitizePosition() {
                var current = toastPosition;

                if ( current.bottom && last.top ) current.top = false;
                if ( current.top && last.bottom ) current.bottom = false;
                if ( current.right && last.left ) current.left = false;
                if ( current.left && last.right ) current.right = false;

                last = angular.extend({},current);
            }

           var toastPos = getToastPosition();

           return toastPos;
        }
    }
}());
