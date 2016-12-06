
(function(schemaRoute)
{

    var _ = require('underscore');
    var templateBusiness = require('./template.business');

    schemaRoute.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/schema', schema),
            app.post('/api/mnemonics', mnemonics),
            app.post('/api/saveTemplate', saveMnemonics),
            app.post('/api/dynamicTable', dynamicTable ),
            app.post('/api/saveDynamicTable', saveDynamicTable ),
            app.post('/api/addDynamicTable', addDynamicTable ),
            app.post('/api/deleteDynamicTable', deleteDynamicTable ),
            app.post('/api/getScrapedHTML', getScrapedHTML ),
            app.post('/api/saveAll', saveAll )
        ]);

        //Save all changes related to template.
        function saveAll(req, res, next) {
            //Based on the type.
            //general
            //table-layout
            //hybrid-layout
            //chart

            //call in a loop and in a async fashion.
            //Call to the web-service should be parallel
            //General, Hybrid and Interactive Chart.
            //We put a wait on the call to get the web-service sync.

        }

        //Schema for the templates
        function schema(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateSchema;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(setSchemaVariations(data));
            });
        }

        //Mnemonics for the templates
        function mnemonics(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.templateMnemonics;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        //Save Mnemoics for the templates
        function saveMnemonics(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.saveMnemonics;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    projectId: req.body.projectId,
                    stepId: req.body.stepId,
                    userId: req.body.userId,
                    ssnid: req.headers['x-session-token'],
                    mnemonics: req.body.mnemonics
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        //Get Dynamic Table Layout details
        function dynamicTable(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.dynamicTableData;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
                    mnemonic: req.body.mnemonic,
                    item_id: req.body.item_id,
                    columns: req.body.columns,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

		function saveDynamicTable(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.saveDynamicTableData;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    projectId: req.body.project_id,
                    stepId: req.body.step_id,
                    mnemonic: req.body.mnemonic,
                    itemId: req.body.item_id,
                    table: req.body.table
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

		function addDynamicTable(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.addDynamicTableData;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    projectId: req.body.project_id,
                    stepId: req.body.step_id,
                    mnemonic: req.body.mnemonic,
                    itemId: req.body.item_id,
                    table: req.body.table
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

		function deleteDynamicTable(req, res, next)
        {
            var service = getServiceDetails('templateManager');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.deleteDynamicTableData;
            }

            console.log(methodName);

            var args =
            {
                data: {
                    projectId: req.body.project_id,
                    stepId: req.body.step_id,
                    mnemonic: req.body.mnemonic,
                    itemId: req.body.item_id,
                    table: req.body.table
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

		function getScrapedHTML(req, res, next)
        {
            console.log('Parameters -');
            console.log(req.body);

            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if(!_.isUndefined(service) && !_.isNull(service))
            {
                console.log(service.name);
                methodName = service.methods.getScrapedHTML;
            }

            console.log(methodName);

            var args =
            {
                parameters: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
					mnemonic: req.body.mnemonic,
					item_id: req.body.item_id,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            console.log(args);

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, {name: serviceName});
        }

        //S et the schema variations.
        function setSchemaVariations(data){
            var templateData = {
                header: [],
                content: [],
                fullComp: []
            };

            if (data && data.UIStructure &&
                data.UIStructure.data &&
                data.UIStructure.data.TearSheetStep &&
                data.UIStructure.data.TearSheetStep.Component )  {

                var components = data.UIStructure.data.TearSheetStep.Component;
                var component = templateBusiness.getHeaderAndContentComponents(components);
                templateData.header = templateBusiness.buildHeaderComponents(component.headers);
                templateData.content = templateBusiness.buildContentComponents(component.contents);
                templateData.fullComp = components;
            }

            return templateData;
        }
    };

})(module.exports);

