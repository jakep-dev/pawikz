(function () {
    'use strict';

    angular.module('app.core')
            .directive('msWindowExit', function($window, authBusiness) {
                return {
                    restrict: 'AE',
                    link: function(element, attrs){
                        var myEvent = $window.attachEvent || $window.addEventListener,
                            chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload', /// make IE7, IE8 compatable
                            chkunload = $window.attachEvent ? 'onunload' : 'unload';

                        myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                            var confirmationMessage = ' ';  // a space
                            (e || $window.event).returnValue = "Are you sure that you'd like to close the browser?";

                            return confirmationMessage;
                        });

                        myEvent(chkunload, function (e) { // For >=IE7, Chrome, Firefox
                            var confirmationMessage = ' ';  // a space
                            (e || $window.event).returnValue = "Are you sure that you'd like to close the browser?";

                            authBusiness.logOut();
                            return confirmationMessage;
                        });
                    }
                };
            });
})();


