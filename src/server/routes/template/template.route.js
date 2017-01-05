
(function(schemaRoute)
{

    var _ = require('underscore');
    var templateBusiness = require('./template.business');
    var stockCharts = require('../chart/chart.route.js');
    var financialCharts = require('../chart/financial-chart.route.js');
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
            //stock chart
            //significant development
            //financial chart

            //call in a loop and in a async fashion.
            //Call to the web-service should be parallel
            //General, Hybrid and Interactive Chart.
            //We put a wait on the call to get the web-service sync.
            var saveContext = new Object();
            saveContext.userId = req.body.userId;
            saveContext.data = req.body.data;
            saveContext.token = req.headers['x-session-token'];
            saveContext.dataCount = saveContext.data.length;
            //loop through steps and pass in userId and token to each step
            for (saveContext.i = 0; saveContext.i < saveContext.dataCount; saveContext.i++) {
                saveContext.data[saveContext.i].userId = saveContext.userId;
                saveContext.data[saveContext.i].token = saveContext.token;
            }
            
            async.map(saveContext.data, saveStep, function (err, results) {
                res.send(results);
            });

            function saveStep(step, callback) {
                var saveStepContext = new Object();
                saveStepContext.stepMnemonics = step;
                console.log(saveStepContext.stepMnemonics);
                //loop through each mnemonic within a step and pass in token
                if (saveStepContext.stepMnemonics.mnemonic && saveStepContext.stepMnemonics.mnemonic.length > 0) {
                    saveStepContext.dataCount = saveStepContext.stepMnemonics.mnemonic.length;
                    for (saveStepContext.i = 0; saveStepContext.i < saveStepContext.dataCount; saveStepContext.i++) {
                        saveStepContext.stepMnemonics.mnemonic[saveStepContext.i].token = saveStepContext.stepMnemonics.token;
                    }

                    async.parallel( {
                            general: saveGeneral,
                            tableLayout: buildSaveTableLayout,
                            interactiveStockChart: buildSaveInteractiveStockChart,
                            significantDevelopmentItems: buildSaveSignificantDevelopmentItem,
                            interactiveFinancialChart: buildSaveInteractiveFinancialChart
                        }, 
                        function(err, results){
                            callback(null, results);
                        }
                    );
                } else {
                    callback(null, null);
                }


                function saveGeneral(callback) {
                    var context = new Object();
                    context.mnemonics = _.filter(saveStepContext.stepMnemonics.mnemonic, { type: 'general' });

                    if (context.mnemonics && context.mnemonics.length > 0) {

                        context.service = getServiceDetails('templateManager');
                        context.methodName = '';
                        context.results = {
                            data: null,
                            error: null
                        };

                        if (!_.isUndefined(context.service) && !_.isNull(context.service)) {
                            context.methodName = context.service.methods.saveMnemonics;
                        }

                        context.mnemonics = _.map(context.mnemonics, function (mnemonic) {
                            return {
                                itemId: mnemonic.itemId,
                                mnemonic: mnemonic.mnemonic,
                                uiType: null,
                                value: mnemonic.data
                            }
                        });

                        context.args =
                        {
                            data: {
                                projectId: saveStepContext.stepMnemonics.projectId,
                                stepId: saveStepContext.stepMnemonics.stepId,
                                userId: saveStepContext.stepMnemonics.userId,
                                ssnid: saveStepContext.stepMnemonics.token,
                                mnemonics: context.mnemonics
                            },
                            headers: { 'Content-Type': 'application/json' }
                        };

                        client.post(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                            context.results.data = context.mnemonics;
                            callback(null, context.results);
                        }).on('error', function (err) {
                            context.results.error = 'Error saving general mnemonics';
                            callback(null, context.results);
                        }
                        );
                    } else {
                        callback(null, null);
                    }
                }

                function buildSaveTableLayout(callback) {
                    var context = new Object();
                    context.mnemonics = _.filter(saveStepContext.stepMnemonics.mnemonic, { type: 'table-layout' });

                    if (context.mnemonics && context.mnemonics.length > 0) {
                        async.map(context.mnemonics, saveTableLayout, function (err, results) {
                            console.log('saveTableLayout');
                            callback(null, results);
                        });
                    } else {
                        callback(null, null);
                    }
                }

                function saveTableLayout(tableMnemonic, callback) {
                    async.parallel({
                        added: addTableLayout.bind(null, tableMnemonic),
                        updated: updateTableLayout.bind(null, tableMnemonic),
                        deleted: deleteTableLayout.bind(null, tableMnemonic)
                    },
                        function (err, results) {
                            console.log('buildSaveTableLayout');
                            callback(null, results); //resuls are error messages
                        }
                    );
                }

                function addTableLayout(tableMnemonic, callback) {
                    var context = new Object();
                    context.addedRows = _.filter(tableMnemonic.data, { action: 'added' });
                    context.results = {
                        data: null,
                        error: null
                    };

                    if (context.addedRows && context.addedRows.length > 0) {

                        context.service = getServiceDetails('templateManager');
                        context.methodName = '';

                        if (!_.isUndefined(context.service) && !_.isNull(context.service)) {
                            context.methodName = context.service.methods.addDynamicTableData;
                        }

                        context.addedRows = _.map(context.addedRows, function (table) {

                            //required fields for add row
                            table.row.push({
                                columnName: 'OBJECT_ID',
                                value: saveStepContext.stepMnemonics.projectId
                            });

                            table.row.push({
                                columnName: 'ITEM_ID',
                                value: tableMnemonic.itemId
                            });

                            return {
                                row: table.row
                            };
                        });

                        context.args =
                        {
                            data: {
                                projectId: saveStepContext.stepMnemonics.projectId,
                                stepId: saveStepContext.stepMnemonics.stepId,
                                mnemonic: tableMnemonic.mnemonic,
                                itemId: tableMnemonic.itemId,
                                table: context.addedRows
                            },
                            headers: { 'Content-Type': 'application/json' }
                        };

                        client.post(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                            context.results.data = context.addedRows;
                            callback(null, context.results);
                        }).on('error', function (err) {
                            context.results.error = 'Error adding rows on TableLayout';
                            callback(null, context.results);
                        }
                        );
                    } else {
                        callback(null, context.results);
                    }
                }

                function updateTableLayout(tableMnemonic, callback) {
                    var context = new Object();
                    context.updatedRows = _.filter(tableMnemonic.data, { action: 'updated' });
                    context.results = {
                        data: null,
                        error: null
                    };

                    if (context.updatedRows && context.updatedRows.length > 0) {

                        context.service = getServiceDetails('templateManager');
                        context.methodName = '';

                        if (!_.isUndefined(context.service) && !_.isNull(context.service)) {
                            context.methodName = context.service.methods.saveDynamicTableData;
                        }

                        context.updatedRows = _.map(context.updatedRows, function (table) {
                            return {
                                row: table.row,
                                condition: table.condition
                            };
                        });

                        context.args =
                        {
                            data: {
                                projectId: saveStepContext.stepMnemonics.projectId,
                                stepId: saveStepContext.stepMnemonics.stepId,
                                mnemonic: tableMnemonic.mnemonic,
                                itemId: tableMnemonic.itemId,
                                table: context.updatedRows
                            },
                            headers: { 'Content-Type': 'application/json' }
                        };

                        client.post(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                            context.results.data = context.updatedRows;
                            callback(null, context.results);
                        }).on('error', function (err) {
                            context.results.error = 'Error updating rows on TableLayout';
                            callback(null, context.results);
                        }
                        );
                    } else {
                        callback(null, context.results);
                    }
                }

                function deleteTableLayout(tableMnemonic, callback) {
                    var context = new Object();
                    context.deletedRows = _.filter(tableMnemonic.data, { action: 'deleted' });
                    context.results = {
                        data: null,
                        error: null
                    };

                    if (context.deletedRows && context.deletedRows.length > 0) {

                        context.service = getServiceDetails('templateManager');
                        context.methodName = '';

                        if (!_.isUndefined(context.service) && !_.isNull(context.service)) {
                            context.methodName = context.service.methods.deleteDynamicTableData;
                        }

                        context.deletedRows = _.map(context.deletedRows, function (table) {
                            return {
                                condition: table.condition
                            };
                        });

                        context.args =
                        {
                            data: {
                                projectId: saveStepContext.stepMnemonics.projectId,
                                stepId: saveStepContext.stepMnemonics.stepId,
                                mnemonic: tableMnemonic.mnemonic,
                                itemId: tableMnemonic.itemId,
                                table: context.deletedRows
                            },
                            headers: { 'Content-Type': 'application/json' }
                        };

                        client.post(config.restcall.url + '/' + context.service.name + '/' + context.methodName, context.args, function (data, response) {
                            context.results.data = context.deletedRows;
                            callback(null, context.results);
                        }).on('error', function (err) {
                            context.results.error = 'Error deleting rows on TableLayout';
                            callback(null, context.results);
                        }
                        );
                    } else {
                        callback(null, context.results);
                    }
                }

                function buildSaveInteractiveStockChart(callback) {
                    var context = new Object();
                    context.mnemonics = _.filter(saveStepContext.stepMnemonics.mnemonic, { type: 'interactive-stock-chart' });
                    if (context.mnemonics && context.mnemonics.length > 0) {
                        async.map(context.mnemonics, stockCharts.saveInteractiveStockChart, function (err, results) {
                            callback(null, results);
                        });
                    } else {
                        callback(null, null);
                    }
                }

                function buildSaveSignificantDevelopmentItem(callback) {
                    var context = new Object();
                    context.mnemonics = _.filter(saveStepContext.stepMnemonics.mnemonic, { type: 'significant-development-items' });
                    if (context.mnemonics && context.mnemonics.length > 0) {
                        async.map(context.mnemonics, stockCharts.saveSigDevItems, function (err, results) {
                            callback(null, results);
                        });
                    } else {
                        callback(null, null);
                    }
                }

                function buildSaveInteractiveFinancialChart(callback) {
                    var context = new Object();
                    context.mnemonics = _.filter(saveStepContext.stepMnemonics.mnemonic, { type: 'interactive-financial-chart' });
                    if (context.mnemonics && context.mnemonics.length > 0) {
                        async.map(context.mnemonics, financialCharts.saveInteractiveFinancialChart, function (err, results) {
                            callback(null, results);
                        });
                    } else {
                        callback(null, null);
                    }
                }

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

