
(function(chartRoutes)
{
    var async = require('async');
    var u = require('underscore');
    var fs = require('fs');

    function getImageBase64Data(imagePath) {
        var path = process.cwd() + '\\' + imagePath.replace(/\//g, '\\');
        console.log('--->' + path);
        var content = fs.readFileSync(path, 'base64');
        return content;
    };

    chartRoutes.init = function (app, config)
    {
        var client = config.restcall.client;
        var config = config;

        var dividendImageData = getImageBase64Data('src/assets/icons/images/Stock_Dividend.jpg');
        var earningsImageData = getImageBase64Data('src/assets/icons/images/Stock_Earnings.jpg');
        var splitImageData = getImageBase64Data('src/assets/icons/images/Stock_Split.jpg');

        config.parallel([
            app.post('/api/getChartData', getChartData),
            app.post('/api/findTickers', getTickers),
            app.post('/api/getIndices', getIndices),
            app.post('/api/getCompetitors', getCompetitors),
            app.post('/api/getSavedChartData', getSavedChartData),
            app.post('/api/saveChartSettings', saveChartSettings),
            app.post('/api/saveChartAllSettings', saveChartAllSettings),
            app.post('/api/createTemplatePDFRequest', createTemplatePDFRequest),
            app.post('/api/downloadTemplatePDF', downloadTemplatePDF)
        ]);

        function getChartData(req, res, next) {
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getStockData;
            }

            var  tickers= req.body.tickers,
                period= req.body.period,
                ssnid= req.body.ssnid,
                companyId = req.body.companyId,
                splits= req.body.splits,
                dividends= req.body.dividends,
                earnings= req.body.earnings,
                end_date = req.body.end_date,
                start_date = req.body.start_date;

            var getChartDataVar = config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id='+companyId+'&peers='+encodeURIComponent(tickers)
                + '&period=' +period
                + '&ssnid=' +ssnid
                +'&splits='+splits
                +'&dividends='+dividends
                +'&earnings='+earnings
                +'&date_start='+start_date
                + '&date_end=' + end_date;
            //console.log(getChartDataVar);

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id='+companyId+'&peers='+encodeURIComponent(tickers)
                + '&period=' +period
                + '&ssnid=' +ssnid
                +'&splits='+splits
                +'&dividends='+dividends
                +'&earnings='+earnings
                +'&date_start='+start_date
                +'&date_end='+end_date
                , function (data, response) {
                    res.send(data);
                });
        }

        //this creates new charts or remove not iterated ones
        function saveChartAllSettings(req, res, next) {
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveChartSettings;
            }

            var projectId = req.body.project_id,
                companyId = req.body.company_id,
                stepId = req.body.step_id,
                mnemonicId = req.body.mnemonic,
                itemId = req.body.item_id,
                ssnid= req.headers['x-session-token'],
                chartSettings = req.body.chartSettings;
            //chartsettings should be a array and and defined
            var args = {
                data: {
                    project_id: parseInt(projectId),
                    company_id: parseInt(companyId),
                    step_id: parseInt(stepId),
                    mnemonic : mnemonicId,
                    item_id : itemId,
                    ssnid:ssnid,
                    delete_ignored:true,
                    chartSettings : chartSettings
                },
                headers: {"Content-Type": "application/json"}

            };

            var saveChartSettingsAPI = config.restcall.url + '/' + service.name + '/' + methodName,args;
            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                res.send(data);
            });
        }

        //this ceates a single chart
        function saveChartSettings(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveChartSettings;
            }

            var  tickers= req.body.tickers,
                period= req.body.period,
                ssnid= req.headers['x-session-token'],
                splits= req.body.splits,
                dividends= req.body.dividends,
                earnings= req.body.earnings,
                end_date = req.body.end_date,
                start_date = req.body.start_date,
                chart_title = req.body.chartTitle,
                chart_id = req.body.chart_id;


            var chartSetting = {
                chart_title: chart_title,
                peers: tickers,
                period:period,
                date_start:start_date,
                date_end:end_date,
                dividends: dividends,
                earnings: earnings,
                splits:splits,
                chart_id:chart_id
            };

            if(chart_id){
                chartSetting.chartId  = parseInt(chart_id);
            }

            var args = {
                data : {
                    project_id: parseInt(projectId),
                    company_id: parseInt(companyId),
                    step_id: parseInt(stepId),
                    ssnid:ssnid,
                    data : [chartSetting],
                    delete_ignored: false
                },
                headers: { "Content-Type": "application/json" }
            };
            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                res.send(data);
            });
        }

        function getTickers(req, res, next) {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.findTickers;
            }

            var  keyword= req.body.keyword,
                ssnid= req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?keyword='+keyword +'&ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });
        }

        function getIndices (req, res , next ) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getIndices;
            }

            var  ssnid= req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });

        }

        function getCompetitors (req, res , next ) {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getCompetitors;
            }

            var  ssnid= req.headers['x-session-token'];
            var companyId = req.body.companyId;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id=' + companyId + '&ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });

        }

        function getSavedChartData  (req, res , next ) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSavedChartData;
            }

            var ssnid = req.body.ssnid;
            var  stepId= req.body.step_id;
            var  projectId= req.body.project_id;
            var  mnemonic= req.body.mnemonic;
            var  itemId= req.body.item_id;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid,
                function (data, response)
                {
                    res.status(response.statusCode).send(getChartSettings(data));
                });

        }

        function getChartSettings(data){
            var result = {
                newCharts: [],
                legacyCharts: []
            };

            if(data && data.chartSettings)
            {
                u.each(data.chartSettings, function(savedChart)
                {
                    if (savedChart.chartType  === 'IMGURL'){
                        result.legacyCharts.push(savedChart);
                    }
                    else  if (savedChart.chartType  === 'JSCHART'){
                        var chart = {};
                        chart.chartType = 'JSCHART';
                        chart.settings = {
                            mainStock : "",
                            companyName : savedChart.chart_title,
                            selectedPeriod : savedChart.period.toUpperCase(),
                            selectedIndicesList : [],
                            selectedPeerList : [],
                            selectedCompetitorsList : [],
                            searchedStocks : [],
                            to: {},
                            from: {},
                            isSplits : (savedChart.dividends === 'Y')? true : false,
                            isEarnings : (savedChart.earnings === 'Y')? true : false,
                            isDividents : (savedChart.splits === 'Y')? true : false,
                            eventOptionVisibility : false,
                            dateOptionVisibility : false,
                            comparisonOptionVisibility : false,
                            company_id : savedChart.company_id,
                            chart_id : savedChart.chart_id,
                            chart_date : savedChart.chart_date,
                            date_start : savedChart.date_start,
                            date_end : savedChart.date_end,

                        };

                        if(savedChart.peers){
                            var peers = savedChart.peers.split(',');
                            for (var i = 0; i < peers.length;  i++) {
                                var peer = peers[i].trim();
                                if(peer.charAt(0) === '^') {
                                    chart.settings.selectedIndicesList.push(peer.substring(1, peer.length));
                                    //chart.settings.selectedCompetitorsList.push(peer.substring(1, peer.length));

                                }
                                if(peer.charAt(0) === '@') {
                                    //chart.settings.selectedIndicesList.push(peer.substring(1, peer.length));
                                    chart.settings.selectedCompetitorsList.push(peer.substring(1, peer.length));

                                }
                                else if(peer.charAt(0)!=='^' && peer.charAt(0)!=='@') {
                                    chart.settings.selectedPeerList.push(peer);
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

        function createTemplatePDFRequest(req, res, next) {

            var context = new Object();
            context.service = getServiceDetails('charts');
            context.ssnid = req.headers['x-session-token'];
            context.project_id = req.body.project_id;
            context.user_id = req.body.user_id;
            context.file_name = encodeURIComponent((req.body.file_name).trim());
            context.company_name = encodeURIComponent(req.body.company_name.trim());
            context.user_name = encodeURIComponent((req.body.user_name).trim());
//            context.request_id = 0;
            context.errorMessages = new Array();

            function isDate(dateVal) {
                var d = new Date(dateVal);
                return d.toString() === 'Invalid Date' ? false : true;
            };

            function createPath(reqID) {
                var subContext = new Object();
                subContext.fs = require("fs");
                subContext.mkdirp = require('mkdirp');
                subContext.requestDir = context.service.exportOptions.pdfRequestDir + reqID;
                subContext.chartDir = subContext.requestDir + '/charts/';
                if (!subContext.fs.existsSync(subContext.requestDir)) {
                    subContext.mkdirp.sync(subContext.chartDir);
                }
                return subContext.chartDir;
            }

            function getAllChartSettings(callback) {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                    subContext.methodName = context.service.methods.getAllChartSettings;
                }

                subContext.url = config.restcall.url + '/' + context.service.name + '/' + subContext.methodName + '?project_id=' + context.project_id + '&ssnid=' + context.ssnid;

                client.get(subContext.url,
                    function (data, response) {
                        subContext.chartSettings = null;
                        try {
                            subContext.chartSettings = getAllChartSettingsResponse(data);
                        }
                        catch (exception) {
                            console.log(exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, [subContext.chartSettings, context.errorMessages]);
                    }
                ).on('error', function (err) {
                        console.log(err);
                        subContext.message = 'Error connecting to getAllChartSettings. url:' + url;
                        context.errorMessages.push(subContext.message);
                        callback(null, [null, context.errorMessages]);
                    }
                );
            }

            function getAllChartSettingsResponse(data) {
                var subContext = new Object();
                if (data && data.chartSettings) {
                    subContext.chartSettings = data.chartSettings;
                } else {
                    subContext.chartSettings = [];
                }
                subContext.n = subContext.chartSettings.length;
                for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                    subContext.chartSetting = subContext.chartSettings[subContext.i];
                    subContext.chartSetting.output = {};
                    if (subContext.chartSetting.period) {
                        subContext.period = subContext.chartSetting.period.toUpperCase();
                    } else {
                        subContext.period = '';
                    }

                    /*
                     chartDataObj = {
                     tearsheet: {
                     type: 'stock',
                     isChartTitle: true,
                     isMainChart: false,
                     mnemonicId: chartSetting.mnemonic,
                     itemId: chartSetting.item_id,
                     chartOrder: i
                     },
                     filterState: {
                     splits: (chartSetting.splits === 'Y') ? true : false,
                     earnings: (chartSetting.earnings === 'Y') ? true : false,
                     dividends: (chartSetting.dividends === 'Y') ? true : false,
                     interval: period,
                     mainStock: '',
                     selectedIndices: [],
                     selectedPeers: [],
                     selectedCompetitors: [],
                     chart_id: chartSetting.chart_id,
                     chart_date: chartSetting.chart_date,
                     date_start: chartSetting.date_start,
                     date_end: chartSetting.date_end,
                     title: chartSetting.chart_title,
                     chart_type: chartSetting.chartType
                     },
                     msChartPlaceHolderId: 'chart-'.concat(i),
                     title: chartSetting.chart_title,
                     chartType: chartSetting.chartType
                     };

                     if (chartSetting.peers) {
                     var peers = chartSetting.peers.split(',');
                     for (var j = 0; j < peers.length; j++) {
                     var peer = peers[j].trim();
                     switch (peer.charAt(0)) {
                     case '^':
                     chartDataObj.filterState.selectedIndices.push(peer.substring(1, peer.length));
                     break;
                     case '@':
                     chartDataObj.filterState.selectedCompetitors.push(peer.substring(1, peer.length));
                     break;
                     default:
                     chartDataObj.filterState.selectedPeers.push(peer);
                     break;
                     }
                     }
                     }
                     chartDataObjs.push(chartDataObj);
                     chartSetting.output.chartDataObj = chartDataObj;
                     */

                    if (isDate(subContext.chartSetting.date_start)) {
                        subContext.from = new Date(subContext.chartSetting.date_start);
                    }
                    if (isDate(subContext.chartSetting.date_end)) {
                        subContext.to = new Date(subContext.chartSetting.date_end);
                    }
                    if (subContext.period === 'CUSTOM') {
                        if (subContext.from) {
                            subContext.start_date = subContext.from.getFullYear() + '-' + (subContext.from.getMonth() + 1) + '-' + subContext.from.getDate();
                        }
                        if (subContext.to) {
                            subContext.end_date = subContext.to.getFullYear() + '-' + (subContext.to.getMonth() + 1) + '-' + subContext.to.getDate();
                        };
                    }

                    if (subContext.chartSetting.peers) {
                        subContext.chartDataPeers = encodeURIComponent(subContext.chartSetting.peers);
                    } else {
                        subContext.chartDataPeers = '';
                    }

                    //fetchChartData(chartSetting.peers, chartSetting.period.toUpperCase(), chartSetting.splits, chartSetting.earnings, chartSetting.dividends, start_date, end_date, chartSetting.company_id);
                    subContext.chartSetting.output.url = config.restcall.url + '/' + context.service.name + '/' + context.service.methods.getStockData
                        + '?company_id=' + subContext.chartSetting.company_id
                        + '&peers=' + subContext.chartDataPeers
                        + '&period=' + subContext.period
                        + '&ssnid=' + context.ssnid
                        + '&splits=' + subContext.chartSetting.splits
                        + '&dividends=' + subContext.chartSetting.dividends
                        + '&earnings=' + subContext.chartSetting.earnings
                        + '&date_start=' + subContext.start_date
                        + '&date_end=' + subContext.end_date;
                }
                return subContext.chartSettings;
            }

            function setupGetChartDataPoints(input, callback) {
                var subContext = new Object();
                subContext.chartSettings = input[0];
                subContext.errorMessages = input[1];

                if ((subContext.chartSettings == null) || (subContext.errorMessages.length > 0)) {
                    callback(null, [subContext.chartSettings, subContext.errorMessages]);
                } else {
                    async.map(subContext.chartSettings, getChartDataPoints, function (err, results) {
                        u.each(results, function (item) {
                            if (item) {
                                subContext.errorMessages.push(item);
                            }
                        });
                        callback(null, [subContext.chartSettings, subContext.errorMessages]);
                    });
                }
            }

            function convServiceResptoChartFormat(data) {
                var subContext = new Object();
                subContext.results = data;
                if (subContext.results && subContext.results.stockChartPrimaryData) {
                    subContext.outArr = [];
                    subContext.xdataArr = [];
                    subContext.datasetArr = [];
                    subContext.firstDatasetArr = [];
                    subContext.secondDatasetArr = [];
                    subContext.firstchartSerArr = [];
                    subContext.seriesByVolumes = {};
                    subContext.seriesByTickers = {};
                    subContext.secondchartSerArr = [];
                    subContext.primarTickerName = '';
                    subContext.firstChartTitle = 'Price';
                    if (subContext.results && subContext.results.stockChartPrimaryData && subContext.results.stockChartPrimaryData.length > 0)
                        subContext.primarTickerName = subContext.results.stockChartPrimaryData[0].ticker;
                    subContext.peerData = null;
                    subContext.lengthDiff = false;

                    if (subContext.results.stockChartPeerData && subContext.results.stockChartPeerData.length) {
                        subContext.peerData = subContext.results.stockChartPeerData;
                        if (subContext.results.stockChartPeerData.length > 0) {
                            subContext.lengthDiff = true;
                        }
                    }

                    if (subContext.peerData) {
                        subContext.firstChartTitle = 'Percent Change';
                    }

                    for (subContext.i = 0; subContext.i < subContext.results.stockChartPrimaryData.length; subContext.i++) {

                        subContext.stock = subContext.results.stockChartPrimaryData[subContext.i];
                        subContext.applyDividend = false;
                        subContext.applyEarning = false;
                        subContext.applySplit = false;
                        //if(i%90 == 0)
                        subContext.xdataArr[subContext.xdataArr.length] = subContext.stock.dataDate.substring(0, 10);

                        subContext.firstDatasetArr[subContext.firstDatasetArr.length] = parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose);
                        subContext.secondDatasetArr[subContext.secondDatasetArr.length] = parseFloat(subContext.stock.volume);

                        if (!subContext.seriesByTickers[subContext.stock.ticker]) {
                            subContext.seriesByTickers[subContext.stock.ticker] = [];
                        }

                        if (subContext.results.dividends) {
                            for (subContext.dividendCntr = 0; subContext.dividendCntr < subContext.results.dividends.length; subContext.dividendCntr++) {
                                if (subContext.stock.dataDate == subContext.results.dividends[subContext.dividendCntr].dataDate) {
                                    subContext.applyDividend = true;
                                }
                            }
                        }

                        if (subContext.results.earnings) {
                            for (subContext.earningCntr = 0; subContext.earningCntr < subContext.results.earnings.length; subContext.earningCntr++) {
                                if (subContext.stock.dataDate == subContext.results.earnings[subContext.earningCntr].dataDate) {
                                    subContext.applyEarning = true;
                                }
                            }
                        }

                        if (subContext.results.splits) {
                            for (subContext.splitsCntr = 0; subContext.splitsCntr < subContext.results.splits.length; subContext.splitsCntr++) {
                                if (subContext.stock.dataDate == subContext.results.splits[subContext.splitsCntr].dataDate) {
                                    subContext.applySplit = true;
                                }
                            }
                        }
                        if (subContext.applyDividend) {
                            subContext.seriesByTickers[subContext.stock.ticker].push({
                                'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(data:image/jpeg;base64,' + dividendImageData + ')'
                                }
                            });
                        }
                        else if (subContext.applyEarning) {
                            subContext.seriesByTickers[subContext.stock.ticker].push({
                                'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(data:image/jpeg;base64,' + earningsImageData + ')'
                                }
                            });
                        }
                        else if (subContext.applySplit) {
                            subContext.seriesByTickers[subContext.stock.ticker].push({
                                'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(data:image/jpeg;base64,' + splitImageData + ')'
                                }
                            });
                        }
                        else {
                            subContext.seriesByTickers[subContext.stock.ticker].push(parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose));
                        }

                        if (!subContext.seriesByVolumes[subContext.stock.ticker]) {
                            subContext.seriesByVolumes[subContext.stock.ticker] = [];
                        }
                        subContext.seriesByVolumes[subContext.stock.ticker].push(parseFloat(subContext.stock.volume));
                    }

                    if (subContext.peerData) {

                        for (subContext.i = 0; subContext.i < subContext.results.stockChartPeerData.length; subContext.i++) {

                            subContext.stock = subContext.results.stockChartPeerData[subContext.i];
                            if (subContext.stock.ticker !== subContext.primarTickerName) {
                                subContext.xdataArr[subContext.xdataArr.length] = subContext.stock.dataDate;
                                subContext.firstDatasetArr[subContext.firstDatasetArr.length] = parseFloat(subContext.stock.percentChange);
                                // secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

                                if (!subContext.seriesByTickers[subContext.stock.ticker]) {
                                    subContext.seriesByTickers[subContext.stock.ticker] = [];
                                }
                                subContext.seriesByTickers[subContext.stock.ticker].push(parseFloat(subContext.stock.percentChange));

                                if (!subContext.seriesByVolumes[subContext.stock.ticker]) {
                                    subContext.seriesByVolumes[subContext.stock.ticker] = [];
                                }
                                subContext.seriesByVolumes[subContext.stock.ticker].push(parseFloat(subContext.stock.volume));
                            }
                        }
                    }


                    // var stockName = results.stockChartPeerData[0].ticker;
                    subContext.seriesSet = [];
                    subContext.dataSet = [];
                    for (subContext.key in subContext.seriesByTickers) {
                        if (subContext.seriesByTickers.hasOwnProperty(subContext.key)) {
                            subContext.seriesSet.push({
                                data: subContext.seriesByTickers[subContext.key],
                                name: subContext.key
                            });
                            subContext.dataSet.push(data);
                        }
                    }
                    subContext.volumeSet = [];
                    for (subContext.key in subContext.seriesByVolumes) {
                        if (subContext.seriesByVolumes.hasOwnProperty(subContext.key)) {
                            subContext.volumeSet.push({
                                data: subContext.seriesByVolumes[subContext.key]
                            });
                            subContext.dataSet.push(data);
                        }
                    }
                    //console.log('seriesSet----->',seriesSet);
                    // firstchartSerArr[firstchartSerArr.length] = {"name":stockName, "data": firstDatasetArr};
                    //console.log('peerData: ' + peerData);

                    subContext.datasetArr[subContext.datasetArr.length] = {
                        "name": "",
                        "yaxisTitle": subContext.firstChartTitle,
                        "xaxisTitle": "",
                        "series": subContext.seriesSet,
                        "data": subContext.dataSet,
                        "type": "spline",
                        "valueDecimals": 1,
                        "showlegend": true,
                        "showxaxisLabel": false,
                        "showtooltip": true,
                        "spacingTop": 30,
                        "xAxis": {
                            labels: {
                                step: 3
                            }
                        }
                    };
                    subContext.secondchartSerArr[subContext.secondchartSerArr.length] = {
                        "data": subContext.secondDatasetArr
                        //,"pointStart": Date.UTC(xdataArr[0].split('-')[0], xdataArr[0].split('-')[1]-1, xdataArr[0].split('-')[2])
                        //,"pointStart": Date(xdataArr[0])
                        //,"pointInterval": 24 * 3600 * 1000
                    };
                    subContext.datasetArr[subContext.datasetArr.length] = {
                        "name": "",
                        "yaxisTitle": "Volume (Millions)",
                        "xaxisTitle": "",
                        "series": subContext.secondchartSerArr,
                        "data": subContext.secondDatasetArr,
                        "type": "column",
                        "valueDecimals": 0,
                        "showlegend": false,
                        "showxaxisLabel": true,
                        "showtooltip": false,
                        "spacingTop": 7
                    };

                    subContext.outArr[subContext.outArr.length] = {
                        "xData": subContext.xdataArr,
                        "datasets": subContext.datasetArr
                    };
                    //console.log('================================' +JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data))
                    //console.log(JSON.stringify(data));
                    //console.log('JSON.stringify(outArr).slice(1,-1): ', JSON.stringify(outArr).slice(1,-1));
                    //console.log('secondchartSerArr.length after: ' + secondchartSerArr.length);
                    return JSON.stringify(subContext.outArr).slice(1, -1) + '|' + JSON.stringify(data);
                }
            }

            function getChartDataPoints(chartSetting, callback) {
                var subContext = new Object();
                if (chartSetting && chartSetting.output) {
                    console.log(context.service.methods.getStockData + ' API call---->', chartSetting.output.url);
                    client.get(chartSetting.output.url,
                        function (data, response) {
                            subContext.errorMessage = null;
                            try {
                                subContext.dataPointObj = convServiceResptoChartFormat(data);
                                subContext.dataPointList = subContext.dataPointObj.split('|');
                                chartSetting.output.activity = JSON.parse(subContext.dataPointList[0]);
                                chartSetting.output.primarystockresp = JSON.parse(subContext.dataPointList[1]);

                                //
                                //activity.datasets[] =  dataset[i]
                                //
                                subContext.activity = chartSetting.output.activity;
                                subContext.dataset = subContext.activity.datasets[0];
                                subContext.stockChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: subContext.dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: subContext.dataset.type,
                                        width: context.service.exportOptions.stockChartWidth,
                                        height: context.service.exportOptions.stockChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: subContext.dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: subContext.dataset.showlegend,
                                        align: 'top',
                                        verticalAlign: 'top',
                                        x: 220,
                                        y: -25,
                                        itemDistance: 85,
                                        symbolHeight: 20,
                                        symbolWidth: 6,
                                        symbolRadius: 4

                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        categories: subContext.activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: subContext.dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: subContext.dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: subContext.dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: subContext.dataset.showtooltip
                                    },
                                    series: subContext.dataset.series
                                };
                                chartSetting.output.stockChartSetting = subContext.stockChartSetting;

                                subContext.dataset = subContext.activity.datasets[1];
                                subContext.volumeChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: subContext.dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: subContext.dataset.type,
                                        width: context.service.exportOptions.volumeChartWidth,
                                        height: context.service.exportOptions.volumeChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: subContext.dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: subContext.dataset.showlegend,
                                        align: 'top',
                                        verticalAlign: 'top',
                                        x: 220,
                                        y: -25,
                                        itemDistance: 85,
                                        symbolHeight: 20,
                                        symbolWidth: 6,
                                        symbolRadius: 4

                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        categories: subContext.activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: subContext.dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: subContext.dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: subContext.dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: subContext.dataset.showtooltip
                                    },
                                    series: subContext.dataset.series
                                };
                                chartSetting.output.volumeChartSetting = subContext.volumeChartSetting;
                                chartSetting.output.chartName = (chartSetting.step_id) +
                                    "." + (chartSetting.mnemonic) +
                                    "." + (chartSetting.item_id) +
                                    "." + (chartSetting.chart_id);

                            } catch (exception) {
                                subContext.errorMessage = exception.message;
                            }

                            //var chartDataFileName = chartSetting.output.chartName + ".txt";
                            callback(null, subContext.errorMessage);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            subContext.message = 'Error connecting to getStockData. url:' + chartSetting.output.url;
                            callback(null, subContext.message);
                        }
                    );
                } else {
                    console.log(context.service.methods.getStockData + ' API call----> MISSING');
                    callback(null, "Invalid getStockData url.");
                }
            }

            function getPDFRequestId(input, callback) {
                var subContext = new Object();
                subContext.chartSettings = input[0];
                subContext.errorMessages = input[1];

                if ((subContext.chartSettings == null) || (subContext.errorMessages.length > 0)) {
                    callback(null, [null, subContext.errorMessages]);
                } else {

                    subContext.service = getServiceDetails('templateManager');
                    subContext.methodName = '';
                    if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                        subContext.methodName = subContext.service.methods.createTemplatePDFRequest;
                    }

                    subContext.stepArr = [];
                    try {
                        u.each(subContext.chartSettings,
                            function (chartSetting, index) {
                                if (u.indexOf(subContext.stepArr, chartSetting.step_id) == -1) {
                                    subContext.stepArr.push(chartSetting.step_id);
                                }
                            }
                        );
                        subContext.args = 'project_id=' + context.project_id + '&user_id=' + context.user_id + '&step_ids=' + subContext.stepArr.join(',') + '&file_name=' + (context.file_name).split(' ').join('+') +
                            '&company_name=' + (context.company_name).split(' ').join('+') + '&user_name=' + (context.user_name).split(' ').join('+') + '&ssnid=' + context.ssnid;

                        subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
                    } catch (exception) {
                        subContext.errorMessages.push(exception.message);
                        callback(null, [null, subContext.errorMessages]);
                    }

                    console.log(subContext.methodName + ' API call---->', subContext.url);
                    client.get(subContext.url,
                        function (data, response) {
                            subContext.pdfRequest = null;
                            try {
                                subContext.request_id = data.request.requestNo;
                                subContext.pdfRequest = {
                                    request_id: subContext.request_id,
                                    chartSettings: subContext.chartSettings,
                                    chartPath: ''
                                };
                                console.log("Created PDF request: " + subContext.request_id);
                                subContext.pdfRequest.chartPath = createPath(subContext.request_id);
                            } catch (exception) {
                                subContext.errorMessages.push(exception.message);
                            }
                            callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            subContext.message = 'Error connecting to getPDFRequestId. url:' + subContext.url;
                            subContext.errorMessages.push(subContext.message);
                            callback(null, [null, subContext.errorMessages]);
                        }
                    );
                }
            }

            function setupGetChartImages(input, callback) {
                var subContext = new Object();
                subContext.pdfRequest = input[0];
                subContext.errorMessages = input[1];

                if ((subContext.pdfRequest == null) || (subContext.errorMessages.length > 0)) {
                    callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                } else {
                    subContext.chartObjArr = [];

                    try {
                        u.each(subContext.pdfRequest.chartSettings,
                            function (chartSetting, index) {
                                //var fs = require("fs");

                                subContext.filename = chartSetting.output.chartName + '.part0.svg';
                                subContext.chartObj = {
                                    infile: JSON.stringify(chartSetting.output.stockChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: subContext.pdfRequest.chartPath + subContext.filename
                                };
                                //fs.writeFile(pdfRequest.chartPath + chartSetting.output.chartName + '.part0.txt', JSON.stringify(chartObj));
                                subContext.chartObjArr.push(subContext.chartObj);

                                subContext.filename = chartSetting.output.chartName + '.part1.svg';
                                subContext.chartObj = {
                                    infile: JSON.stringify(chartSetting.output.volumeChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: subContext.pdfRequest.chartPath + subContext.filename
                                };
                                subContext.chartObjArr.push(subContext.chartObj);
                            }
                        );
                    } catch (exception) {
                        subContext.errorMessages.push(exception.message);
                        subContext.chartObjArr.length = 0;
                        callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                    }

                    async.map(subContext.chartObjArr, getChartImage, function (err, results) {

                        u.each(results, function (item) {
                            if (item) {
                                subContext.errorMessages.push(item);
                            }
                        });
                        callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                    });
                }
            }

            function getChartImage(chartObj, callback) {
                var subContext = new Object();
                subContext.args = {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: chartObj
                };

                //console.log("Output File: " + chartObj.outfile);
                client.post(context.service.exportOptions.phatomjsURL, subContext.args, function (data, response) {
                    console.log("Finished getChartImage call: " + data);
                    callback(null, null);
                }).on('error', function (err) {
                    console.log(err);
                    callback(null, 'Error connecting to chart to svg service.' + chartObj);
                });
            }

            function setSVGFileStatus(input, callback) {
                var subContext = new Object();
                subContext.pdfRequest = input[0];
                subContext.errorMessages = input[1];

                if ((subContext.pdfRequest == null) || (subContext.errorMessages.length > 0)) {
                    callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                } else {
                    subContext.service = getServiceDetails('templateManager');
                    subContext.methodName = '';
                    if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                        subContext.methodName = subContext.service.methods.setSVGFileStatus;
                    }

                    subContext.args = 'request_id=' + subContext.pdfRequest.request_id + '&svg_files_ready=Y&ssnid=' + context.ssnid;
                    subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
                    console.log(subContext.methodName + ' API call---->', subContext.url);
                    client.get(subContext.url,
                        function (data, response) {
                            try {
                                subContext.pdfRequest.responseCode = response.statusCode;
                                //reduce the amount of data being sent back to client, we need it for debugging chart problems
                                subContext.pdfRequest.chartSettings = undefined;
                            } catch (exception) {
                                console.log(exception);
                                subContext.errorMessages.push(exception.message);
                            }
                            callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            subContext.message = 'Error connecting to setSVGFileStatus. url:' + subContext.url;
                            errorMessages.push(subContext.message);
                            callback(null, [subContext.pdfRequest, subContext.errorMessages]);
                        }
                    );
                }
            }

            function getTemplatePDFStatus(result, next) {
                var subContext = new Object();
                subContext.service = getServiceDetails('templateManager');
                subContext.methodName = '';
                if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                    subContext.methodName = subContext.service.methods.getTemplatePDFStatus;
                }

                subContext.args = 'request_id=' + result.request_id + '&ssnid=' + context.ssnid;
                subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
                //console.log(methodName + ' API call---->', url);
                subContext.statusResponse = {};

                client.get(subContext.url, function (data, response) {
                        try {
                            if (data.responseInfo.code === 200) {
                                subContext.statusResponse.error = false;
                                result.PDFStatusCode = data.request.status
                                result.PDFHTTPResponseCode = data.responseInfo.code;
                                result.PDFPercentComplete = data.request.percentComplete;
                                console.log('[' + result.request_id + "]Code: " + result.PDFStatusCode + " At " + data.request.percentComplete + "%");
                                if (data.request.status === "C") {
                                    console.log('[' + result.request_id + "]PDF generation complete.");
                                    subContext.statusResponse.pdfRequest = result;
                                    console.log('[finished]getTemplatePDFStatus url:' + subContext.url);
                                    next(subContext.statusResponse);
                                } else {
                                    console.log('[' + result.request_id + "]PDF generation " + result.PDFPercentComplete + "% complete.");
                                    subContext.room = 'pdf_' + result.request_id;
                                    subContext.data = {
                                        requestId: result.request_id,
                                        progress: result.PDFPercentComplete
                                    };
                                    config.socketIO.socket.emit('[' + subContext.room + ']pdf-download-status', subContext.data);
                                    setTimeout(function () {
                                        next();
                                    }, 1000);
                                }
                            } else {
                                subContext.statusResponse.error = true;
                                console.log('[else]getTemplatePDFStatus return invalid status. url:' + subContext.url);
                                next(subContext.statusResponse);
                            }
                        } catch (exception) {
                            subContext.statusResponse.error = true;
                            console.log('[try/catch]Error connecting to getTemplatePDFStatus. url:' + subContext.url);
                            next(subContext.statusResponse);
                        }
                    }
                ).on('error', function (err) {
                        console.log(err);
                        console.log('[on error]Error connecting to getTemplatePDFStatus. url:' + subContext.url);
                        subContext.statusResponse.error = true;
                        next(subContext.statusResponse);
                    }
                );
            }

            async.waterfall([getAllChartSettings, setupGetChartDataPoints, getPDFRequestId, setupGetChartImages, setSVGFileStatus],
                function (err, input) {

                    context.result = input[0];
                    context.errorMessages = input[1];

                    console.log('Input --');
                    console.log(input);

                    if ((context.result == null) || (context.errorMessages.length &&
                                             context.errorMessages.length > 0)) {
                        console.log('Error occured in PDF Download request.');
                        console.log(context.errorMessages);
                        if (context.result == null) {
                            context.result = { errorMessages: context.errorMessages };
                        } else {
                            context.result.errorMessages = context.errorMessages;
                        }
                        console.log('Returning error results back to caller.');
                        res.send(context.result);
                    } else {
                        context.result.errorMessages = context.errorMessages;
                        console.log('setSVGFileStatus returned status: ' + context.result.responseCode);
                        if (context.result.responseCode == 200) {
                            async.forever(
                                function (next) {
                                    getTemplatePDFStatus(context.result, next);
                                },
                                function (asyncResult) {
                                    if (asyncResult.error) {
                                        console.log('---->Request ' + context.result.request_id + ' is incomplete.');
                                        //indicate an error during status check
                                        context.result.PDFPercentComplete = -1;
                                    } else {
                                        console.log('---->Request ' + context.result.request_id + ' is complete.');
                                    }
                                    context.room = 'pdf_' + context.result.request_id;
                                    context.data = {
                                        requestId: context.result.request_id,
                                        progress: context.result.PDFPercentComplete
                                    };
                                    console.log('Sending socket message for request:' + context.data.requestId);
                                    config.socketIO.socket.emit('[' + context.room + ']pdf-download-status', context.data);
                                }
                            );

                            //No errors, sent response back to call to add entry to notification center
                            res.send(context.result);
                        } else {
                            context.result.errorMessages.push('setSVGFileStatus returned status: ' + context.result.responseCode);
                            console.log('Returning error setSVGStatus response code back to caller.');
                            res.send(context.result);
                        }
                    }
                }
            );
        }

        function downloadTemplatePDF(req, res, next) {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';
            context.ssnid = req.headers['x-session-token'];
            context.request_id = req.body.request_id;
            context.file_name = encodeURIComponent((req.body.file_name).trim());

            if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                context.methodName = context.service.methods.downloadTemplatePDF;
            }

            context.url = config.restcall.url + '/' + context.service.name + '/' + context.methodName + '?request_id=' + context.request_id + '&fileName=' + context.file_name + '&ssnid=' + context.ssnid;
            console.log(context.url);
            client.get(context.url, { responseType: 'arraybuffer' }, function (data, response) {
                if (data) {
                    res.writeHead(200,
                        {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': 'attachment; filename=' + context.file_name,
                            'Content-Transfer-Encoding': 'BINARY',
                            'Content-Length': data.length
                        }
                    );
                    res.write(data);
                    res.end();
                }
            });
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);
