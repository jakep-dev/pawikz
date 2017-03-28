
(function(chartRoutes) {
    var async = require('async');
    var u = require('underscore');
    var fs = require('fs');
    var config = null;
    var client = null;

    function getServiceDetails(serviceName) {
        return u.find(config.restcall.service, { name: serviceName });
    }

    function saveInteractiveStockChart(mnemonic, callback) {
        var context = new Object();
        context.service = getServiceDetails('charts');
        context.methodName = '';
        context.results = {
            data: null,
            error: null
        };

        if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
            context.methodName = context.service.methods.saveChartSettings;
        }

        context.args = {
            data: {
                project_id: mnemonic.data.project_id,
                company_id: mnemonic.data.company_id,
                step_id: mnemonic.data.step_id,
                ssnid: mnemonic.token,
                chartSettings: mnemonic.data.chartSettings
            },
            headers: { "Content-Type": "application/json" }
        };
        context.url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
        //console.log('[saveInteractiveStockChart] url =' + context.url);
        //console.log('[saveInteractiveStockChart]\n' + JSON.stringify(context.args));
        client.post(context.url, context.args, function (data, response) {
            context.results.data = data;
            callback(null, context.results);
        }).on('error',
            function (err) {
                context.results.error = 'Error saving interactive stock chart';
                callback(null, context.results);
            }
        );
    }

    chartRoutes.saveInteractiveStockChart = saveInteractiveStockChart;

    function saveSigDevItems(mnemonic, callback) {
        var context = new Object();
        context.service = getServiceDetails('charts');
        context.methodName = '';
        context.results = {
            data: null,
            error: null
        };

        if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
            context.methodName = context.service.methods.saveSigDevItems;
        }

        context.args = {
            data: {
                project_id: mnemonic.data.project_id,
                step_id: mnemonic.data.step_id,
                mnemonic: mnemonic.data.mnemonic,
                item_id: mnemonic.data.item_id,
                token: mnemonic.token,
                items: mnemonic.data.items
            },
            headers: { "Content-Type": "application/json" }
        };
        context.url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
        //console.log('[saveSigDevItems] url =' + context.url);
        //console.log('[saveSigDevItems]\n' + JSON.stringify(context.args));
        client.post(context.url, context.args, function (data, response) {
            context.results.data = data;
            callback(null, context.results);
        }).on('error',
            function (err) {
                context.results.error = 'Error saving interactive stock chart';
                callback(null, context.results);
            }
        );
    }

    chartRoutes.saveSigDevItems = saveSigDevItems;

    chartRoutes.init = function (app, c) {
        config = c;
        client = config.restcall.client;

        config.parallel([
            app.post('/api/getChartData', getChartData),
            app.post('/api/findTickers', getTickers),
            app.post('/api/getIndices', getIndices),
            app.post('/api/getCompetitors', getCompetitors),
            app.post('/api/getSavedChartData', getSavedChartData),
            //app.post('/api/saveChartSettings', saveChartSettings),
            //app.post('/api/saveChartAllSettings', saveChartAllSettings),
            app.post('/api/getSavedChartTable', getSavedChartTable),
            app.post('/api/getSignificantDevelopmentList', getSignificantDevelopmentList),
            app.post('/api/getSignificantDevelopmentDetail', getSignificantDevelopmentDetail),
            app.post('/api/getMascadLargeLosseDetail', getMascadLargeLosseDetail),
            app.post('/api/getMascadLargeLosseList', getMascadLargeLosseList),
            app.post('/api/getSigDevSource', getSigDevSource),
            //app.post('/api/saveSigDevItems', saveSigDevItems)
        ]);

        function getChartData(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';
            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getStockData;
            }

            var tickers = req.body.tickers;
            var period = req.body.period;
            var ssnid = req.headers['x-session-token'];
            var companyId = req.body.companyId;
            var splits = req.body.splits;
            var dividends = req.body.dividends;
            var earnings = req.body.earnings;
            var end_date = req.body.end_date;
            var start_date = req.body.start_date;

            var url = config.restcall.url + '/' + service.name + '/' + methodName
                + '?company_id=' + companyId
                + '&peers=' + encodeURIComponent(tickers)
                + '&period=' + period
                + '&ssnid=' + ssnid
                + '&splits=' + splits
                + '&dividends=' + dividends
                + '&earnings=' + earnings
                + '&date_start=' + start_date
                + '&date_end=' + end_date;
            //console.log('[getChartData] url = ' + url);
            client.get(url,
                function (data, response) {
                    res.send(data);
                }
            );
        }

        //this creates new charts or remove not iterated ones
        //function saveChartAllSettings(req, res, next) {
        //    var service = getServiceDetails('charts');
        //    var methodName = '';
        //    if (!u.isUndefined(service) && !u.isNull(service)) {
        //        methodName = service.methods.saveChartSettings;
        //    }

        //    var projectId = req.body.project_id;
        //    var companyId = req.body.company_id;
        //    var stepId = req.body.step_id;
        //    var ssnid = req.headers['x-session-token'];
        //    var chartSettings = req.body.chartSettings;
        //    console.log('***************** ONEAL CHART SETTINGS START ONEAL *****************');
        //    console.log(chartSettings);
        //    console.log('***************** ONEAL CHART SETTINGS  END  ONEAL *****************');
        //    //chartsettings should be a array and and defined
        //    var args = {
        //        data: {
        //            project_id: parseInt(projectId),
        //            company_id: parseInt(companyId),
        //            step_id: parseInt(stepId),
        //            ssnid: ssnid,
        //            chartSettings: chartSettings
        //        },
        //        headers: { "Content-Type": "application/json" }
        //    };

        //    var url = config.restcall.url + '/' + service.name + '/' + methodName, args;
        //    //console.log('[saveChartAllSettings]Before ' + url + "\n" + JSON.stringify(args));
        //    client.post(url, args,
        //        function (data, response) {
        //            //console.log('[saveChartAllSettings]After \n' + JSON.stringify(data));
        //            res.send(data);
        //        }
        //    );
        //}

        ////this ceates a single chart
        //function saveChartSettings(req, res, next) {
        //    var service = getServiceDetails('charts');
        //    var methodName = '';
        //    if (!u.isUndefined(service) && !u.isNull(service)) {
        //        methodName = service.methods.saveChartSettings;
        //    }

        //    var tickers = req.body.tickers;
        //    var period = req.body.period;
        //    var ssnid = req.headers['x-session-token'];
        //    var splits = req.body.splits;
        //    var dividends = req.body.dividends;
        //    var earnings = req.body.earnings;
        //    var end_date = req.body.end_date;
        //    var start_date = req.body.start_date;
        //    var chart_title = req.body.chartTitle;
        //    var chart_id = req.body.chart_id;
        //    var chartSetting = {
        //        chart_title: chart_title,
        //        peers: tickers,
        //        period: period,
        //        date_start: start_date,
        //        date_end: end_date,
        //        dividends: dividends,
        //        earnings: earnings,
        //        splits: splits,
        //        chart_id: chart_id
        //    };

        //    if (chart_id) {
        //        chartSetting.chartId = parseInt(chart_id);
        //    }

        //    var args = {
        //        data : {
        //            project_id: parseInt(projectId),
        //            company_id: parseInt(companyId),
        //            step_id: parseInt(stepId),
        //            ssnid: ssnid,
        //            data: [chartSetting],
        //            delete_ignored: false
        //        },
        //        headers: { "Content-Type": "application/json" }
        //    };
        //    client.post(config.restcall.url + '/' + service.name + '/' + methodName, args,
        //        function(data, response) {
        //            res.send(data);
        //        }
        //    );
        //}

        function getTickers(req, res, next) {
            var service = getServiceDetails('templateSearch');
            var methodName = '';
            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.findTickers;
            }

            var  keyword = req.body.keyword, ssnid= req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName + '?keyword=' + keyword + '&ssnid=' + ssnid,
                function (data, response) {
                    res.send(data);
                }
            );
        }

        function getIndices(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';
            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getIndices;
            }

            var ssnid = req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName + '?ssnid=' + ssnid,
                function (data, response) {
                    res.send(data);
                }
            );
        }

        function getCompetitors(req, res, next) {
            var service = getServiceDetails('templateSearch');
            var methodName = '';
            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getCompetitors;
            }

            var  ssnid = req.headers['x-session-token'];
            var companyId = req.body.companyId;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName + '?company_id=' + companyId + '&ssnid=' + ssnid,
                function (data, response) {
                    res.send(data);
                }
            );
        }

        function getSavedChartData(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';
            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSavedChartData;
            }

            var ssnid = req.headers['x-session-token'];
            var stepId = req.body.step_id;
            var projectId = req.body.project_id;
            var mnemonic = req.body.mnemonic;
            var itemId = req.body.item_id;
            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?project_id=' + projectId + '&step_id=' + stepId + '&mnemonic=' + mnemonic + '&item_id=' + itemId + '&ssnid=' + ssnid;
            //console.log('[getSavedChartData] url = ' + url);
            client.get(url,
                function (data, response) {
                    res.status(response.statusCode).send(getChartSettings(data));
                }
            );
        }

        function getChartSettings(data) {
            var result = {
                newCharts: [],
                legacyCharts: []
            };

            if (data && data.chartSettings) {
                u.each(data.chartSettings, function(savedChart) {
                    if (savedChart.chartType === 'IMGURL') {
                        result.legacyCharts.push(savedChart);
                    } else if (savedChart.chartType  === 'JSCHART') {
                        var chart = {};
                        chart.chartType = 'JSCHART';
                        chart.isMainChart = savedChart.isDefault === 'Y';
                        chart.settings = {
                            mainStock: "",
                            mnemonic: savedChart.mnemonic,
                            item_id: savedChart.item_id,
                            company_id: savedChart.company_id,
                            companyName: savedChart.chart_title,
                            selectedPeriod: savedChart.period.toUpperCase(),
                            chart_id: savedChart.chart_id,
                            chart_date: savedChart.chart_date,
                            date_start: savedChart.date_start,
                            date_end: savedChart.date_end,
                            selectedIndicesList: [],
                            selectedPeerList: [],
                            selectedPeerNameList: [],
                            selectedCompetitorsList: [],
                            searchedStocks: [],
                            to: {},
                            from: {},
                            isSplits: (savedChart.splits === 'Y') ? true : false,
                            isEarnings: (savedChart.earnings === 'Y') ? true : false,
                            isDividends: (savedChart.dividends === 'Y') ? true : false,
                            eventOptionVisibility: false,
                            dateOptionVisibility: false,
                            comparisonOptionVisibility: false,
                            isDefault: savedChart.isDefault
                        };

                        if (savedChart.peers) {
                            var peerNames = savedChart.peerNames.split('||');
                            var peers = savedChart.peers.split(',');
                            for (var i = 0; i < peers.length; i++) {
                                var peer = peers[i].trim();
                                if (peer.charAt(0) === '^') {
                                    chart.settings.selectedIndicesList.push(peer.substring(1, peer.length));
                                    //chart.settings.selectedCompetitorsList.push(peer.substring(1, peer.length));
                                }
                                if (peer.charAt(0) === '@') {
                                    //chart.settings.selectedIndicesList.push(peer.substring(1, peer.length));
                                    chart.settings.selectedCompetitorsList.push(peer.substring(1, peer.length));
                                } else if (peer.charAt(0) !== '^' && peer.charAt(0) !== '@') {
                                    var peerName = peerNames[i].trim();
                                    chart.settings.selectedPeerList.push(peer);
                                    chart.settings.selectedPeerNameList.push(peerName);
                                }
                            }
                        }
                        if (savedChart.date_start) {
                            var dateStart = savedChart.date_start.split('-');
                            chart.settings.from = {
                                year : dateStart[0],
                                month : dateStart[1],
                                date : dateStart[2]
                            };
                        }
                        if (savedChart.date_end) {
                            var dateEnd = savedChart.date_end.split('-');
                            chart.settings.to = {
                                year : dateEnd[0],
                                month : dateEnd[1],
                                date : dateEnd[2]
                            };
                        }
                        result.newCharts.push(chart);
                    }
                });
            }
            //console.log(JSON.stringify(result));
            return result;
        }

        function writeFile(fileName,fileData,reqID) {
            var fs = require("fs");
            var mkdirp = require('mkdirp');

            if (!fs.existsSync('src/server/data/tmp/htmlRequest'/ + reqID )) {
                mkdirp.sync('src/server/data/tmp/htmlRequest/' + reqID +'/chart/' );
            }

            fs.writeFile('src/server/data/tmp/htmlRequest/' + reqID + '/chart/' + fileName, fileData, function (err) {
                if (err) {
                    return console.error(err);
                }
                return console.log('success');
            });
        }

        //function saveSigDevItems(req, res, next) {
        //    var service = getServiceDetails('charts');
        //    var methodName = '';
        //    if (!u.isUndefined(service) && !u.isNull(service)) {
        //        methodName = service.methods.saveSigDevItems;
        //    }

        //    var projectId = req.body.project_id;
        //    var stepId = req.body.step_id;
        //    var mnemonic = req.body.mnemonic;
        //    var itemId = req.body.item_id;
        //    var token = req.headers['x-session-token'];
        //    var items = req.body.items;
        //    var args = {
        //        data: {
        //            project_id: parseInt(projectId),
        //            step_id: parseInt(stepId),
        //            mnemonic: mnemonic,
        //            item_id: itemId,
        //            token: token,
        //            items: items
        //        },
        //        headers: { "Content-Type": "application/json" }
        //    };

        //    client.post(config.restcall.url + '/' + service.name + '/' + methodName, args,
        //        function (data, response) {
        //            res.send(data);
        //        }
        //    );
        //}

        function getSavedChartTable(req, res, next) {
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSavedSigDevItems;
            }

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

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });
        }

        function getSignificantDevelopmentList(req, res, next) {
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSignificantDevelopmentList;
            }

            var args =
            {
                parameters: {
                    company_id: req.body.companyId,
                    start_date: req.body.startDate,
                    end_date: req.body.endDate,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });

        }

        function getMascadLargeLosseList(req, res, next) {
           var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getMascadLargeLosseList;
            }

            var args =
            {
                parameters: {
                    company_id: req.body.companyId,
                    start_date: req.body.startDate,
                    end_date: req.body.endDate,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });

        }

        function getSignificantDevelopmentDetail(req, res, next) {
           var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSignificantDevelopmentDetail;
            }

            var args =
            {
                parameters: {
                    sigdev_id: req.body.sigdevId,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });

        }

        function getMascadLargeLosseDetail(req, res, next) {
           var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getMascadLargeLosseDetail;
            }

            var args =
            {
                parameters: {
                    mascad_id: req.body.mascadId,
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });

        }

        function getSigDevSource(req, res, next) {
           var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSigDevSource;
            }

            var args =
            {
                parameters: {
                    ssnid: req.headers['x-session-token']
                },
                headers:{'Content-Type':'application/json'}
            };

            client.get(config.restcall.url + '/' +  service.name  + '/' + methodName, args, function(data,response)
            {
                res.status(response.statusCode).send(data);
            });

        }

    };

})(module.exports);
