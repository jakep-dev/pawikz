/**
 * Created by sherindharmarajan on 11/13/15.
 */

exports.webservice = {
    protocol: 'https',
    url: 'wsint.advisen.com',
    port: '',
    service:'advwebservice'
};

exports.client = {
    protocol: 'http',
    domain: '192.168.1.216',
    port: '4000',
    loglevel: 1,
    transports: ['polling']
};

var Client = require('node-rest-client').Client;
var moment = require('moment');

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
                renewWorkUp: 'reNODEnewTemplateProject',
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
                getScrapedHTML: 'getScrapedHTML'
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
                showArticleContent: 'getArticle'
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