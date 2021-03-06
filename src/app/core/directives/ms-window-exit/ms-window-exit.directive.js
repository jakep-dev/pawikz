(function () {
    'use strict';

    angular.module('app.core')
        .directive('msWindowExit', function ($window, $state, $cookies, clientConfig) {
            return {
                restrict: 'AE',
                link: function(element, attrs){
                    if($state.current.name != 'app.pages_auth_login') {
                        var myEvent = $window.attachEvent || $window.addEventListener,
                            chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload',
                            chkunload = $window.attachEvent ? 'onunload' : 'unload';/// make IE7, IE8 compatable

                        myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                            for (var x in $cookies) { $cookies.remove(x); }
                            $window.localStorage.clear();
                            $window.sessionStorage.clear();
                            clientConfig.socketInfo.socket.emit('client-disconnect', clientConfig.socketInfo.context);
                            clientConfig.socketInfo.socket.disconnect();
                        });

                        myEvent(chkunload, function (e) { // For >=IE7, Chrome, Firefox
                            for (var x in $cookies) { $cookies.remove(x); }
                            $window.localStorage.clear();
                            $window.sessionStorage.clear();
                            clientConfig.socketInfo.socket.emit('client-disconnect', clientConfig.socketInfo.context);
                            clientConfig.socketInfo.socket.disconnect();
                        });
                    }
                }
            };
        });
})();
