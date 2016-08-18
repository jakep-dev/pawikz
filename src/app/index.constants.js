(function ()
{
    'use strict';
    //var socket = io.connect();

    angular
        .module('advisen')
        .constant('clientConfig',{
            nodeJS:
            {
                protocol:'http:',
                ipAddress: 'localhost',
                port:'4000'
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
                    save: '/api/saveOverview',
                    getDefer: '/api/overview/defer'
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
                    deleteDynamic: '/api/deleteDynamicTable',
                    getScrapedHTML: '/api/getScrapedHTML'
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
                textEditorApiKey: 'VqsaF-10kwI2A-21yhvsdlH3gjk=='
            },
            socketInfo: {
                socket: undefined
            },
            activity:{
                //In Seconds
                idle: 600,
                timeout: 120,
                interval: 1200,
                dialogtimeout: 60
            }
        });
})();
