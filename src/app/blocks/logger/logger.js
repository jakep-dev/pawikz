(function() {
    'use strict';

    angular
            .module('blocks.logger')
        .factory('logger', logger);

    logger.$inject = ['$log', '$mdToast', '$document'];
    /* @ngInject */
    function logger($log, $mdToast, $document) {
        var service = {
            simpleToast: simpleToast,
            actionToast: actionToast,
            customToast: customToast,

            // straight to console; bypass toastr
            log     : $log.log
        }

        return service;


        //Simple Toast
        function simpleToast(message, data, type)
        {
            var getToastPosition = configureToast();
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position(getToastPosition)
                    .hideDelay(3000)
            );
            logMessage(message, data, type);
        }

        //Action Toast
        function actionToast(message, data, type)
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

            logMessage(message, data, type);
        }

        //Custom Toast
        //Config needs to be passed.
        //config = { controller: '', url: '', hideDelay:'', toastElement:''}
        function customToast(message, data, type, config)
        {
            var getToastPosition = configureToast();
            $mdToast.show({
                controller: config.controller,
                templateUrl: config.url,
                parent : $document[0].querySelector('#' + config.toastElement),
                hideDelay: config.hideDelay,
                position: getToastPosition
            });

            logMessage(message, data, type);
        }

        //Log Message
        function logMessage(message, data, type)
        {
            switch(type)
            {
                case 'info':
                    $log.info('Info: ' + message, data);
                    break;
                case 'warn':
                    $log.warn('Warn: ' + message, data);
                    break;

                case 'error':
                    $log.error('Error: ' + message, data);
                    break;
                case 'success':
                    $log.info('Success: ' + message, data);
                    break;
                default:
                    $log.info('Info: ' + message, data);
                    break;
            }
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
