(function(config){

    var moment = require('moment');

    config.dev = {
        webService: {
            protocol: 'http',
            url: 'dev-vm-websvc.advisen.com',
            port: 8080,
            service:'advwebservice'
        },
        client: {
            protocol: 'https',
            domain: 'devcrm.advisen.com',
            port: '443',
            //loglevel: 1,
            //transports: ['polling'],
            useCertificate: false
        },
        redisKeyTTL: 14400,
        redisCluster: [
            {
                host: '192.168.100.203', 
                port: 6379
            },
            {
                host: '192.168.100.203', 
                port: 6380
            },
            {
                host: '192.168.100.201', 
                port: 6379
            },
            {
                host: '192.168.100.201', 
                port: 6380
            },
            {
                host: '192.168.100.202', 
                port: 6379
            },
            {
                host: '192.168.100.202', 
                port: 6380
            }
        ],
        log: {
            logLevel: 'debug',
            maxSize: 1048576, //1MB = 1 * 1024 * 1024 = 1048576
            maxFiles: 2000,
            dirName: '/data/logs/nodejs',
            logFilePath: 'uwf-%DATE%.log',
            exceptionLogFilePath: 'uwf-%DATE%-exceptions.log'
        }
    };

    config.int = {
        webService: {
            protocol: 'https',
            url: 'wsint.advisen.com',
            port: '',
            service: 'advwebservice'
        },
        client: {
            protocol: 'https',
            domain: 'workupsint.advisen.com',
            port: '443',
            //loglevel: 1,
            transports: ['polling'],
            useCertificate: false
        },
        redisKeyTTL: 14400,
        redisCluster: [
            {
                host: '192.168.100.203', 
                port: 6379
            },
            {
                host: '192.168.100.203', 
                port: 6380
            },
            {
                host: '192.168.100.201', 
                port: 6379
            },
            {
                host: '192.168.100.201', 
                port: 6380
            },
            {
                host: '192.168.100.202', 
                port: 6379
            },
            {
                host: '192.168.100.202', 
                port: 6380
            }
        ],
        log: {
            logLevel: 'debug',
            maxSize: 10485760, //1MB = 1 * 1024 * 1024 = 1048576
            maxFiles: 2000,
            dirName: '/data/logs/nodejs',
            logFilePath: 'uwf-%DATE%.log',
            exceptionLogFilePath: 'uwf-%DATE%-exceptions.log'
        }
    };

    config.prod = {
        webService: {
            protocol: 'https',
            url: 'ws.advisen.com',
            port: '',
            service: 'advwebservice'
        },
        client: {
            protocol: 'https',
            domain: 'workups.advisen.com',
            port: '443',
            //loglevel: 1,
            transports: ['polling'],
            useCertificate: false
        },
        redisKeyTTL: 14400,
        redisCluster: [
            {
                host: '192.168.100.203', 
                port: 6379
            },
            {
                host: '192.168.100.203', 
                port: 6380
            },
            {
                host: '192.168.100.201', 
                port: 6379
            },
            {
                host: '192.168.100.201', 
                port: 6380
            },
            {
                host: '192.168.100.202', 
                port: 6379
            },
            {
                host: '192.168.100.202', 
                port: 6380
            }
        ],
        log: {
            logLevel: 'debug',
            maxSize: 1048576, //1MB = 1 * 1024 * 1024 = 1048576
            maxFiles: 2000,
            dirName: '/data/logs/nodejs',
            logFilePath: 'uwf-%DATE%.log',
            exceptionLogFilePath: 'uwf-%DATE%-exceptions.log'
        }
    };

    config.modules = {
        restcall: {
            //initialize before use client = new Client();
            client: undefined,

            //url: exports.webservice.protocol.concat('://', exports.webservice.url, ':', exports.webservice.port, '/', exports.webservice.service),
            //url is built once we know the environment (DEV INT or PROD)
            url: '',

            service: [{
                name: 'templateManager',
                methods: {
                    auth:'authenticate',
                    saveOverview: 'updateTemplateOverview',
                    logout: 'deleteSession',
                    userInfo: 'getUserInfo',
                    saveDynamicTableData: 'updateTemplateTableLayOut',
                    addDynamicTableData: 'insertTemplateTableLayOut',
                    deleteDynamicTableData: 'deleteTemplateTableLayOut',
                    saveMnemonics: 'updateTemplateMnemonics',
                    createWorkUp: 'createNewTemplateProject',
                    renewWorkUp: 'renewTemplateProject',
                    lockWorkUp: 'lockWorkUp',
                    unlockWorkUp:'unLockWorkUp',
                    createWorkUpStatus: 'getTemplateProjectStatus',
                    createTemplatePDFRequest: 'createTemplatePDFRequest',
                    setSVGFileStatus: 'setSVGFileStatus',
                    getTemplatePDFStatus: 'getTemplatePDFStatus',
                    downloadTemplatePDF: 'downloadTemplatePDF',
                            deleteWorkup: 'deleteWorkup',
                            refreshWorkup: 'refreshWorkup'
                }
            },
                {
                    name: 'templateSearch',
                    methods: {
                        templateList: 'getTemplateList',
                        userLookUp: 'getUserLookup',
                        companyLookUp: 'getCompanyLookup',
                        overView: 'getTemplateOverview',
                        templateSchema: 'getTemplateUIStructure',
                        templateMnemonics: 'getTemplateMnemonics',
                        findTickers : 'findTickers',
                        dynamicTableData: 'getDynamicTableData',
                        getCompetitors:'getCompetitors',
                        saveChartSvgInFile: 'saveChartSvgInFile',
                        getScrapedHTML: 'getScrapedHTML',
                        getProjectHistory: 'getProjectHistory',
                        getProjectHistoryFilters: 'getProjectHistoryFilters'
                    }
                },
                {
                    name: 'charts',
                    methods: {
                        getStockData:'getStockData',
                        getIndices:'getIndices',
                        getSavedChartData : 'getChartSettingsPerStep',
                        saveChartSettings : 'saveCharts',
                        getAllChartSettings: 'getAllCharts',
                        getFinancialChartData: 'getInteractiveFinancialRatiosData',
                        getSavedFinancialChartData: 'getSavedIFChartSettings',
                        getFinancialChartRatioTypes: 'getRatiosType',
                        saveFinancialChartSettings: 'saveIFChartSettings',
                        getAllSavedIFChartSettings: 'getAllSavedIFChartSettings',
                        getFinancialChartPeerAndIndustries: 'getPeerAndIndustries',
                        getSignificantDevelopmentList: 'getSignificantDevelopmentList',
                        getSignificantDevelopmentDetail: 'getSignificantDevelopmentDetail',
                        getMascadLargeLosseDetail: 'getMascadLargeLosseDetail',
                        getMascadLargeLosseList: 'getMascadLargeLosseList',
                        getSavedSigDevItems: 'getSavedSigDevItems',
                        getSigDevSource: 'getSigDevSource',
                        saveSigDevItems: 'saveSigDevItems',
                        getAllSavedSigDevItems: 'getAllSavedSigDevItems'
                    },
                    exportOptions: {
                        phatomjsURL: 'http://localhost:8888',
                        pdfRequestDir: '/data/tmp/htmlRequest/',
                        financialChartWidth: 1100,
                        financialChartHeight: 550,
                        stockChartWidth: 1100,
                        stockChartHeight: 275,
                        volumeChartWidth: 1100,
                        volumeChartHeight: 275,
                        pdfRequestTimeout: 120
                    }
                },
                {
                    name: 'news',
                    methods: {
                        search: 'newsSearch',
                        attachNewsArticles: 'attachNewsArticles',
                        getAttachedArticles: 'getAttachedArticles',
                        showArticleContent: 'getArticle',
                        deleteAttachedArticles: 'deleteAttachedArticles'
                    }
                    },
                    {
                        name: 'reports',
                        methods: {
                            getList: 'getAnalystReports',
                            getPDFLink: 'getAnalystReportPDF',
                            getPreviewReport: 'getFactsetPreview'
                        }
                }
            ]
        },
        socketIO: {
            //host: exports.client.protocol.concat('://', exports.client.domain, ':', exports.client.port),
            //host is built once we know the environment (DEV INT or PROD)
            host: '',
            socket: null
        },
        //existing log is in use by server/routes/logging/logging.route.js to capture log messages from client
        log: {
            directory: './advisen-template',
            fileDirectory: '/' + moment().format('MM-DD-YYYY'),
            fileName: '/log.' + moment().format('MM-DD-YYYY') + '.txt'
        }
    };
})(module.exports);
