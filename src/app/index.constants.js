(function ()
{
    'use strict';

    angular
        .module('fuse')
        .constant('autoSaveFeature',{
            timeOut: 10000
        })
        .constant('dev-config',{
            security:
            {
                protocol:'http',
                ipAddress: 'localhost',
                port:'3000'
            }
        });
})();
