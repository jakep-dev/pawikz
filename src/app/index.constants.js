(function ()
{
    'use strict';

    angular
        .module('fuse')
        .constant('clientConfig',{
            security:
            {
                protocol:'http:',
                ipAddress: 'localhost',
                port:'3000'
            },
            endpoints:
            {
                dashboardEndPoint:{
                    get: '/api/dashboard',
                    getUsers: '/api/users/',
                    getCompanies: '/api/companies/'
                },
                overViewEndPoint:{
                    get: '/api/overview/',
                    save: '/api/saveOverview'
                },
                chartEndPoint:{
                    get: ''
                },
                authEndPoint:
                {
                    auth:'/api/authenticate/',
                    logout: '/api/logout',
                    getUser: '/api/userInfo'
                },
                templateEndPoint:
                {
                    schema: '/api/schema',
                    mnemonics: '/api/mnemonics',
                    save: '/api/saveTemplate'
                },
                loggerEndPoint:
                {
                    error: '/api/errorLog',
                    debug: '/api/debugLog'
                }
            },
            appSettings:
            {
                autoSaveTimeOut: 10000,
            }
        });
})();
