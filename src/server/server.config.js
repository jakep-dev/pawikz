/**
 * Created by sherindharmarajan on 11/13/15.
 */

exports.webservice =
{
    protocol: 'http',
    url: 'dev-vm-websvc.advisen.com',
    port: 8080,
    service:'advwebservice'
}

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
                   saveMnemonics: 'updateTemplateMnemonics'
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
                    findTickers : 'findTickers'
                }
            },
        {
            name: 'charts',
            methods:{
                getStockData:'getStockData',
                getIndices:'getIndices',
                getSavedChartData : 'getSavedChartData',
                saveChartSettings : 'saveChartSettings'
            }
        }]
}

exports.log =
{
    directory: './advisen-template',
    fileDirectory: '/' + moment().format('MM-DD-YYYY'),
    fileName: '/log.' + moment().format('MM-DD-YYYY') + '.txt'
}


exports.parallel = function(middlewares)
{
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
}
