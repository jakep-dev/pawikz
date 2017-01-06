(function ()
{
    'use strict';

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
                    getCompanies: '/api/companies/',
                    processRemoveWorkUp: '/api/processRemoveWorkUp/'
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
                    saveAll: '/api/saveAll',
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
                    renew: '/api/workup/renew',
                    status: '/api/workup/status',
                    lock: '/api/workup/lock',
                    unlock: '/api/workup/unlock',
                    delete: '/api/workup/delete'
                }
            },
            appSettings:
            {
                autoSaveTimeOut: 10000,
                textEditorApiKey: 'VqsaF-10kwI2A-21yhvsdlH3gjk==',
                compInitialLoadForDesktop:  3,
                compInitialLoadForMobile:  1,
                compInitialLoadForTablet:  3
            },
            socketInfo: {
                socket: undefined
            },
            activity:{
                //In Seconds
                idle: 14400,
                timeout: 120,
                interval: 1200,
                renewWorkupTimeout: 30,
                createWorkupTimeout: 30,
                pdfDownloadTimeout: 30
            },
            uiType:{
                general: 'general',
                tableLayout: 'table-layout',
                hybridLayout: 'hybrid-layout',
                interactiveStockChart: 'interactive-stock-chart',
                significantDevelopmentItems: 'significant-development-items',
                interactiveFinancialChart: 'interactive-financial-chart'
            }
        });
})();
