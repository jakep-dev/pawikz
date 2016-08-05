(function ()
{
    'use strict';

    var socket = io.connect();

    angular
        .module('advisen')
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
                    save: '/api/saveTemplate',
                    dynamic: '/api/dynamicTable',
                    saveDynamic: '/api/saveDynamicTable',
                    addDynamic: '/api/addDynamicTable',
                    deleteDynamic: '/api/deleteDynamicTable'
                },
                loggerEndPoint:
                {
                    error: '/api/errorLog',
                    debug: '/api/debugLog'
                },
                workUpEndPoint:
                {
                    create: '/api/workup/create',
                    renew: '/api/workup/renew'
                }
            },
            appSettings:
            {
                autoSaveTimeOut: 10000,
            },
            socketInfo: socket,
            activity:{
                //In Minutes
                idle: 600,
                timeout: 120,
                interval: 1200
            }
        });
})();
