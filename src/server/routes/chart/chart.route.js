
(function(chartRoutes)
{

    var u = require('underscore');
    chartRoutes.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        console.log('bootstrapping chart settings apis ');
        config.parallel([
            app.post('/api/getChartData', getChartData),
            app.post('/api/findTickers', findTickers),
            app.post('/api/getIndices', findIndices),
            app.post('/api/getCompetitors', findCompetitors),
            app.post('/api/getSavedChartData', getSavedChartData),
            app.post('/api/saveChartSettings', saveChartSettings),
            app.post('/api/saveChartAllSettings', saveChartAllSettings),
            app.post('/api/saveChartSvgInFile', saveChartSvgInFile),
            app.post('/api/createTemplatePDFRequest', createTemplatePDFRequest),
            app.post('/api/getTemplatePDFStatus', getTemplatePDFStatus),
            app.post('/api/setSVGFileStatus', setSVGFileStatus),
            app.post('/api/downloadTemplatePDF', downloadTemplatePDF)

        ]);

        function getChartData(req, res, next) {
            var service = getServiceDetails('charts');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.getStockData;
            }

            var  tickers= req.body.tickers,
                period= req.body.period,
                ssnid= req.headers['x-session-token'],
                companyId = req.body.companyId,
                splits= req.body.splits,
                dividends= req.body.dividends,
                earnings= req.body.earnings,
                end_date = req.body.end_date,
                start_date = req.body.start_date;

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
        console.log('SaveChartAllSettings ------->');
            console.log(req.body);
            //console.log(req.headers);
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveChartSettings;
            }

            var ssnid= req.headers['x-session-token'],
                companyId = req.body.company_id,
                stepId = req.body.step_id,
                projectId = req.body.project_id,
                chartSettings = req.body.data;
            //chartsettings should be a array and and defined
            var args = {
                data: {
                    project_id: parseInt(projectId),
                    company_id: parseInt(companyId),
                    step_id: parseInt(stepId),
                    ssnid:ssnid,
                    delete_ignored:true,
                    data : chartSettings
                },
                headers: {"Content-Type": "application/json"}

            };

           // console.log("formed url -> ");
            //console.log(config.restcall.url + '/' + service.name + '/' + methodName);
            //console.log("sending Data");
            //console.log(args);


            console.log("finished call -------");

            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
               // console.log("print data");
               // console.log(data);
               // console.log("print response");
                //console.log(response);
                console.log("finished post call -------");
                res.send(data);
                //console.log('SSNID' + ssnid);
            });
        }

        //this ceates a single chart
        function saveChartSettings(req, res, next) {


            var service = getServiceDetails('charts');
            console.log('saveChartSettings Parameters ----------------------------------');
            console.log(req.body);
            console.log("service resp");
            console.log(service);
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.saveChartSettings;
            }

            var  tickers= req.body.tickers,
                period= req.body.period,
                ssnid= req.headers['x-session-token'],
                companyId = req.body.companyId,
                splits= req.body.splits,
                dividends= req.body.dividends,
                earnings= req.body.earnings,
                end_date = req.body.end_date,
                start_date = req.body.start_date,
                chart_title = req.body.chartTitle,
                mnemonic = req.body.mnemonic,
                item_id = req.body.itemId,
                stepId = req.body.stepId,
                projectId = req.body.projectId,
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
                mnemonic:mnemonic,
                item_id:item_id
            };

            if(chart_id){
                chartSetting.chartId  = parseInt(chart_id);
            }

           // console.log('chartSetting tobe saved ',chartSetting);

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
            //console.log('args----------------------------->',args);
            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                    res.send(data);
            });
        }

        function findTickers(req, res, next) {
            var service = getServiceDetails('templateSearch');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.findTickers;
            }

            console.log(methodName);
            var  keyword= req.body.keyword,
                ssnid= req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?keyword='+keyword +'&ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });
        }

        function findIndices (req, res , next ) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.getIndices;
            }

            console.log(methodName);
            var  ssnid= req.headers['x-session-token'];
            console.log('service.name  + methodName------------------->',config.restcall.url + '/' +service.name + '/' + methodName);
            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?ssnid=' +ssnid, function (data, response) {
                console.log('service.name  + methodName------------------->',service.name + '/' + methodName);
                res.send(data);
            });

        }

        function findCompetitors (req, res , next ) {
            var service = getServiceDetails('templateSearch');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getCompetitors;
            }

            var  ssnid= req.headers['x-session-token'];
            var companyId = req.body.companyId;
            console.log('FindCompetitors ' + config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id=' + companyId + '&ssnid=' +ssnid);
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

            var  ssnid= req.headers['x-session-token'];
            var  stepId= req.body.stepId;
            var  projectId= req.body.projectId;
            var  mnemonic= req.body.mnemonic;
            var  itemId= req.body.itemId;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid, function (data, response)
            {
                res.status(response.statusCode).send(getChartSettings(data));
            });

        }

        function getChartSettings(data)
        {
            var result = {
                newCharts: [],
                legacyCharts: []
            }

            if(data && data.savedChartList)
            {
                u.each(data.savedChartList, function(savedChart)
                {
                    if (savedChart.chartType  === 'IMGURL'){
                        result.newCharts.push(savedChart);
                    }
                    else  if (savedChart.chartType  === 'JSCHART'){
                        var chart = {};
                        chart.chartType = 'JSCHART';
                        chart.settings = {
                            mainStock : "",
                            companyName : savedChart.chartSetting.chart_title,
                            selectedPeriod : savedChart.chartSetting.period.toUpperCase(),
                            selectedIndicesList : [],
                            selectedPeerList : [],
                            selectedCompetitorsList : [],
                            searchedStocks : [],
                            to: {},
                            from: {},
                            isSplits : (savedChart.chartSetting.dividends === 'Y')? true : false,
                            isEarnings : (savedChart.chartSetting.earnings === 'Y')? true : false,
                            isDividents : (savedChart.chartSetting.splits === 'Y')? true : false,
                            eventOptionVisibility : false,
                            dateOptionVisibility : false,
                            comparisonOptionVisibility : false,
                            company_id : savedChart.chartSetting.company_id,
                            mnemonic : savedChart.chartSetting.mnemonic,
                            item_id : savedChart.chartSetting.item_id,
                            step_id : savedChart.chartSetting.step_id,
                            project_id : savedChart.chartSetting.project_id,
                            chart_id : savedChart.chartSetting.chart_id,
                            chart_date : savedChart.chartSetting.chart_date,
                            date_start : savedChart.chartSetting.date_start,
                            date_end : savedChart.chartSetting.date_end,

                        };

                        if(savedChart.chartSetting.peers){
                            var peers = savedChart.chartSetting.peers.split(',');
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
                        if (savedChart.chartSetting.date_start) {
                            var dateStart = savedChart.chartSetting.date_start.split('-');
                            chart.settings.from = {
                                year : dateStart[0],
                                month : dateStart[1],
                                date : dateStart[2]
                            };
                        }
                        if (savedChart.chartSetting.date_end) {
                            var dateEnd = savedChart.chartSetting.date_end.split('-');
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
        function saveChartSvgInFile(req, res, next) {

            var service = getServiceDetails('charts');

            var methodName = '', i;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveChartSvgInFile;
            }

            var ssnid= req.headers['x-session-token'],
                chartName = req.body.chart_name,
                chartData = req.body.chart_data;

            //var success = function(){
            //    if(i==chartName.length){
            //        console.log('>>>>>>>>>>>>>>>>>>>>>>> Already rached here !!');
            //        res.send({response:'success'});
            //    }
            //};

            for(i = 0; i <chartName.length; i++){
                writeFile(chartName[i],chartData[i]);
            }

            return res.send({response:'success'});


            //can send response to the clinet if needed
            /*var args = {
             data : {
             project_id: parseInt(projectId),
             company_id: parseInt(companyId),
             step_id: parseInt(stepId),
             ssnid:ssnid,
             delete_ignored:true,
             data : chartSettings
             },
             headers: { "Content-Type": "application/json" }
             };
             client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
             res.send(data);
             console.log('SSNID' + ssnid);
             });*/
        }
        function writeFile(fileName,fileData,reqID) {
            var fs = require("fs");

            if (!fs.existsSync('src/server/data/tmp/chartSvg/' + reqID )) {
                fs.mkdirSync('src/server/data/tmp/chartSvg/' + reqID );
            }

            console.log("Going to write into existing file");

            console.log(fileName);
            fs.writeFile('src/server/data/tmp/chartSvg/' + reqID + '/' + fileName, fileData, function (err) {
                if (err) {
                    return console.error(err);
                }
                //cb();
            });
        }




        function createTemplatePDFRequest(req, res, next) {

            var service = getServiceDetails('charts');

            var methodName = '', i;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.createTemplatePDFRequest;
            }

            var ssnid =  req.body.ssnid,
                project_id = req.body.project_id,
                user_id = req.body.user_id,
                step_ids = req.body.step_ids,
                file_name = req.body.file_name,
                company_name = req.body.company_name,
                user_name = req.body.user_name,
                chart_name = req.body.chart_name,
                chart_data = req.body.chart_data,
                request_id = 0;

            var args = 'project_id=' + project_id + '&user_id=' + user_id + '&step_ids=' + step_ids + '&file_name=' + file_name +
                '&company_name=' + company_name + '&user_name=' + user_name + '&ssnid=' + ssnid;
            client.get(config.restcall.url + '/templateManager/createTemplatePDFRequest?' + args, function (data, result) {
                if (data && data.hasOwnProperty('request')) {
                    request_id = data.request.requestNo;

                    //Write SVG Files to Disk
                    for (i = 0; i < chart_name.length; i++) {
                        writeFile(chart_name[i], chart_data[i], request_id);
                    }
                    //Set SVG Status Now

                    client.get(config.restcall.url + '/templateManager/setSVGFileStatus?request_id=' + request_id+
                        '&svg_files_ready=Y&ssnid='+ssnid, function (svgstatusdata, svgstatusresult) {
                        if(data && data.hasOwnProperty('code') && data.code===200){
                            //Check for Status if percentage s 100% complete then implement the download
                            client.get(config.restcall.url + '/templateManager/downloadTemplatePDF?request_id=' + request_id+
                                    '&ssnid='+ssnid,function(pdfDownloadData,pdfDownloadResponse){
                                if(pdfDownloadData){
                                    return res.send({"data":pdfDownloadData});
                                }
                            });
                        }
                    });
                }
            });
        }

        function getTemplatePDFStatus(req, res, next) {

            var service = getServiceDetails('charts');

            var methodName = '', i;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getTemplatePDFStatus;
            }

            var ssnid= req.headers['x-session-token'],
                request_id = req.body.request_id;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                res.send(data);
            });

        }
        function downloadTemplatePDF(req, res, next) {

            var service = getServiceDetails('charts');

            var methodName = '', i;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.downloadTemplatePDF;
            }

            var ssnid= req.headers['x-session-token'],
                request_id = req.body.request_id;

            client.get(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                res.send(data);
            });

        }
        function setSVGFileStatus(req, res, next) {

            var service = getServiceDetails('charts');

            var methodName = '', i;

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.setSVGFileStatus;
            }

            var ssnid= req.headers['x-session-token'],
                request_id = req.body.request_id,
                svg_files_ready = req.body.svg_files_ready;//-- > 'Y' or 'N';

            client.get(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
                res.send(data);
            });

        }


        function getServiceDetails(serviceName) {
            console.log("get service details callc", serviceName );
            console.log(config.restcall.url);
            console.log("************");
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

