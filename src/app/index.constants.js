(function() {
    'use strict';

    angular
        .module('advisen')
        .constant('clientConfig', {
            nodeJS: {
                protocol: 'http:',
                ipAddress: 'localhost',
                port: '4000'
            },
            endpoints: {
                dashboardEndPoint: {
                    get: '/api/dashboard',
                    getUsers: '/api/users',
                    getCompanies: '/api/companies',
                    processRemoveWorkUp: '/api/processRemoveWorkUp/'
                },
                overViewEndPoint: {
                    get: '/api/overview',
                    save: '/api/saveOverview',
                    getDefer: '/api/overview/defer'
                },
                chartEndPoint: {
                    get: ''
                },
                authEndPoint: {
                    auth: '/api/authenticate/',
                    logout: '/api/logout',
                    getUser: '/api/userInfo'
                },
                templateEndPoint: {
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
                loggerEndPoint: {
                    error: '/api/errorLog',
                    debug: '/api/debugLog'
                },
                workUpEndPoint: {
                    create: '/api/workup/create',
                    renew: '/api/workup/renew',
                    status: '/api/workup/status',
                    lock: '/api/workup/lock',
                    unlock: '/api/workup/unlock',
                    delete: '/api/workup/delete',
                    dataRefresh: '/api/workup/refresh',
                    checkStatus: '/api/workup/checkStatus'
                },
                newsEndPoint: {
                    search: '/api/news/search',
                    attachNewsArticles: '/api/news/attachNewsArticles',
                    getAttachedArticles: '/api/news/getAttachedArticles',
                    showArticleContent: '/api/news/showArticleContent',
                    deleteAttachedArticles: '/api/news/deleteAttachedArticles'
                },
                reportsEndPoint: {
                    get: '/api/reports/list',                    
                    getPDFLink: '/api/reports/getPDFLink',
                    getPreviewReport: '/api/reports/getPreviewReport'
                },
                projectHistoryEndPoint: {
                    get: '/api/getProjectHistory',
                    getFilters: '/api/getProjectHistoryFilters'
                }
            },
            appSettings: {
                autoSaveTimeOut: 600000,
                textEditorApiKey: 'VqsaF-10kwI2A-21yhvsdlH3gjk==',
                compInitialLoadForDesktop: 3,
                compInitialLoadForDesktopIE: 30,
                compInitialLoadForMobile: 1,
                compInitialLoadForTablet: 3
            },
            socketInfo: {
                socket: undefined,
                socketCORSPath: undefined,
                transports: ['polling', 'websocket'],
                doConnect: undefined
            },
            activity: {
                //In Seconds
                idle: 14400,
                timeout: 120,
                interval: 1200,
                renewWorkupTimeout: 30,
                createWorkupTimeout: 30,
                pdfDownloadTimeout: 30
            },
            uiType: {
                general: 'general',
                tableLayout: 'table-layout',
                hybridLayout: 'hybrid-layout',
                interactiveStockChart: 'interactive-stock-chart',
                significantDevelopmentItems: 'significant-development-items',
                interactiveFinancialChart: 'interactive-financial-chart'
            },
            messages: {
                dashboardDelete: {
                    title: 'Would you like to delete?',
                    content: ' will be deleted. Please confirm.'
                },
                programTableHybrid: {
                    invalidInput: 'Invalid entry. Input numbers with k, m or b for thousand, million or billion respectively.',
                    maxRow: 'Reached max rows. Available row(s) to add is',
                    deleteRow: 'Check row(s) to delete.',
                    copyProgram: 'program copied!'
                },
                newsArticle : {
                    bookmarkNewsItem : {
                        title : 'Bookmark News',
                        content: 'Are you sure you want to include the full text of the checked article(s) in your work-up?',
                        success: 'Selected article(s) attached successfully.',
                        duplicate: 'One or more of the selected article(s) were already attached. System will ignore those artice(s). Do you want to proceed?'
                    },
                    deleteNewsItem :{
                        title : 'Would you like to delete?',
                        content: 'Selected News Aricles(s) will be deleted. Please Confirm.'
                    } 
                },
                analystReports: {
                    title : 'Purchase Report',
                    content: 'Do you want to purchase this @price report?'
                }
            }
        });
})();