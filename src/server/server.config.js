/**
 * Created by sherindharmarajan on 11/13/15.
 */

exports.webservice =
{
    protocol: 'http',
    url: 'dev-vm-websvc.advisen.com',
    port: 8080,
    service:'advwebservice'
};

exports.client = {
    protocol: 'http',
    /*domain: '192.168.1.216',*/
    domain: 'localhost',
    port: '4000',
    loglevel: 1,
    transports: ['polling']
};

var Client = require('node-rest-client').Client;
var moment = require('moment');

exports.restcall =
{
    client: new Client(),
    url: exports.webservice.protocol.concat('://', exports.webservice.url, ':', exports.webservice.port,
         '/',exports.webservice.service),
    service: [{
                name: 'templateManager',
                methods:{
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
                   downloadTemplatePDF: 'downloadTemplatePDF'
                }
              },
            {
                name: 'templateSearch',
                methods:{
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
            methods:{
                getStockData:'getStockData',
                getIndices:'getIndices',
                getSavedChartData : 'getChartSettings',
                saveChartSettings : 'saveChartSettings_v2',
                getAllChartSettings: 'getAllChartSettings'
            },
            exportOptions: {
                phatomjsURL: 'http://localhost:8888',
                pdfRequestDir: '/data/tmp/htmlRequest/',
                stockChartWidth: 800,
                stockChartHeight: 375,
                volumeChartWidth:  800,
                volumeChartHeight: 225
            }
        }]
};

exports.userSocketInfo = {};

exports.socketIO = {
    host: exports.client.protocol.concat('://', exports.client.domain, ':', exports.client.port),
    socket: null
};

exports.socketData={
  workup: []
};

exports.log =
{
    directory: './advisen-template',
    fileDirectory: '/' + moment().format('MM-DD-YYYY'),
    fileName: '/log.' + moment().format('MM-DD-YYYY') + '.txt'
};


exports.parallel = function(middlewares)
{
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
};
