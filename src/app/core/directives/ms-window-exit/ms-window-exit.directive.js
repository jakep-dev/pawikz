(function () {
    'use strict';

    angular.module('app.core')
            .directive('msWindowExit', function($window, $state, authBusiness, overviewBusiness, templateBusiness, clientConfig) {
                return {
                    restrict: 'AE',
                    link: function(element, attrs){
                        if($state.current.name != 'app.pages_auth_login') {
                            var myEvent = $window.attachEvent || $window.addEventListener,
                                chkevent = $window.attachEvent ? 'onunload' : 'unload'; /// make IE7, IE8 compatable

                            myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                                clientConfig.socketInfo.socket.disconnect();
                            });
                        }
                    }
                };
            });
})();


