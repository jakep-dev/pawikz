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
//                EXPORTING: 'node_modules/highcharts/modules/exporting.js',
//                HIGHCHARTS_MORE: 'node_modules/highcharts/highcharts-more.js',
//                HIGHCHARTS_DATA: 'node_modules/highcharts/modules/data.js',
//                HIGHCHARTS_DRILLDOWN: 'node_modules/highcharts/modules/drilldown.js',
//                HIGHCHARTS_FUNNEL: 'node_modules/highcharts/modules/funnel.js',
//                HIGHCHARTS_HEATMAP: 'node_modules/highcharts/modules/heatmap.js',
//                HIGHCHARTS_TREEMAP: 'node_modules/highcharts/modules/treemap.js',
//                HIGHCHARTS_3D: 'node_modules/highcharts/highcharts-3d.js',
                HIGHCHARTS_NODATA: 'node_modules/highcharts/modules/no-data-to-display.js'
//                HIGHCHARTS_SOLID_GAUGE: 'node_modules/highcharts/modules/solid-gauge.js',
//                BROKEN_AXIS: 'node_modules/highcharts/modules/broken-axis.js'
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
            //console.log('Starting to generate file: ' + filename);
            var svg = page.evaluate(function (opt) {

                var container;

                function addLabelBoxes(chart) {

                    if (chart.series) {
                        var labelsBoxes = [];
                        var tickerLabelTop;
                        var serCntr;
                        for (serCntr = 0; serCntr < chart.series.length; serCntr++) {
                            var data = chart.series[serCntr].data;
                            var lastIndex = data.length - 1;
                            var i;
                            var lastPoint;
                            
                            for (i = lastIndex; i >= 0; i--) {
                                lastPoint = data[i];
                                if (lastPoint && lastPoint.plotY) {
                                    break;
                                }
                            }
                            if (lastPoint && lastPoint.plotY) {
                                var x = chart.chartWidth - chart.marginRight + 5;
                                var y = lastPoint.plotY + chart.plotTop - 40;
                                var label = undefined;

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
                    if (xAxisLabels && (xAxisLabels.length > 0)) {

                        //console.log('Found xAxisLabes count:' + xAxisLabels.length);

                        //Display xAxis Labels conditionally based on selected period - START
                        var blankCount = 0;
                        var labelsChanged = false;
                        var i = 0;
                        var n = xAxisLabels.length;
                        var totalSkip = 0;
                        var targetLabels = [];
                        var startDate = moment(xAxisLabels[0].textContent, 'YYYY-MM-DD');
                        var endDate = moment(xAxisLabels[n - 1].textContent, 'YYYY-MM-DD');
                        var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                        var diffDays = duration.asDays();
                        var diffMonths = Math.floor(duration.asMonths());
                        var labelFormat;

                        if (diffMonths <= 1 && diffDays > 7) {
                            duration = moment.duration(7, 'days');
                            labelFormat = 'YYYY-MM-DD';
                        } else if (diffMonths <= 3 && diffMonths > 1) {
                            duration = moment.duration(14, 'days');
                            labelFormat = 'YYYY-MM-DD';
                        } else if (diffMonths <= 12 && diffMonths > 3) {
                            duration = moment.duration(2, 'months');
                            labelFormat = 'MMM-YYYY';
                        } else if (diffMonths <= 24 && diffMonths > 12) {
                            duration = moment.duration(3, 'months');
                            labelFormat = 'MMM-YYYY';
                        } else if (diffMonths <= 36 && diffMonths > 24) {
                            duration = moment.duration(3, 'months');
                            labelFormat = 'MMM-YYYY';
                        } else if (diffMonths <= 60 && diffMonths > 36) {
                            duration = moment.duration(1, 'years');
                            labelFormat = 'MMM-YYYY';
                        } else if (diffMonths <= 120 && diffMonths > 60) {
                            duration = moment.duration(1, 'years');
                            labelFormat = 'YYYY';
                        } else if (diffMonths > 120) {
                            duration = moment.duration(1, 'years');
                            labelFormat = 'YYYY';
                        }
                        var nextDispDate = startDate.add(duration);

                        var skipCount = 0;
                        var currentDate = null;
                        var currentDiff = 0;
                        var prevDiff;

                        xAxisLabels.sort(function (a, b) {
                            if (a.textContent < b.textContent) {
                                return -1;
                            } else if (a.textContent > b.textContent) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });

                        for (i = 0; i < n; i++) {
                            //console.log(xAxisLabels[i].textContent);
                            prevDiff = currentDiff;
                            currentDate = moment(xAxisLabels[i].textContent, 'YYYY-MM-DD');
                            currentDiff = currentDate.diff(nextDispDate, 'days');
                            if (currentDiff < 0) {
                                skipCount++;
                            } else {
                                if (currentDiff == 0) {
                                    targetLabels.push(
                                        {
                                            index: i,
                                            originalLabel: xAxisLabels[i].textContent,
                                            finalLabel: moment(xAxisLabels[i].textContent, 'YYYY-MM-DD').format(labelFormat),
                                            skipCount: skipCount
                                        }
                                    );
                                    totalSkip += skipCount;
                                    skipCount = 0;
                                } else {
                                    if (Math.abs(prevDiff) > currentDiff) {
                                        targetLabels.push(
                                            {
                                                index: i,
                                                originalLabel: xAxisLabels[i].textContent,
                                                finalLabel: moment(xAxisLabels[i].textContent, 'YYYY-MM-DD').format(labelFormat),
                                                skipCount: skipCount
                                            }
                                        );
                                        totalSkip += skipCount;
                                        skipCount = 0;
                                    } else if (Math.abs(prevDiff) <= currentDiff) {
                                        if (targetLabels.length > 0) {
                                            if (targetLabels[targetLabels.length - 1].originalLabel === xAxisLabels[i - 1].textContent) {
                                                targetLabels.push(
                                                    {
                                                        index: i,
                                                        originalLabel: xAxisLabels[i].textContent,
                                                        finalLabel: moment(xAxisLabels[i].textContent, 'YYYY-MM-DD').format(labelFormat),
                                                        skipCount: skipCount
                                                    }
                                                );
                                                totalSkip += skipCount;
                                                skipCount = 0;
                                            } else {
                                                targetLabels.push(
                                                    {
                                                        index: i - 1,
                                                        originalLabel: xAxisLabels[i - 1].textContent,
                                                        finalLabel: moment(xAxisLabels[i].textContent, 'YYYY-MM-DD').format(labelFormat),
                                                        skipCount: skipCount - 1
                                                    }
                                                );
                                                totalSkip += skipCount - 1;
                                                skipCount = 1;
                                            }
                                        } else {
                                            targetLabels.push(
                                                {
                                                    index: i - 1,
                                                    originalLabel: xAxisLabels[i - 1].textContent,
                                                    finalLabel: moment(xAxisLabels[i].textContent, 'YYYY-MM-DD').format(labelFormat),
                                                    skipCount: skipCount - 1
                                                }
                                            );
                                            totalSkip += skipCount - 1;
                                            skipCount = 1;
                                        }
                                    }
                                }
                                nextDispDate = nextDispDate.add(duration);
                            }
                            if (!xAxisLabels[i].textContent) {
                                blankCount++;
                                break;
                            } else {
                                var txt = xAxisLabels[i].textContent;
                                var index = txt.search(/[A-Za-z]+\-[0-9]+/);
                                //console.log('Label = ' + txt + ' position:' + index);
                                if (index >= 0) {
                                    blankCount++;
                                    //console.log('Pre-existing Dates found.');
                                    break;
                                }
                            }
                        }

                        //console.log('Found ' + blankCount + ' blanks.');
                        if (blankCount == 0) {
                            labelsChanged = true;
                            if (targetLabels.length > 0) {
                                //we need to show the first label so we don't count the first label to skip 
                                targetLabels[0].skipCount--;
                                totalSkip--;
                                //console.log(targetLabels);
                                var labelCount = targetLabels.length;
                                var avgSkip_f = totalSkip / labelCount;
                                var avgSkip_low = Math.floor(avgSkip_f);
                                finalSkip = (n - 1) - targetLabels[labelCount - 1].index - 1;
                                //console.log('labelCount = ' + labelCount + ' totalSkip = ' + totalSkip + ' avgSkip_f = ' + avgSkip_f + ' avgSkip_low = ' + avgSkip_low + ' finalSkip = ' + finalSkip);
                                if (finalSkip >= 0) {
                                    needToBorrow = avgSkip_low - finalSkip;
                                    //console.log('needToBorrow = ' + needToBorrow);
                                    targetLabels[labelCount - 1].index -= needToBorrow;
                                    if (needToBorrow > 0) {
                                        for (i = labelCount - 1; i >= 0; i--) {
                                            if (targetLabels[i].skipCount > avgSkip_low) {
                                                targetLabels[i].skipCount = avgSkip_low;
                                            }
                                            if (i - 1 >= 0) {
                                                newIndex = targetLabels[i].index - (avgSkip_low + 1);
                                                if (targetLabels[i - 1].index > newIndex) {
                                                    targetLabels[i - 1].index = newIndex;
                                                } else {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if (targetLabels[labelCount - 1].finalLabel === moment(xAxisLabels[n - 1].textContent, 'YYYY-MM-DD').format(labelFormat)) {
                                        targetLabels[labelCount - 1].index = n - 1;
                                        targetLabels[labelCount - 1].skipCount += avgSkip_low + 1;
                                        //console.log('Removed last x-axis label ' + targetLabels[labelCount - 1].finalLabel);
                                    } else {
                                        //add last label
                                        targetLabels.push(
                                            {
                                                index: n - 1,
                                                originalLabel: xAxisLabels[n - 1].textContent,
                                                finalLabel: moment(xAxisLabels[n - 1].textContent, 'YYYY-MM-DD').format(labelFormat),
                                                skipCount: avgSkip_low
                                            }
                                        );
                                    }
                                }
                                //add first label
                                targetLabels.splice(0, 0,
                                    {
                                        index: 0,
                                        originalLabel: xAxisLabels[0].textContent,
                                        finalLabel: moment(xAxisLabels[0].textContent, 'YYYY-MM-DD').format(labelFormat),
                                        skipCount: 0
                                    }
                                );
                                //console.log(targetLabels);
                                var j = 0;
                                var beforeText;
                                var afterText;
                                labelCount = targetLabels.length;
                                totalSkip = 0;
                                skipCount = 0;
                                for (i = 0; i < n; i++) {
                                    beforeText = xAxisLabels[i].textContent;
                                    if ((j < labelCount) && (i == targetLabels[j].index)) {
                                        //$(xAxisLabels[i].firstChild).attr('content', xAxisLabels[i].firstChild.textContent);
                                        xAxisLabels[i].firstChild.textContent = targetLabels[j].finalLabel;
                                        targetLabels[j].skipCount = skipCount;
                                        skipCount = 0
                                        j++;
                                    } else {
                                        //$(xAxisLabels[i].firstChild).attr('content', xAxisLabels[i].firstChild.textContent);
                                        xAxisLabels[i].firstChild.textContent = '';
                                        totalSkip++;
                                        skipCount++;
                                    }
                                    afterText = xAxisLabels[i].textContent;
                                    //console.log('[' + beforeText + ',' + afterText + ']');
                                }
                                avgSkip_f = totalSkip / (labelCount - 1);
                                avgSkip_low = Math.floor(avgSkip_f);
                                var extra = totalSkip - (avgSkip_low * (labelCount - 1));
                                var shortCount = labelCount - extra - 1;
                                //console.log('labelCount = ' + labelCount + ' totalSkip = ' + totalSkip + ' avgSkip_f = ' + avgSkip_f + ' avgSkip_low = ' + avgSkip_low + ' extra = ' + extra + ' shortCount = ' + shortCount);
                                if (avgSkip_low > 1) {
                                    for (i = 1; i <= labelCount - 2; i++) {
                                        j = targetLabels[i].index;
                                        //console.log('i = ' + i + ' before index = ' + j + ' extra = ' + extra + ' shortCount = ' + shortCount);
                                        if (targetLabels[i - 1].index < j) {
                                            xAxisLabels[j].firstChild.textContent = '';
                                        }
                                        if ((i % 2) == 1) {
                                            if (shortCount > 0) {
                                                skipCount = avgSkip_low;
                                                shortCount--;
                                            } else {
                                                skipCount = avgSkip_low + 1;
                                                extra--;
                                            }
                                        } else {
                                            if (extra > 0) {
                                                skipCount = avgSkip_low + 1;
                                                extra--;
                                            } else {
                                                skipCount = avgSkip_low;
                                                shortCount--;
                                            }
                                        }
                                        if (i == 1) {
                                            j = skipCount + 1;
                                        } else {
                                            j = targetLabels[i - 1].index + skipCount + 1;
                                        }
                                        targetLabels[i].index = j;
                                        //console.log('i = ' + i + ' after index = ' + j + ' extra = ' + extra + ' shortCount = ' + shortCount);
                                        xAxisLabels[j].firstChild.textContent = targetLabels[i].finalLabel;
                                    };
                                }
                            }
                            //console.log(targetLabels);
                            //for (i = 0; i < n; i++) {
                            //    console.log('[' + i + '][' + xAxisLabels[i].textContent + ']');
                            //}
                        }

                        if (chart.xAxis != null && chart.xAxis.length > 0) {
                            chart.xAxis[0].labelRotation = 0;
                            chart.isDirty = true;
                            //console.log("Calling chart redraw.");
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

                opt.chartConfig.chart.renderTo = container.id;
                if (!opt.chartConfig.chart.width) {
                    console.log("No chart width specified, setting it to " + opt.width);
                    opt.chartConfig.chart.width = opt.width;
                }
                if (!opt.chartConfig.chart.height) {
                    console.log("No chart height specified, setting it to " + opt.height);
                    opt.chartConfig.chart.height = opt.height;
                }

                if ((opt.chartConfig.chart.type == 'column') || (opt.chartConfig.chart.type == 'line')) {
                    opt.chartConfig.chart.events = {
                        load: function () {
                            //console.log("Chart Loaded - Calling adjustXAxisLabels");
                            adjustXAxisLabels(this);
                        },
                        //redraw: function () {
                        //    console.log("Chart redrawn.");
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

                //Top part of stock chart
                if (chart.options.chart.type == 'spline') {
                    addLabelBoxes(chart);
                } else if (chart.options.chart.type == 'column') {
                //Bottom part of stock chart
                    adjustXAxisLabels(chart);
                } else if (chart.options.chart.type == 'line') {
                //Interactive financial chart
                    addLabelBoxes(chart);
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

                var imgs = document.getElementsByTagName('image');
                var imgUrls = [];
                for (imgIndex = 0; imgIndex < imgs.length; imgIndex = imgIndex + 1) {
                    //console.log('>>>>>> ' + imgIndex);
                    imgUrls.push(imgs[imgIndex].href.baseVal);
                }
                //console.log('Render finished.');
                return {
                    svg : svgElement,
                    imgUrls: imgUrls
                };

            }, args);

            var counter, imagesLoaded = false;

            function decrementImgCounter() {
                counter -= 1;
                if (counter < 1) {
                    imagesLoaded = true;
                }
            }

            function loadImages(imgUrls) {
                var i, img;
                counter = imgUrls.length;
                for (i = 0; i < imgUrls.length; i += 1) {
                    img = new Image();
                    /* onload decrements the counter, also when error (perhaps 404), don't wait for this image to be loaded */
                    img.onload = img.onerror = decrementImgCounter;
                    /* force loading of images by setting the src attr.*/
                    img.src = imgUrls[i];
                }
            }

            function renderImage(svg) {

                var interval, timer;
                
                if (svg.imgUrls.length > 0) {
                    loadImages(svg.imgUrls);
                } else {
                    // no images present, no loading, no waiting
                    imagesLoaded = true;
                }

                if (!imagesLoaded) {
                    // render with interval, waiting for all images loaded
                    interval = window.setInterval(function () {
                        if (imagesLoaded) {
                            clearTimeout(timer);
                            clearInterval(interval);
                            //convert(svg);
                            page.render(filename);
                            console.log('All dependencies loaded, finished writing to file: ' + filename);
                            exit(filename);
                        }
                        console.log('[renderImage]Waiting for [' + filename + '] dependencies to be loaded, imagesLoaded  = ' + imagesLoaded);
                    }, 50);

                    // we have a 5 second timeframe..
                    timer = window.setTimeout(function () {
                        clearInterval(interval);
                        exit('While rendering[' + filename + '], there\'s is a timeout reached');
                    }, config.TIMEOUT);
                } else {
                    //console.log('images are loaded, render rightaway');
                    //convert(svg);
                    page.render(filename);
                    console.log('Finished writing to file: ' + filename);
                    exit(filename);
                }
            }

            console.log('Start of writing to file: ' + filename);
            /*var SVG_DOCTYPE = '<?xml version=\"1.0" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">';
            // Saving SVG to a file
            fs.write(filename, SVG_DOCTYPE + svg);*/
            //page.render(filename);

            // Saving as PDF
            //page.render(filename.replace(/\.svg/, '.pdf'));
            //exit(filename);
            renderImage(svg);
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
                document.body.appendChild(container);

                function sigDevHTML(data) {

                    function getSigDevTableHeader() {
                        var html = '';

                        html += '<tr style="font-size: 12px !important; font-weight: bold !important;">';
                        html += '<td><span>Event</span></td>';
                        html += '<td><span>Event Summary</span></td>';
                        html += '</tr>';

                        return html;
                    }

                    function getSigDevTableBody() {
                        var html = '';
                        
                        data.forEach( function (row, index){
                            html += '<tr ' + ((index % 2 === 0) ? '' : 'class="alternateRow"') + '>'; //use advisen csss
                            
                            html += '<td>' + (row.dateAnncd || '') + '</td>';
                            html += '<td>' + (row.devhHeadline || '') + '</td>';
                            
                            html += '</tr>';
                            
                            if(row.description) {
                                html += '<tr ' + ((index % 2 === 0) ? '' : 'class="alternateRow"') + '>'; //use advisen csss
                                html += '<td colspan="2">' + (row.description || '') + '</td>';
                                
                                html += '</tr>';
                            }
                        });

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

                    sigdevDiv.innerHTML = html;
                }

                function mascadHTML(data) {

                    function getMascadTableHeader() {
                        var html = '';

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

                        return html;
                    }

                    function getMascadTableBody() {
                        var html = '';
                        
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

                            if(row.description) {
                                console.log('#################### creating description');
                                html += '<tr ' + ((index % 2 === 0) ? '' : 'class="alternateRow"') + '>'; //use advisen csss
                                html += '<td colspan="9">' + (row.description || '') + '</td>';
                                
                                html += '</tr>';
                            }

                        });

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
                fs.write(filename, stockTable);
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

                //console.log(request.url);
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