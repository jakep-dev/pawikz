(function () {
    'use strict';

    var config = {
        /* define locations of mandatory javascript files.
         * Depending on purchased license change the HIGHCHARTS property to
         * highcharts.js or highstock.js
         */

        files: {
            highcharts: {
                JQUERY: 'bower_components/jquery/dist/jquery.min.js',
                MOMENT: 'node_modules/moment/moment.js',
                HIGHCHARTS: 'node_modules/highcharts/highcharts.js',
                EXPORTING: 'node_modules/highcharts/modules/exporting.js',
                HIGHCHARTS_MORE: 'node_modules/highcharts/highcharts-more.js',
                HIGHCHARTS_DATA: 'node_modules/highcharts/modules/data.js',
                HIGHCHARTS_DRILLDOWN: 'node_modules/highcharts/modules/drilldown.js',
                HIGHCHARTS_FUNNEL: 'node_modules/highcharts/modules/funnel.js',
                HIGHCHARTS_HEATMAP: 'node_modules/highcharts/modules/heatmap.js',
                HIGHCHARTS_TREEMAP: 'node_modules/highcharts/modules/treemap.js',
                HIGHCHARTS_3D: 'node_modules/highcharts/highcharts-3d.js',
                HIGHCHARTS_NODATA: 'node_modules/highcharts/modules/no-data-to-display.js',
                HIGHCHARTS_SOLID_GAUGE: 'node_modules/highcharts/modules/solid-gauge.js',
                BROKEN_AXIS: 'node_modules/highcharts/modules/broken-axis.js'
            }
        },
        TIMEOUT: 5000 /* 5 seconds timout for loading images */
    };

    var system = require('system');
    var fs = require('fs');
    var args;
    var chartConfig;

    //console.log('Working Directory: ' + fs.workingDirectory);

    function mapCLArguments() {
        var map = {};
        var i;
        var key;

        if (system.args.length < 1) {
            console.log('Commandline Usage: highchartsToSVG.js -host 127.0.0.1 -port 1234');
        }

        for (i = 0; i < system.args.length; i += 1) {
            if (system.args[i].charAt(0) === '-') {
                key = system.args[i].substr(1, i.length);
                map[key] = system.args[i + 1];
            }
        }
        return map;
    };

    args = mapCLArguments();

    // set tmpDir, for outputting temporary files.
    if (args.tmpdir !== undefined) {
        config.tmpDir = args.tmpdir;
        // Make sure tmpDir exist and is writable
        if (!fs.exists(config.tmpDir)) {
            try {
                fs.makeDirectory(config.tmpDir);
            } catch (e) {
                console.log('ERROR: Cannot create temp directory for ' + config.tmpDir);
            }
        }
    }

    function render(params, exitCallback) {
        var page = require('webpage').create();
        var jsFiles = config.files.highcharts;
        var jsFile;
        var loadSuccess;

        // security measures, for not allowing loading iframes
        page.navigationLocked = true;

        page.onConsoleMessage = function (msg) {
            console.log(msg);
        };

        page.onAlert = function (msg) {
            console.log(msg);
        };

        page.onError = function (msg, trace) {
            var msgStack = ['ERROR: ' + msg];

            if (trace && trace.length) {
                msgStack.push('TRACE:');
                trace.forEach(function (t) {
                    msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
                });
            }

            console.error(msgStack.join('\n'));

            if (exitCallback !== null) {
                exitCallback(msg);
            }
        };

        page.onLoadFinished = function () {
            //console.log('Page Load Complete.');
        };

        function exit(result) {
            page.close();
            exitCallback(result);
        };

        page.open('about:blank', function () {

            for (jsFile in jsFiles) {
                if (jsFiles.hasOwnProperty(jsFile)) {
                    loadSuccess = page.injectJs(jsFiles[jsFile]);
                    if (!loadSuccess) {
                        console.log('Failed to load javascript file:' + jsFiles[jsFile]);
                    }
                }
            }

            chartConfig = JSON.parse(params.infile);
            var filename = params.outfile;
            //console.log(filename);

            //var jsonFilename = filename.replace(/\.svg/, '.txt');
            //fs.write(jsonFilename, JSON.stringify(chartConfig));
            //console.log(chartConfig.chart.type);

            var args = {
                width: 800,
                height: 375,
                chartConfig: chartConfig,
                filename: filename
            };

            var svg = page.evaluate(function (opt) {

                var container;

                function addLabelBoxes(chart) {

                    if (chart.series) {
                        var labelsBoxes = [],
                            tickerLabelTop;
                        for (var serCntr = 0; serCntr < chart.series.length; serCntr++) {
                            var data = chart.series[serCntr].data,
                                lastIndex = data.length - 1,
                                lastPoint = data[lastIndex],
                                x = chart.chartWidth - chart.marginRight + 5,
                                y = lastPoint.plotY + chart.plotTop - 40,
                                label;

                            //adding tooltip as side labels with customize tooltip properties.
                            label = chart.renderer.label(chart.series[serCntr].name,
                                x,
                                y,
                                'callout',
                                0,
                                    lastPoint.plotY + chart.plotTop
                                , null, null, 'tooltip')
                                .css({
                                    color: '#FFFFFF',
                                    fontSize: '10px',
                                    width: '75px'
                                })
                                .attr({
                                    fill: chart.series[serCntr].color,
                                    padding: 8,
                                    r: 6,
                                    zIndex: 6
                                }).addClass('tooltip')
                                .add();

                            labelsBoxes.push({
                                label: label,
                                y: y,
                                height: label.getBBox().height
                            });
                        }

                        //sort labels by y
                        labelsBoxes.sort(function (a, b) {
                            return a.y - b.y;
                        });

                        if (labelsBoxes.length > 1) {
                            var H = Highcharts;
                            H.each(labelsBoxes, function (labelBox, k) {
                                if (k > 0) {
                                    if (tickerLabelTop && labelBox.y < tickerLabelTop) {
                                        labelBox.y = tickerLabelTop;
                                        labelBox.label.attr({ y: tickerLabelTop });
                                    }
                                }
                                tickerLabelTop = labelBox.y + labelBox.height;
                            });
                        }
                    }
                }

                function adjustXAxisLabels(chart) {

                    var xAxisLabels = $('#container').find('.highcharts-xaxis-labels').find("text");
                    if (xAxisLabels) {

                        //console.log('Found xAxisLabes count:' + xAxisLabels.length);

                        //Display xAxis Labels conditionally based on selected period - START
                        var objLastLbl = xAxisLabels;
                        var lastValue = objLastLbl.length - 1;
                        var startDate = moment(objLastLbl[0].textContent, 'YYYY-MM-DD');
                        var endDate = moment(objLastLbl[lastValue].textContent, 'YYYY-MM-DD');
                        var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                        var diffDays = duration.asDays();
                        var diffMonths = Math.floor(duration.asMonths());
                        var nextDispDate = startDate;

                        //console.log("lastValue: " + lastValue + ", startDate: " + startDate + ", endDate: " + endDate + ", duration: " + duration + ", diffDays: " + diffDays + ", diffMonths: " + diffMonths + ", nextDispDate: " + nextDispDate);
                        objLastLbl.each(function (txtCntr, element) {
                            var currentPeriod = element.textContent;
                            //console.log("**************");
                            //console.log("[1] Current Period:" + currentPeriod + ", nextDispDate:" + nextDispDate);
                            //console.log("Starting x-axis label:" + element.firstChild.textContent);
                            if (diffMonths <= 1 && diffDays > 7) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[1,7]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                    if (nextDispDate - currentPeriod === 0) {
                                        nextDispDate = moment(nextDispDate).add(7, 'days');
                                    } else {
                                        //console.log("clearing x-axis label");
                                        element.firstChild.textContent = '';
                                    }
                                    if (txtCntr == lastValue) {
                                        //console.log("setting x-axis label");
                                        element.firstChild.textContent = moment(currentPeriod).format('YYYY-MM-DD');
                                    }
                                }
                            } else if (diffMonths <= 3 && diffMonths > 1) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[3,1]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');

                                    if (nextDispDate <= currentPeriod) {
                                        element.firstChild.textContent = moment(nextDispDate).format('YYYY-MM-DD');
                                        nextDispDate = moment(nextDispDate).add(14, 'days');
                                    } else {
                                        element.firstChild.textContent = '';
                                    }
                                }
                            } else if (diffMonths <= 18 && diffMonths > 3) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[18,3]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');

                                    if (nextDispDate <= currentPeriod) {
                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                        nextDispDate = moment(nextDispDate).add(2, 'months');
                                    } else {
                                        element.firstChild.textContent = '';
                                    }
                                }
                            } else if (diffMonths <= 24 && diffMonths > 18) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[24,18]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');

                                    if (nextDispDate <= currentPeriod) {
                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                        nextDispDate = moment(nextDispDate).add(3, 'months');
                                    } else {
                                        element.firstChild.textContent = '';
                                    }
                                    if (txtCntr == lastValue)
                                        element.firstChild.textContent = moment(currentPeriod).format('MMM-YYYY');
                                }
                            } else if (diffMonths <= 36 && diffMonths > 24) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[36,24]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');

                                    if (nextDispDate <= currentPeriod) {
                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                        nextDispDate = moment(nextDispDate).add(4, 'months');
                                    } else {
                                        element.firstChild.textContent = '';
                                    }
                                    if (txtCntr == lastValue)
                                        element.firstChild.textContent = moment(currentPeriod).format('MMM-YYYY');
                                }
                            } else if (diffMonths <= 120 && diffMonths > 36) {
                                if (currentPeriod && nextDispDate) {
                                    //console.log("[120,36]");
                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');

                                    if (nextDispDate <= currentPeriod) {
                                        element.firstChild.textContent = moment(nextDispDate).format('YYYY');
                                        nextDispDate = moment(nextDispDate).add(1, 'years');
                                    } else {
                                        element.firstChild.textContent = '';
                                    }
                                    if (txtCntr == lastValue)
                                        element.firstChild.textContent = '<tspan>' + moment(currentPeriod).format('YYYY') + '</tspan>';
                                }
                            }
                            //console.log("[2]" + currentPeriod + "," + nextDispDate);
                            //console.log("Final x-axis label:" + element.firstChild.textContent);
                            //console.log("**************");
                        });

                        if (chart.xAxis != null && chart.xAxis.length > 0) {
                            chart.xAxis[0].labelRotation = 0;
                            chart.isDirty = true;
                            chart.redraw();
                        }
                    }
                }

                document.body.style.margin = '0px';
                container = document.createElement('div');
                container.id = 'container';
                document.body.appendChild(container);

                //$('body').prepend('<div id="container"></div>');
                $("#container").css("min-height", "275px");

                // disable animations
                Highcharts.SVGRenderer.prototype.Element.prototype.animate = Highcharts.SVGRenderer.prototype.Element.prototype.attr;
                Highcharts.setOptions({
                    plotOptions: {
                        series: {
                            animation: false
                        }
                    }
                });

                /*
                 var chart = new Highcharts.Chart({
                 chart: {
                 renderTo: container.id,
                 width: opt.width,
                 height: opt.height
                 },
                 exporting: {
                 enabled: false
                 },
                 title: {
                 text: 'Combination chart'
                 },
                 xAxis: {
                 categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
                 },
                 yAxis: {
                 title: {
                 text: 'Y-values'
                 }
                 },
                 labels: {
                 items: [{
                 html: 'Total fruit consumption',
                 style: {
                 left: '40px',
                 top: '8px',
                 color: 'black'
                 }
                 }]
                 },
                 plotOptions: {
                 line: {
                 dataLabels: {
                 enabled: true
                 },
                 enableMouseTracking: false
                 },
                 series: {
                 enableMouseTracking: false,
                 shadow: false,
                 animation: false
                 }
                 },
                 series: [{
                 type: 'column',
                 name: 'Andrii',
                 data: [3, 2, 1, 3, 4]
                 }, {
                 type: 'column',
                 name: 'Fabian',
                 data: [2, 3, 5, 7, 6]
                 }, {
                 type: 'column',
                 name: 'Joan',
                 data: [4, 3, 3, 9, 0]
                 }, {
                 type: 'spline',
                 name: 'Average',
                 data: [3, 2.67, 3, 6.33, 3.33],
                 marker: {
                 lineWidth: 2,
                 lineColor: 'white'
                 }
                 }, {
                 type: 'pie',
                 name: 'Total consumption',
                 data: [{
                 name: 'Andrii',
                 y: 13,
                 color: '#4572A7'
                 }, {
                 name: 'Fabian',
                 y: 23,
                 color: '#AA4643'
                 }, {
                 name: 'Joan',
                 y: 19,
                 color: '#89A54E'
                 }],
                 center: [100, 80],
                 size: 100,
                 showInLegend: false,
                 dataLabels: {
                 enabled: false
                 }
                 }]
                 }
                 );
                 */

                opt.chartConfig.chart.renderTo = container.id;
                if (!opt.chartConfig.chart.width) {
                    console.log("No chart width specified, setting it to " + opt.width);
                    opt.chartConfig.chart.width = opt.width;
                }
                if (!opt.chartConfig.chart.height) {
                    console.log("No chart height specified, setting it to " + opt.height);
                    opt.chartConfig.chart.height = opt.height;
                }

                if (opt.chartConfig.chart.type == 'column') {
                    opt.chartConfig.chart.events = {
                        load: function () {
                            //console.log("Chart Loaded");
                            adjustXAxisLabels(this);
                        }
                        //, redraw: function () {
                        //console.log("Chart Redrawned");
                        //}
                    };
                }


                var chart = new Highcharts.Chart(opt.chartConfig);

                /* remove stroke-opacity paths, used by mouse-trackers, they turn up as
                 *  as fully opaque in the PDF
                 */
                nodes = document.querySelectorAll('*[stroke-opacity]');

                for (nodeIter = 0; nodeIter < nodes.length; nodeIter += 1) {
                    elem = nodes[nodeIter];
                    opacity = elem.getAttribute('stroke-opacity');
                    elem.removeAttribute('stroke-opacity');
                    elem.setAttribute('opacity', opacity);
                }

                if (chart.options.chart.type == 'spline') {
                    addLabelBoxes(chart);
                }
                else if (chart.options.chart.type == 'column') {
                    adjustXAxisLabels(chart);
                }

                var elem = document.getElementsByTagName('svg')[0];
                var svgElement;
                if (elem) {
                    //xmlns: xlink = "http://www.w3.org/1999/xlink"
                    svgElement = $('svg')[0];
                    $(svgElement).attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                    $('image').each(function (index, element) {
                        $(element).attr('height', 21);
                        $(element).attr('width', 21);
                    });

                    //console.log('SVG element found');
                    //console.log('SVG element found:' + elem.parentElement.innerHTML);
                    svgElement = elem.parentElement.innerHTML;
                }
                //else {
                //    console.log('SVG element not found');
                //}

                return svgElement;
            }, args);

            console.log('Writing to file: ' + filename);
            /*var SVG_DOCTYPE = '<?xml version=\"1.0" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">';
            // Saving SVG to a file
            fs.write(filename, SVG_DOCTYPE + svg);*/
            page.render(filename);

            // Saving as PDF
            //page.render(filename.replace(/\.svg/, '.pdf'));
            exit(filename);
        });
    }

    function renderTable(params, exitCallback) {
        var page = require('webpage').create();
        var jsFiles = config.files.highcharts;
        var jsFile;
        var loadSuccess;

        // security measures, for not allowing loading iframes
        page.navigationLocked = true;

        page.onConsoleMessage = function (msg) {
            console.log(msg);
        };

        page.onAlert = function (msg) {
            console.log(msg);
        };

        page.onError = function (msg, trace) {
            var msgStack = ['ERROR: ' + msg];

            if (trace && trace.length) {
                msgStack.push('TRACE:');
                trace.forEach(function (t) {
                    msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
                });
            }

            console.error(msgStack.join('\n'));

            if (exitCallback !== null) {
                exitCallback(msg);
            }
        };

        page.onLoadFinished = function () {
            //console.log('Page Load Complete.');
        };

        function exit(result) {
            page.close();
            exitCallback(result);
        };

        page.open('about:blank', function () {

            for (jsFile in jsFiles) {
                if (jsFiles.hasOwnProperty(jsFile)) {
                    loadSuccess = page.injectJs(jsFiles[jsFile]);
                    if (!loadSuccess) {
                        console.log('Failed to load javascript file:' + jsFiles[jsFile]);
                    }
                }
            }

            
            var filename = params.outfile;
            var tableInfo = JSON.parse(params.infile);
            var args = {
                tableInfo: tableInfo,
                filename: filename
            }
            var stockTable = page.evaluate(function (opt){

                var container;
                
                var container = document.createElement('div');
                container.id = 'container';
                //container.setAttribute('style', 'font-family: Arial;');
                document.body.appendChild(container);

                function sigDevHTML(data) {

                    function getSigDevTableHeader() {
                        var html = '';

                        //html += '<thead style="font-size: 12px !important; font-weight: bold !important;">';
                        html += '<tr style="font-size: 12px !important; font-weight: bold !important;">';
                        html += '<td><span>Event</span></td>';
                        html += '<td><span>Event Summary</span></td>';
                        html += '</tr>';
                        //html += '</thead>';

                        return html;
                    }

                    function getSigDevTableBody() {
                        var html = '';

                        //html += '<tbody>';
                        
                        data.forEach( function (row, index){
                            html += '<tr ' + ((index % 2 === 0) ? '' : 'class="alternateRow"') + '>'; //use advisen csss
                            
                            html += '<td>' + (row.dateAnncd || '') + '</td>';
                            html += '<td>' + (row.devhHeadline || '') + '</td>';
                            
                            html += '</tr>';
                        });
                        
                        //html += '</tbody>';

                        return html;
                    }


                    var sigdevDiv = document.createElement('div');
                    sigdevDiv.id = 'sigdev_div';
                    container.appendChild(sigdevDiv);

                    var html = '';
                    html += '<div style="padding: 10px 0px 5px 0px"><span style="font-weight: bold !important"> Significant Developments </span></div>';
                    html += '<div>';
                    html += '<table border="0" cellpadding="5" style="padding: 5px; border-collapse: collapse;width: 100%;text-align: left;font-size: 12px !important;">';
                    html += getSigDevTableHeader();
                    html += getSigDevTableBody();
                    html += '</table>';
                    html += '</div>';

                    ///$('#sigdev_div').appned(html);
                    sigdevDiv.innerHTML = html;
                }

                function mascadHTML(data) {

                    function getMascadTableHeader() {
                        var html = '';

                        //html += '<thead style="font-weight: bold !important">';
                        html += '<tr style="font-size: 12px !important; font-weight: bold !important;">';
                        html += '<td><span>Company</span></td>';
                        html += '<td><span>Filing/Accident Date</span></td>';
                        html += '<td><span>Start Date</span></td>';
                        html += '<td><span>End Date</span></td>';
                        html += '<td><span>Status</span></td>';
                        html += '<td><span>Disposition Date</span></td>';
                        html += '<td><span>Total Amount</span></td>';
                        html += '<td><span>MASCAd ID</span></td>';
                        html += '<td><span>Type</span></td>';
                        html += '</tr>';
                        //html += '</thead>';

                        return html;
                    }

                    function getMascadTableBody() {
                        var html = '';

                        //html += '<tbody>';
                        
                        data.forEach( function (row, index){
                            html += '<tr ' + ((index % 2 === 0) ? '' : 'class="alternateRow"') + '>';  //use advisen csss
                            
                            html += '<td>' + (row.companyName || '') + '</td>';
                            html += '<td>' + (row.dateFiling || '') + '</td>';
                            html += '<td>' + (row.classPeriodStart || '') + '</td>';
                            html += '<td>' + (row.classperiodEnd || '') + '</td>';
                            html += '<td>' + (row.status || '') + '</td>';
                            html += '<td>' + (row.dispositionDate || '') + '</td>';
                            html += '<td>' + (row.settlementAmount || '') + '</td>';
                            html += '<td>' + (row.mascadId || '') + '</td>';
                            html += '<td>' + (row.caseType || '') + '</td>';
                            
                            html += '</tr>';

                        });
                        //html += '</tbody>';

                        return html;
                    }

                    var mascadDiv = document.createElement('div');
                    mascadDiv.id = 'mascad_div';
                    container.appendChild(mascadDiv);

                    var html = '';
                    html += '<div style="padding: 10px 0px 5px 0px"><span style="font-weight: bold !important"> Significant Cases </span></div>';
                    html += '<div>';
                    html += '<table border="0" cellpadding="5" style="padding: 5px; border-collapse: collapse;width: 100%;text-align: left;font-size: 12px !important;">';
                    html += getMascadTableHeader();
                    html += getMascadTableBody();
                    html += '</table>';
                    html += '</div>';

                    //$('#mascad_div').appned(html);
                    mascadDiv.innerHTML = html;
                }

                if(opt.tableInfo.sigdev && opt.tableInfo.sigdev.length > 0) {
                    sigDevHTML(opt.tableInfo.sigdev);
                }

                if(opt.tableInfo.mascad && opt.tableInfo.mascad.length > 0) {
                    mascadHTML(opt.tableInfo.mascad);
                }

                return container.innerHTML;
            }, args);

            if(filename) {

                console.log('Writing to file: ' + filename);
                //var base64 = page.renderBase64('PNG');
                fs.write(filename, stockTable);
                //page.render(filename);
            }

            exit(filename);
        });
    }

    function startServer(host, port) {
        //console.log('inside startServer')
        var server = require('webserver').create();
        server.listen(host ? host + ':' + port : parseInt(port, 10),
            function (request, response) {
                function onError(msg, e) {
                    msg = 'Failed rendering: \n';
                    if (e) {
                        msg += e;
                    }
                    response.statusCode = 500;
                    response.setHeader('Content-Type', 'text/plain');
                    response.setHeader('Content-Length', msg.length);
                    response.write(msg);
                    response.close();
                }

                console.log(request.url);
                if (request.method == 'GET') {
                    //var cleanedUrl = request.url;
                    //var pagePath = fs.workingDirectory + cleanedUrl;
                    //console.log('-->' + pagePath.replace(/\//g, '\\'));
                    //response.setHeader("Content-Type", "image/jpeg");
                    //try {
                    //    var content = fs.read(pagePath.replace(/\//g, '\\'), 'b');
                    //    response.setHeader('Content-Length', content.length);
                    //    response.setEncoding('binary');
                    //    console.log("Read " + content.length + " bytes");
                    //    response.write(content);
                    //} catch (err) {
                    //    console.error('Error while reading ' + cleanedUrl + '(requested URL : ' + request.url + ')');
                    //}
                    response.close();
                } else {
                    var jsonStr = request.postRaw || request.post;
                    var params;

                    try {
                        params = JSON.parse(jsonStr);
                        if (params.status) {
                            // for server health validation
                            response.statusCode = 200;
                            response.write('OK');
                            response.close();
                        } else {
                            params.url = 'http://' + host + ':' + port;
                            
                            switch(params.page) {
                                case 'STOCK_CHART' :
                                    
                                    render(params, function (result) {
                                        response.statusCode = 200;
                                        response.write(result);
                                        response.close();
                                    }, onError);
                                    break;
                                case 'STOCK_TABLE' :
                                    
                                    renderTable(params, function (result) {
                                        response.statusCode = 200;
                                        response.write(result);
                                        response.close();
                                    }, onError);
                                    break;
                                default :
                                    break;
                            }
                        }
                    } catch (e) {
                        onError('Failed rendering chart', e);
                    }
                }
            }); // end server.listen
        console.log('OK, PhantomJS is ready.');
    };

    if (args.port !== undefined) {
        startServer(args.host, args.port);
    }

}());