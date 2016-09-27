(function () {
    'use strict';

    angular.module('app.core')
            .directive('msWindowExit', function($window, $state, authBusiness, overviewBusiness, templateBusiness) {
                return {
                    restrict: 'AE',
                    link: function(element, attrs){
                        if($state.current.name != 'app.pages_auth_login') {
                            var myEvent = $window.attachEvent || $window.addEventListener,
                                chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload', /// make IE7, IE8 compatable
                                chkunload = $window.attachEvent ? 'onunload' : 'unload';

                            myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                                overviewBusiness.save();
                                templateBusiness.save();
                                templateBusiness.saveTable();
                                templateBusiness.saveHybridTable();
                                console.log('Inside');
                            });

                            myEvent(chkunload, function (e) { // For >=IE7, Chrome, Firefox
                                authBusiness.logOut();
                            });
                        }
                    }
                };
            });
})();


