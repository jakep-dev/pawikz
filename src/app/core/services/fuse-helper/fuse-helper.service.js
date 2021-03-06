(function ()
{
    'use strict';

    angular
        .module('app.core')
        .factory('fuseHelper', fuseHelperService);

    /** @ngInject */
    function fuseHelperService(deviceDetector)
    {
        // Private variables
        var mobileDetect = new MobileDetect(window.navigator.userAgent);

        var service = {
            isMobile: isMobile,
            isIE: isIE,
            isIECheck: isIECheck
        };

        return service;

        //////////

        /**
         * Return if current device is a
         * mobile device or not
         */
        function isMobile()
        {
            return mobileDetect.mobile();
        }

        function isIE()
        {
            return (deviceDetector.browser &&
            (deviceDetector.browser.toLowerCase() === 'ie') );
        }

        function isIECheck(){
            var isIe = ((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ));
            return isIe;
        }
    }
}());