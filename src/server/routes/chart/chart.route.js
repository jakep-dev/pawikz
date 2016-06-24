
(function(chartRoutes)
{

    var u = require('underscore');
    chartRoutes.init = function(app, config,server)
    {
        var io = require('socket.io')(server);

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
            //app.post('/api/saveChartAllSettings_v2', saveChartAllSettings_v2),
            app.post('/api/createTemplatePDFRequest', createTemplatePDFRequest)

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
            console.log('getChartDataVar---------->', getChartDataVar);

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

            console.log("******* Args start***");
            console.log(args);
            console.log("******* Args end***");


           // console.log("formed url -> ");
            //console.log(config.restcall.url + '/' + service.name + '/' + methodName);
            //console.log("sending Data");
            //console.log(args);

            var saveChartSettingsAPI = config.restcall.url + '/' + service.name + '/' + methodName,args;
            console.log("finished call -------");
            console.log("SaveChartAllSettingsTTTTTTTTTTTTTTTTTTTTTTTTTTT", saveChartSettingsAPI);
            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {
               // console.log(data);
               // console.log("print response");
                //console.log(response);
                console.log("finished post call -------");
                res.send(data);
                //console.log('SSNID' + ssnid);
            });
        }


       /* function saveChartAllSettings_v2(req, res, next) {
            console.log('SaveChartAllSettings ------->');
            console.log(req.body);
            //console.log(req.headers);
            var service = getServiceDetails('charts');

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveChartSettings;
            }

            var projectId = req.body.project_id,
                companyId = req.body.company_id,
                stepId = req.body.step_id,
                mnemonicId = req.body.mnemonic,
                itemId = req.body.item_Id,
                ssnid= req.headers['x-session-token'],
                chartSettings = req.body.chartSettings;
            //chartsettings should be a array and and defined
            var args = {
                data: {
                    project_id: parseInt(projectId),
                    company_id: parseInt(companyId),
                    step_id: parseInt(stepId),
                    mnemonic : mnemonicId,
                    item_Id : itemId,
                    ssnid:ssnid,
                    delete_ignored:true,
                    chartSettings : chartSettings
                },
                headers: {"Content-Type": "application/json"}

            };
            console.log("finished call -------");
            console.log("SaveChartAllSettings API call--->", config.restcall.url + '/' + service.name + '/' + methodName,args);
            client.post(config.restcall.url + '/' + service.name + '/' + methodName,args,  function (data, response) {

                console.log("finished post call -------");
                res.send(data);
            });
        }*/
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

            console.log('chartSetting to be saved ',chartSetting);

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

            var ssnid = req.body.ssnid;
            var  stepId= req.body.step_id;
            var  projectId= req.body.project_id;
            var  mnemonic= req.body.mnemonic;
            var  itemId= req.body.item_id;


            console.log('getSavedChartData API call---->',config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid);

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid,
                function (data, response)
                    {
                        res.status(response.statusCode).send(getChartSettings(data));
                    });

        }

        function getChartSettings(data){
                console.log(data);
            var result = {
                newCharts: [],
                legacyCharts: []
            }

            if(data && data.chartSettings)
            {
                u.each(data.chartSettings, function(savedChart)
                {
                    if (savedChart.chartType  === 'IMGURL'){
                        result.newCharts.push(savedChart);
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

            console.log("Going to write into existing file******************", fileName);

            fs.writeFile('src/server/data/tmp/htmlRequest/' + reqID + '/chart/' + fileName, fileData, function (err) {
                if (err) {
                    return console.error(err);
                }
                return console.log('success');
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
                file_name = (req.body.file_name).trim(),
                company_name = req.body.company_name.trim(),
                user_name = (req.body.user_name).trim(),
                chart_name = req.body.chart_name,
                chart_data = req.body.chart_data,
                request_id = 0;

            var args = 'project_id=' + project_id + '&user_id=' + user_id + '&step_ids=' + step_ids + '&file_name=' + (file_name).split(' ').join('+') +
                '&company_name=' + (company_name).split(' ').join('+') + '&user_name=' + (user_name).split(' ').join('+') + '&ssnid=' + ssnid;
            console.log('createTemplatePDFRequest------------------------------------->', config.restcall.url + '/templateManager/createTemplatePDFRequest?' + args);
            client.get(config.restcall.url + '/templateManager/createTemplatePDFRequest?' + args, function (data, result) {
                if (data && data.hasOwnProperty('request')) {
                    request_id = data.request.requestNo;
                    //Write SVG Files to Disk
                    for (i = 0; i < chart_name.length; i++) {
                        writeFile(chart_name[i], chart_data[i], request_id);
                    }
                    //Set SVG Status Now
                   var stream = client.get(config.restcall.url + '/templateManager/setSVGFileStatus?request_id=' + request_id+
                        '&svg_files_ready=Y&ssnid='+ssnid, function (svgstatusdata, svgstatusresult) {
                            //Check for Status if percentage s 100% complete then implement the download

                    if(svgstatusresult.statusCode == 200){
                            getPDFStatus(request_id,ssnid, res);
                    }

                    });
                    stream.on('finish', function(){
                        console.log("Data finished...........");
                    });
                }
            });
        }

        function getPDFStatus(request_id,ssnid,res){
            client.get(config.restcall.url + '/templateManager/getTemplatePDFStatus?request_id='+request_id+
                '&ssnid='+ssnid, function(tplstatusdata, tplstatusresult){
                console.log('PDF HTTP response code --->'+ tplstatusdata.responseInfo.code + '  | PDF progress status code--->' + tplstatusdata.request.status + '  | PercentComplete--->' +tplstatusdata.request.percentComplete );
                //Emitting the percentChange through socket.io to render over UI progressbar
                io.emit('pdfc status progress', {percentage:tplstatusdata.request.percentComplete,status:'working'});

                console.log("socket connected");
                if(tplstatusdata &&  tplstatusdata.responseInfo.code===200 && tplstatusdata.request.status==="C"){
                    console.log('DownloadTemplatePDF API call---'+config.restcall.url + '/templateManager/downloadTemplatePDF?request_id=' + request_id+
                        '&ssnid='+ssnid);
                    client.get(config.restcall.url + '/templateManager/downloadTemplatePDF?request_id='+request_id+
                        '&ssnid='+ssnid,function(pdfDownloadData,pdfDownloadResponse){
                        if(pdfDownloadData){

                            var contentBase64 = new Buffer(pdfDownloadData).toString('base64');
                            var contentPlain =  new Buffer(contentBase64, 'base64');

                            res.writeHead(200,
                                {
                                    'Content-Type': 'application/pdf'
                                    ,'Content-Disposition': 'attachment; filename=test.pdf'
                                    ,'Content-Length': contentBase64.length
                                });
                            res.write(contentBase64);
                            res.end();
                        }
                    })


                }
                else{
                    getPDFStatus(request_id,ssnid,res)
                }
            })
        }

        function getServiceDetails(serviceName) {
            console.log("get service details callc", serviceName );
            console.log(config.restcall.url);
            console.log("************");
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

