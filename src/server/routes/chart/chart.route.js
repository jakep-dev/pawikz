
(function(chartRoutes)
{
    var async = require('async');
    var u = require('underscore');

    chartRoutes.init = function (app, config)
    {
        var client = config.restcall.client;
        var config = config;

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
                +'&date_end='+end_date;

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

            var service = getServiceDetails('charts');
            var i;
            var ssnid = req.headers['x-session-token'];
            var project_id = req.body.project_id;
            var user_id = req.body.user_id;
            var file_name = encodeURIComponent((req.body.file_name).trim());
            var company_name = encodeURIComponent(req.body.company_name.trim());
            var user_name = encodeURIComponent((req.body.user_name).trim());
            var request_id = 0;

            var errorMessages = new Array();

            function isDate(dateVal) {
                var d = new Date(dateVal);
                return d.toString() === 'Invalid Date' ? false : true;
            };

            function createPath(reqID) {
                var fs = require("fs");
                var mkdirp = require('mkdirp');
                var requestDir = service.exportOptions.pdfRequestDir + reqID;
                var chartDir = requestDir + '/charts/';
                if (!fs.existsSync(requestDir)) {
                    mkdirp.sync(chartDir);
                }
                return chartDir;
            }

            function getAllChartSettings(callback) {

                var methodName = '';
                if (!u.isUndefined(service) && !u.isNull(service)) {
                    methodName = service.methods.getAllChartSettings;
                }

                var url = config.restcall.url + '/' + service.name + '/' + methodName + '?project_id=' + project_id + '&ssnid=' + ssnid;

                client.get(url,
                    function (data, response) {
                        var chartSettings = null;
                        try {
                            chartSettings = getAllChartSettingsResponse(data);
                        }
                        catch (exception) {
                            console.log(exception);
                            errorMessages.push(exception.message);
                        }
                        callback(null, [chartSettings, errorMessages]);
                    }
                ).on('error', function (err) {
                        console.log(err);
                        var message = 'Error connecting to getAllChartSettings. url:' + url;
                        errorMessages.push(message);
                        callback(null, [null, errorMessages]);
                    }
                );
            }

            function getAllChartSettingsResponse(data) {

                var i;
                var n;
                var chartSettings = data.chartSettings;
                var chartDataObj;
                //var chartDataObjs = [];

                n = chartSettings.length;
                for (i = 0; i < n; i++) {
                    var chartSetting;

                    chartSetting = chartSettings[i];
                    chartSetting.output = {};
                    var period;
                    if (chartSetting.period) {
                        period = chartSetting.period.toUpperCase();
                    } else {
                        period = '';
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

                    var start_date, end_date;
                    var from;
                    if (isDate(chartSetting.date_start)) {
                        from = new Date(chartSetting.date_start);
                    }
                    var to;
                    if (isDate(chartSetting.date_end)) {
                        to = new Date(chartSetting.date_end);
                    }
                    if (period === 'CUSTOM') {
                        if (from) {
                            start_date = from.getFullYear() + '-' + (from.getMonth() + 1) + '-' + from.getDate();
                        }
                        if (to) {
                            end_date = to.getFullYear() + '-' + (to.getMonth() + 1) + '-' + to.getDate();
                        };
                    }

                    var chartDataPeers;
                    if (chartSetting.peers) {
                        chartDataPeers = encodeURIComponent(chartSetting.peers);
                    } else {
                        chartDataPeers = '';
                    }

                    //fetchChartData(chartSetting.peers, chartSetting.period.toUpperCase(), chartSetting.splits, chartSetting.earnings, chartSetting.dividends, start_date, end_date, chartSetting.company_id);
                    chartSetting.output.url = config.restcall.url + '/' + service.name + '/' + service.methods.getStockData
                        + '?company_id=' + chartSetting.company_id
                        + '&peers=' + chartDataPeers
                        + '&period=' + period
                        + '&ssnid=' + ssnid
                        + '&splits=' + chartSetting.splits
                        + '&dividends=' + chartSetting.dividends
                        + '&earnings=' + chartSetting.earnings
                        + '&date_start=' + start_date
                        + '&date_end=' + end_date;
                }
                return chartSettings;
            }

            function setupGetChartDataPoints(input, callback) {

                var chartSettings = input[0];
                var errorMessages = input[1];

                if ((chartSettings == null) || (errorMessages.length > 0)) {
                    callback(null, [chartSettings, errorMessages]);
                } else {
                    async.map(chartSettings, getChartDataPoints, function (err, results) {
                        u.each(results, function (item) {
                            if (item) {
                                errorMessages.push(item);
                            }
                        });
                        callback(null, [chartSettings, errorMessages]);
                    });
                }
            }

            function convServiceResptoChartFormat(data) {
                var results = data;
                if (results && results.stockChartPrimaryData) {
                    var outArr = [];

                    var xdataArr = [];
                    var datasetArr = [];
                    var firstDatasetArr = [];
                    var secondDatasetArr = [];
                    var firstchartSerArr = [];
                    var seriesByVolumes = {};
                    var seriesByTickers = {};
                    var secondchartSerArr = [];
                    var primarTickerName = '';
                    var firstChartTitle = 'Price';
                    if (results && results.stockChartPrimaryData && results.stockChartPrimaryData.length > 0)
                        primarTickerName = results.stockChartPrimaryData[0].ticker;
                    var peerData = null;
                    var lengthDiff = false;

                    if (results.stockChartPeerData && results.stockChartPeerData.length) {
                        peerData = results.stockChartPeerData;
                        if (results.stockChartPeerData.length > 0) {
                            lengthDiff = true;
                        }
                    }

                    if (peerData) {
                        firstChartTitle = 'Percent Change';
                    }

                    for (var i = 0; i < results.stockChartPrimaryData.length; i++) {

                        var stock = results.stockChartPrimaryData[i];
                        var applyDividend = false;
                        var applyEarning = false;
                        var applySplit = false;
                        //if(i%90 == 0)
                        xdataArr[xdataArr.length] = stock.dataDate.substring(0, 10);

                        firstDatasetArr[firstDatasetArr.length] = parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose);
                        secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

                        if (!seriesByTickers[stock.ticker]) {
                            seriesByTickers[stock.ticker] = [];
                        }

                        if (results.dividends) {
                            for (var dividendCntr = 0; dividendCntr < results.dividends.length; dividendCntr++) {
                                if (stock.dataDate == results.dividends[dividendCntr].dataDate) {
                                    applyDividend = true;
                                }
                            }
                        }

                        if (results.earnings) {
                            for (var earningCntr = 0; earningCntr < results.earnings.length; earningCntr++) {
                                if (stock.dataDate == results.earnings[earningCntr].dataDate) {
                                    applyEarning = true;
                                }
                            }
                        }

                        if (results.splits) {
                            for (var splitsCntr = 0; splitsCntr < results.splits.length; splitsCntr++) {
                                if (stock.dataDate == results.splits[splitsCntr].dataDate) {
                                    applySplit = true;
                                }
                            }
                        }
                        if (applyDividend) {
                            seriesByTickers[stock.ticker].push({
                                'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(src/assets/icons/images/Stock_Dividend.jpg)'
                                }
                            });
                        }
                        else if (applyEarning) {
                            seriesByTickers[stock.ticker].push({
                                'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(src/assets/icons/images/Stock_Earnings.jpg)'
                                }
                            });
                        }
                        else if (applySplit) {
                            seriesByTickers[stock.ticker].push({
                                'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                                'marker': {
                                    'enabled': true,
                                    'symbol': 'url(src/assets/icons/images/Stock_Split.jpg)'
                                }
                            });
                        }
                        else {
                            seriesByTickers[stock.ticker].push(parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose));
                        }

                        if (!seriesByVolumes[stock.ticker]) {
                            seriesByVolumes[stock.ticker] = [];
                        }
                        seriesByVolumes[stock.ticker].push(parseFloat(stock.volume));
                    }

                    if (peerData) {

                        for (var i = 0; i < results.stockChartPeerData.length; i++) {

                            var stock = results.stockChartPeerData[i];
                            if (stock.ticker !== primarTickerName) {
                                xdataArr[xdataArr.length] = stock.dataDate;
                                firstDatasetArr[firstDatasetArr.length] = parseFloat(stock.percentChange);
                                // secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

                                if (!seriesByTickers[stock.ticker]) {
                                    seriesByTickers[stock.ticker] = [];
                                }
                                seriesByTickers[stock.ticker].push(parseFloat(stock.percentChange));

                                if (!seriesByVolumes[stock.ticker]) {
                                    seriesByVolumes[stock.ticker] = [];
                                }
                                seriesByVolumes[stock.ticker].push(parseFloat(stock.volume));
                            }
                        }
                    }


                    // var stockName = results.stockChartPeerData[0].ticker;
                    var seriesSet = [];
                    var dataSet = [];
                    for (var key in seriesByTickers) {
                        if (seriesByTickers.hasOwnProperty(key)) {
                            seriesSet.push({
                                data: seriesByTickers[key],
                                name: key
                            });
                            dataSet.push(data);
                        }
                    }
                    var volumeSet = [];
                    for (var key in seriesByVolumes) {
                        if (seriesByVolumes.hasOwnProperty(key)) {
                            volumeSet.push({
                                data: seriesByVolumes[key]
                            });
                            dataSet.push(data);
                        }
                    }
                    //console.log('seriesSet----->',seriesSet);
                    // firstchartSerArr[firstchartSerArr.length] = {"name":stockName, "data": firstDatasetArr};
                    //console.log('peerData: ' + peerData);

                    datasetArr[datasetArr.length] = {
                        "name": "",
                        "yaxisTitle": firstChartTitle,
                        "xaxisTitle": "",
                        "series": seriesSet,
                        "data": dataSet,
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
                    secondchartSerArr[secondchartSerArr.length] = {
                        "data": secondDatasetArr
                        //,"pointStart": Date.UTC(xdataArr[0].split('-')[0], xdataArr[0].split('-')[1]-1, xdataArr[0].split('-')[2])
                        //,"pointStart": Date(xdataArr[0])
                        //,"pointInterval": 24 * 3600 * 1000
                    };
                    datasetArr[datasetArr.length] = {
                        "name": "",
                        "yaxisTitle": "Volume (Millions)",
                        "xaxisTitle": "",
                        "series": secondchartSerArr,
                        "data": secondDatasetArr,
                        "type": "column",
                        "valueDecimals": 0,
                        "showlegend": false,
                        "showxaxisLabel": true,
                        "showtooltip": false,
                        "spacingTop": 7
                    };

                    outArr[outArr.length] = {
                        "xData": xdataArr,
                        "datasets": datasetArr
                    };
                    //console.log('================================' +JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data))
                    //console.log(JSON.stringify(data));
                    //console.log('JSON.stringify(outArr).slice(1,-1): ', JSON.stringify(outArr).slice(1,-1));
                    //console.log('secondchartSerArr.length after: ' + secondchartSerArr.length);
                    return JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data);
                }
            }

            function getChartDataPoints(chartSetting, callback) {

                if (chartSetting && chartSetting.output) {
                    console.log(service.methods.getStockData + ' API call---->', chartSetting.output.url);
                    client.get(chartSetting.output.url,
                        function (data, response) {

                            var errorMessage = null;
                            try {
                                var dataPointObj = convServiceResptoChartFormat(data);
                                var dataPointList = dataPointObj.split('|');
                                chartSetting.output.activity = JSON.parse(dataPointList[0]);
                                chartSetting.output.primarystockresp = JSON.parse(dataPointList[1]);

                                //
                                //activity.datasets[] =  dataset[i]
                                //
                                var activity = chartSetting.output.activity;
                                var dataset = activity.datasets[0];
                                var stockChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: dataset.type,
                                        width: service.exportOptions.stockChartWidth,
                                        height: service.exportOptions.stockChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: dataset.showlegend,
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
                                        categories: activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: dataset.showtooltip
                                    },
                                    series: dataset.series
                                };
                                chartSetting.output.stockChartSetting = stockChartSetting;

                                dataset = activity.datasets[1];
                                var volumeChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: dataset.type,
                                        width: service.exportOptions.volumeChartWidth,
                                        height: service.exportOptions.volumeChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: dataset.showlegend,
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
                                        categories: activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: dataset.showtooltip
                                    },
                                    series: dataset.series
                                };
                                chartSetting.output.volumeChartSetting = volumeChartSetting;
                                chartSetting.output.chartName = (chartSetting.step_id) +
                                    "." + (chartSetting.mnemonic) +
                                    "." + (chartSetting.item_id) +
                                    "." + (chartSetting.chart_id);

                            } catch (exception) {
                                errorMessage = exception.message;
                            }

                            //var chartDataFileName = chartSetting.output.chartName + ".txt";
                            callback(null, errorMessage);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            var message = 'Error connecting to getStockData. url:' + chartSetting.output.url;
                            callback(null, message);
                        }
                    );
                } else {
                    console.log(service.methods.getStockData + ' API call----> MISSING');
                    callback(null, "Invalid getStockData url.");
                }
            }

            function getPDFRequestId(input, callback) {

                var chartSettings = input[0];
                var errorMessages = input[1];

                if ((chartSettings == null) || (errorMessages.length > 0)) {
                    callback(null, [null, errorMessages]);
                } else {

                    var service = getServiceDetails('templateManager');
                    var methodName = '';
                    if (!u.isUndefined(service) && !u.isNull(service)) {
                        methodName = service.methods.createTemplatePDFRequest;
                    }

                    var stepArr = [];
                    var args;
                    var url;

                    try {
                        u.each(chartSettings,
                            function (chartSetting, index) {
                                if (u.indexOf(stepArr, chartSetting.step_id) == -1) {
                                    stepArr.push(chartSetting.step_id);
                                }
                            }
                        );
                        args = 'project_id=' + project_id + '&user_id=' + user_id + '&step_ids=' + stepArr.join(',') + '&file_name=' + (file_name).split(' ').join('+') +
                            '&company_name=' + (company_name).split(' ').join('+') + '&user_name=' + (user_name).split(' ').join('+') + '&ssnid=' + ssnid;

                        url = config.restcall.url + '/' + service.name + '/' + methodName + '?' + args;
                    } catch (exception) {
                        errorMessages.push(exception.message);
                        callback(null, [null, errorMessages]);
                    }

                    console.log(methodName + ' API call---->', url);
                    client.get(url,
                        function (data, response) {
                            var pdfRequest = null;
                            try {
                                var request_id = data.request.requestNo;
                                pdfRequest = {
                                    request_id: request_id,
                                    chartSettings: chartSettings,
                                    chartPath: ''
                                };
                                console.log("Created PDF request: " + request_id);
                                pdfRequest.chartPath = createPath(request_id);
                            } catch (exception) {
                                errorMessages.push(exception.message);
                            }
                            callback(null, [pdfRequest, errorMessages]);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            var message = 'Error connecting to getPDFRequestId. url:' + url;
                            errorMessages.push(message);
                            callback(null, [null, errorMessages]);
                        }
                    );
                }
            }

            function setupGetChartImages(input, callback) {

                var pdfRequest = input[0];
                var errorMessages = input[1];

                if ((pdfRequest == null) || (errorMessages.length > 0)) {
                    callback(null, [pdfRequest, errorMessages]);
                } else {
                    var chartObjArr = [];

                    try {
                        u.each(pdfRequest.chartSettings,
                            function (chartSetting, index) {
                                var filename;
                                var chartObj;

                                filename = chartSetting.output.chartName + '.part0.svg';
                                chartObj = {
                                    infile: JSON.stringify(chartSetting.output.stockChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: pdfRequest.chartPath + filename
                                };
                                chartObjArr.push(chartObj);

                                filename = chartSetting.output.chartName + '.part1.svg';
                                chartObj = {
                                    infile: JSON.stringify(chartSetting.output.volumeChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: pdfRequest.chartPath + filename
                                };
                                chartObjArr.push(chartObj);
                            }
                        );
                    } catch (exception) {
                        errorMessages.push(exception.message);
                        chartObjArr.length = 0;
                        callback(null, [pdfRequest, errorMessages]);
                    }

                    async.map(chartObjArr, getChartImage, function (err, results) {

                        u.each(results, function (item) {
                            if (item) {
                                errorMessages.push(item);
                            }
                        });
                        callback(null, [pdfRequest, errorMessages]);
                    });
                }
            }

            function getChartImage(chartObj, callback) {

                var args = {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: chartObj
                };

                //console.log("Output File: " + chartObj.outfile);
                client.post(service.exportOptions.phatomjsURL, args, function (data, response) {
                    console.log("Finished getChartImage call: " + data);
                    callback(null, null);
                }).on('error', function (err) {
                    console.log(err);
                    callback(null, 'Error connecting to chart to svg service.' + chartObj);
                });
            }

            function setSVGFileStatus(input, callback) {

                var pdfRequest = input[0];
                var errorMessages = input[1];

                if ((pdfRequest == null) || (errorMessages.length > 0)) {
                    callback(null, [pdfRequest, errorMessages]);
                } else {
                    var service = getServiceDetails('templateManager');
                    var methodName = '';
                    if (!u.isUndefined(service) && !u.isNull(service)) {
                        methodName = service.methods.setSVGFileStatus;
                    }

                    var args = 'request_id=' + pdfRequest.request_id + '&svg_files_ready=Y&ssnid=' + ssnid;
                    var url = config.restcall.url + '/' + service.name + '/' + methodName + '?' + args;
                    console.log(methodName + ' API call---->', url);
                    client.get(url,
                        function (data, response) {
                            try {
                                pdfRequest.responseCode = response.statusCode;
                                //reduce the amount of data being sent back to client, we need it for debugging chart problems
                                pdfRequest.chartSettings = undefined;
                            } catch (exception) {
                                console.log(exception);
                                errorMessages.push(exception.message);
                            }
                            callback(null, [pdfRequest, errorMessages]);
                        }
                    ).on('error', function (err) {
                            console.log(err);
                            var message = 'Error connecting to setSVGFileStatus. url:' + url;
                            errorMessages.push(message);
                            callback(null, [pdfRequest, errorMessages]);
                        }
                    );
                }
            }

            function getTemplatePDFStatus(result, next) {

                var service = getServiceDetails('templateManager');
                var methodName = '';
                if (!u.isUndefined(service) && !u.isNull(service)) {
                    methodName = service.methods.getTemplatePDFStatus;
                }

                var args = 'request_id=' + result.request_id + '&ssnid=' + ssnid;

                var url = config.restcall.url + '/' + service.name + '/' + methodName + '?' + args;
                //console.log(methodName + ' API call---->', url);
                var statusResponse = {};

                client.get(url, function (data, response) {
                        try {
                            if (data.responseInfo.code === 200) {
                                statusResponse.error = false;
                                result.PDFStatusCode = data.request.status
                                result.PDFHTTPResponseCode = data.responseInfo.code;
                                result.PDFPercentComplete = data.request.percentComplete;
                                console.log("Code: " + result.PDFStatusCode + " At " + data.request.percentComplete + "%");
                                if (data.request.status === "C") {
                                    console.log("PDF generation complete.");
                                    statusResponse.pdfRequest = result;
                                    console.log('[finished]getTemplatePDFStatus url:' +url);
                                    next(statusResponse);
                                } else {
                                    console.log("PDF generation " + result.PDFPercentComplete + " complete.");
                                    var room = 'pdf_' + result.request_id;

                                    var data ={
                                        requestId: result.request_id,
                                        progress: result.PDFPercentComplete
                                    };

                                    config.socketIO.socket.emit('pdf-download-status', data);
                                    setTimeout(function () {
                                        next();
                                    }, 1000);
                                }
                            } else {
                                statusResponse.error = true;
                                console.log('[else]getTemplatePDFStatus return invalid status. url:' +url);
                                next(statusResponse);
                            }
                        } catch (exception) {
                            statusResponse.error = true;
                            console.log('[try/catch]Error connecting to getTemplatePDFStatus. url:' +url);
                            next(statusResponse);
                        }
                    }
                ).on('error', function (err) {
                        console.log(err);
                        console.log('[on error]Error connecting to getTemplatePDFStatus. url:' +url);
                        statusResponse.error = true;
                        next(statusResponse);
                    }
                );
            }


            async.waterfall([getAllChartSettings, setupGetChartDataPoints, getPDFRequestId, setupGetChartImages, setSVGFileStatus],
                function (err, input) {

                    var result = input[0];
                    var errorMessages = input[1];

                    console.log('Input --');
                    console.log(input);

                    if ((result == null) || (errorMessages.length &&
                                             errorMessages.length > 0)) {
                        console.log('Error occured in PDF Download request.');
                        console.log(errorMessages);
                        if (result == null) {
                            result = { errorMessages: errorMessages };
                        } else {
                            result.errorMessages = errorMessages;
                        }
                        console.log('Returning error results back to caller.');
                        res.send(result);
                    } else {
                        result.errorMessages = errorMessages;
                        console.log('setSVGFileStatus returned status: ' + result.responseCode);
                        if (result.responseCode == 200) {
                            async.forever(
                                function (next) {
                                    getTemplatePDFStatus(result, next);
                                },
                                function (asyncResult) {
                                    if (asyncResult.error) {
                                        console.log('---->Request ' + result.request_id + ' is incomplete.');
                                        //indicate an error during status check
                                        result.PDFPercentComplete = -1;
                                    } else {
                                        console.log('---->Request ' + result.request_id + ' is complete.');
                                    }

                                    var data ={
                                        requestId: result.request_id,
                                        progress: result.PDFPercentComplete
                                    };

                                    config.socketIO.socket.emit('pdf-download-status', data);
                                }
                            );

                            //No errors, sent response back to call to add entry to notification center
                            res.send(result);
                        } else {
                            result.errorMessages.push('setSVGFileStatus returned status: ' + result.responseCode);
                            console.log('Returning error setSVGStatus response code back to caller.');
                            res.send(result);
                        }
                    }
                }
            );
        }

        function downloadTemplatePDF(req, res, next) {

            var service = getServiceDetails('templateManager'),
                methodName = '',
                ssnid = req.headers['x-session-token'],
                request_id = req.body.request_id,
                file_name = encodeURIComponent((req.body.file_name).trim()),
                url;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.downloadTemplatePDF;
            }

            url = config.restcall.url + '/' + service.name + '/' + methodName + '?request_id=' + request_id + '&fileName=' + file_name + '&ssnid=' + ssnid;

            client.get(url, {responseType: 'arraybuffer'}, function(data, response) {
                if (data) {
                    res.writeHead(200,
                        {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': 'attachment; filename=' + file_name,
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
