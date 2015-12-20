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
                    get: '/api/dashboard/',
                    getUsers: '/api/users',
                    getCompanies: '/api/companies'
                },
                overViewEndPoint:{
                    get: '/api/overview/',
                    save: '/api/saveOverview'
                },
                chartEndPoint:{
                    get: ''
                }
            },
            appSettings:
            {
                autoSaveTimeOut: 10000
            }
        });
})();
