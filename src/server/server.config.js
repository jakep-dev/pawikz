/**
 * Created by sherindharmarajan on 11/13/15.
 */

exports.webservices = new Array();
exports.webservices['DEV'] = {
    protocol: 'http',
    url: 'dev-vm-websvc.advisen.com',
    port: 8080,
    service:'advwebservice'
};
exports.webservices['INT'] = {
    protocol: 'https',
    url: 'wsint.advisen.com',
    port: 443,
    service: 'advwebservice'
};
exports.webservices['PROD'] = {
    protocol: 'https',
    url: 'ws.advisen.com',
    port: 443,
    service: 'advwebservice'
};

exports.clients = new Array();
exports.clients['DEV'] = {
    protocol: 'https',
    domain: 'devcrm.advisen.com',
    port: '443',
    loglevel: 1,
    transports: ['polling'],
    useCertificate: false
};
exports.clients['INT'] = {
    protocol: 'https',
    domain: 'workupsint.advisen.com',
    port: '443',
    loglevel: 1,
    transports: ['polling'],
    useCertificate: false
};
exports.clients['PROD'] = {
    protocol: 'https',
    domain: 'workups.advisen.com',
    port: '443',
    loglevel: 1,
    transports: ['polling'],
    useCertificate: false
};

exports.serverConfigs = new Array();
exports.serverConfigs['DEV'] = {
    logLevel: 'info',
    maxSize: 1048576, //1MB = 1 * 1024 * 1024 = 1048576
    maxFiles: 2000,
    logFilePath: '/data/logs/dev/dev_nodejs.log'
};
exports.serverConfigs['INT'] = {
    logLevel: 'info',
    maxSize: 10485760, //1MB = 1 * 1024 * 1024 = 1048576
    maxFiles: 2000,
    logFilePath: '/data/logs/int/int_nodejs.log'
};
exports.serverConfigs['PROD'] = {
    logLevel: 'info',
    maxSize: 1048576, //1MB = 1 * 1024 * 1024 = 1048576
    maxFiles: 2000,
    logFilePath: '/data/logs/prod/prod_nodejs.log'
};


var Client = require('node-rest-client').Client;
var moment = require('moment');
var environment = (process.env.STARTUP_ENV || 'DEV').toUpperCase();
switch (environment) {
    case 'PROD':
    case 'INT':
    case 'DEV':
        exports.webservice = exports.webservices[environment];
        exports.client = exports.clients[environment];
        exports.serverConfig = exports.serverConfigs[environment];
        break;
    default:
        //defaults to DEV environment
        environment = 'DEV'
        exports.webservice = exports.webservices['DEV'];
        exports.client = exports.clients['DEV'];
        exports.serverConfig = exports.serverConfigs['DEV'];
        break;
}

exports.environment = environment;

exports.restcall = {
    client: new Client(),
    url: exports.webservice.protocol.concat('://', exports.webservice.url, ':', exports.webservice.port, '/', exports.webservice.service),
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
                deleteWorkup: 'deleteWorkup'
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
                getSavedChartData : 'getChartSettingsPerStep', // getChartSettings
                saveChartSettings : 'saveCharts', // saveChartSettings_v2
                getAllChartSettings: 'getAllCharts', // getAllChartSettings
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
                financialChartHeight: 600,
                stockChartWidth: 1100,
                stockChartHeight: 375,
                volumeChartWidth: 1100,
                volumeChartHeight: 225,
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
        }
    ]
};

exports.userSocketInfo = {};

exports.socketIO = {
    host: exports.client.protocol.concat('://', exports.client.domain, ':', exports.client.port),
    socket: null
};

exports.socketData = {
  workup: []
};

exports.log = {
    directory: './advisen-template',
    fileDirectory: '/' + moment().format('MM-DD-YYYY'),
    fileName: '/log.' + moment().format('MM-DD-YYYY') + '.txt'
};

exports.parallel = function(middlewares) {
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
};