
(function(schemaRoute)
{

    var _ = require('underscore');
    var templateBusiness = require('./template.business');
    var async = require('async');

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
            var userId = req.body.userId;
            var data = req.body.data;
            var stepMnemonics = null;

            async.map(data, savePerStep, function(err, results){
                res.send(results);
            });

            function savePerStep(step, callback) {
                stepMnemonics = step;
                console.log(stepMnemonics);
                if(stepMnemonics.mnemonic && stepMnemonics.mnemonic.length > 0) {
                    async.parallel( {
                            general: saveGeneral,
                            tableLayout: buildSaveTableLayout,
                            interactiveChart: buildSaveInteractiveChart
                        }, 
                        function(err, results){
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, null);
                }
            }

            function saveGeneral(callback){

                var mnemonics = _.filter(stepMnemonics.mnemonic, { type: 'general' } );

                if(mnemonics && mnemonics.length > 0) {

                    var service = getServiceDetails('templateManager');
                    var methodName = '';
                    var results = {
                        data: null,
                        error: null
                    };

                    if(!_.isUndefined(service) && !_.isNull(service))
                    {
                        methodName = service.methods.saveMnemonics;
                    }

                    mnemonics = _.map(mnemonics, function(mnemonic){
                        return {
                            itemId: mnemonic.itemId,
                            mnemonic: mnemonic.mnemonic,
                            uiType: null,
                            value: mnemonic.data   
                        }
                    });

                    var args =
                    {
                        data: {
                            projectId: stepMnemonics.projectId,
                            stepId: stepMnemonics.stepId,
                            userId: userId,
                            ssnid: req.headers['x-session-token'],
                            mnemonics: mnemonics
                        },
                        headers:{'Content-Type':'application/json'}
                    };

                    client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
                    {
                        results.data = mnemonics;
                        callback(null, results);
                    }).on('error', function (err) {
                            results.error = 'Error saving general mnemonics';
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, null);
                }
            }

            function buildSaveTableLayout(callback) {
                
                var mnemonics = _.filter(stepMnemonics.mnemonic, { type: 'table-layout' } ); 
                
                if(mnemonics && mnemonics.length > 0) {
                    async.map(mnemonics, saveTableLayout, function(err, results){                        
                        console.log('saveTableLayout');
                        callback(null, results);
                    });
                } else {
                    callback(null, null);
                }

            }

            function saveTableLayout(tableMnemonic, callback) {
                async.parallel( {
                        added: addTableLayout.bind(null, tableMnemonic),
                        updated: updateTableLayout.bind(null, tableMnemonic),
                        deleted: deleteTableLayout.bind(null, tableMnemonic)
                    },
                    function(err, results){
                        console.log('buildSaveTableLayout');
                        callback(null, results); //resuls are error messages
                    }
                );
            }

            function addTableLayout(tableMnemonic, callback) {

                var addedRows = _.filter(tableMnemonic.data, { action: 'added' });
                var results = {
                    data: null,
                    error: null
                };

                if(addedRows && addedRows.length > 0){

                    var service = getServiceDetails('templateManager');
                    var methodName = '';

                    if(!_.isUndefined(service) && !_.isNull(service))
                    {
                        methodName = service.methods.addDynamicTableData;
                    }

                    addedRows = _.map(addedRows, function(table){
                        
                        //required fields for add row
                        table.row.push({
                            columnName: 'OBJECT_ID',
                            value: stepMnemonics.projectId
                        });
                        
                        table.row.push({
                            columnName: 'ITEM_ID',
                            value: tableMnemonic.itemId
                        });

                        return {
                            row: table.row
                        };
                    });

                    var args =
                    {
                        data: {
                            projectId: stepMnemonics.projectId,
                            stepId: stepMnemonics.stepId,
                            mnemonic: tableMnemonic.mnemonic,
                            itemId: tableMnemonic.itemId,
                            table: addedRows
                        },
                        headers:{'Content-Type':'application/json'}
                    };

                    client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
                    {
                        results.data = addedRows;
                        callback(null, results);
                    }).on('error', function (err) {
                            results.error = 'Error adding rows on TableLayout';
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, results);
                }
            }

            function updateTableLayout(tableMnemonic, callback) {

                var updatedRows = _.filter(tableMnemonic.data, { action: 'updated' } );
                var results = {
                    data: null,
                    error: null
                };

                if(updatedRows && updatedRows.length > 0){

                    var service = getServiceDetails('templateManager');
                    var methodName = '';

                    if(!_.isUndefined(service) && !_.isNull(service))
                    {
                        methodName = service.methods.saveDynamicTableData;
                    }

                    updatedRows = _.map(updatedRows, function(table){
                        return {
                            row: table.row,
                            condition: table.condition
                        };
                    });

                    var args =
                    {
                        data: {
                            projectId: stepMnemonics.projectId,
                            stepId: stepMnemonics.stepId,
                            mnemonic: tableMnemonic.mnemonic,
                            itemId: tableMnemonic.itemId,
                            table: updatedRows
                        },
                        headers:{'Content-Type':'application/json'}
                    };

                    client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
                    {
                        results.data = updatedRows;
                        callback(null,results);
                    }).on('error', function (err) {
                            results.error = 'Error updating rows on TableLayout';
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, results);
                }
            }

            function deleteTableLayout(tableMnemonic, callback) {

                var deletedRows = _.filter(tableMnemonic.data, { action: 'deleted' } );
                var results = {
                    data: null,
                    error: null
                };

                if(deletedRows && deletedRows.length > 0){

                    var service = getServiceDetails('templateManager');
                    var methodName = '';

                    if(!_.isUndefined(service) && !_.isNull(service))
                    {
                        methodName = service.methods.deleteDynamicTableData;
                    }

                    deletedRows = _.map(deletedRows, function(table){
                        return {
                            condition: table.condition
                        };
                    });

                    var args =
                    {
                        data: {
                            projectId: stepMnemonics.projectId,
                            stepId: stepMnemonics.stepId,
                            mnemonic: tableMnemonic.mnemonic,
                            itemId: tableMnemonic.itemId,
                            table: deletedRows
                        },
                        headers:{'Content-Type':'application/json'}
                    };

                    client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
                    {
                        results.data = deletedRows;
                        callback(null,results);
                    }).on('error', function (err) {
                            results.error = 'Error deleting rows on TableLayout'; 
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, results);
                }
            }

            function buildSaveInteractiveChart(callback){
                var mnemonics = _.filter(stepMnemonics.mnemonic, { type: 'interactive-chart' } );
                
                if(mnemonics && mnemonics.length > 0) {
                    
                    async.map(mnemonics, saveInteractivteChart, function(err, results){
                        callback(null, results);
                    });
                } else {
                    callback(null, null);
                }
            }

            function saveInteractivteChart(mnemonic, callback) {
                
                var service = getServiceDetails('charts');
                var methodName = '';
                var results = {
                    data: null,
                    error: null
                };
                
                if (!_.isUndefined(service) && !_.isNull(service)) {
                    methodName = service.methods.saveFinancialChartSettings;
                }

                var args = {
                    data: {
                        project_id: stepMnemonics.projectId,
                        step_id: stepMnemonics.stepId,
                        company_id: stepMnemonics.companyId,
                        mnemonic: mnemonic.mnemonic,
                        item_id: mnemonic.itemId,
                        token: req.headers['x-session-token'],
                        projectImageCode: mnemonic.data.projectImageCode,
                        ifChartSettings: mnemonic.data.ifChartSettings
                    },
                    headers: { "Content-Type": "application/json" }
                };

                client.post(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
                {
                    results.data = data.chartSettings;
                    callback(null, results);
                }).on('error', function (err) {
                        results.error = 'Error saving interactive chart';
                        callback(null, results);
                    }
                );
            }
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

