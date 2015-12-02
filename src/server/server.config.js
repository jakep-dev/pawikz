/**
 * Created by sherindharmarajan on 11/13/15.
 */

exports.webservice =
{
    security: 'http',
    url: 'dev-vm-websvc.advisen.com',
    port: 8080,
    service:'advwebservice'
}

var Client = require('node-rest-client').Client;

exports.restcall =
{
    client: new Client(),
    url: exports.webservice.security.concat('://', exports.webservice.url, ':', exports.webservice.port,
         '/',exports.webservice.service),

    service: [{
                name: 'templateManager',
                methods:{
                   auth:'authenticate'
                }
              },
            {
                name: 'templateSearch',
                methods:{
                    templateList: 'getTemplateList',
                    userLookUp: 'getUserLookup',
                    companyLookUp: 'getCompanyLookup',
                    overView: 'getTemplateOverview'
                }
            }]
}
