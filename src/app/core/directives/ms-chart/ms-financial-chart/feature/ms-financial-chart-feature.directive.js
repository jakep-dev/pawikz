/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .controller('msFinancialChartFeatureController', msFinancialChartFeatureController)
        .directive('msFinancialChartFeature', msFinancialChartFeatureDirective);

    function msFinancialChartFeatureController($scope) {
    }

    function msFinancialChartFeatureDirective($timeout, $rootScope, $filter, commonBusiness) {

        return {
            restrict: 'EA',
            scope: {
                'config': '='
            },
            controller: 'msFinancialChartFeatureController',
            controllerAs: 'vm',
            link: function (scope, elem, attr, vm) {
                scope.$watch('config', function (newVal, oldVal) {
                    if (newVal) {
                        initializeChart(elem);
                    }
                });

                var hoveredChart = '';
                var hoveredChartIndex = 0;
                var resizeSensor;
                var labelsBoxes = [];

                function initializeChart(elem) {

                    var activity = scope.config;
                    scope.enableLabelRewrite = true;

                    $(elem).empty();
                    $.each(activity.datasets, function (i, dataset) {
                        // Add X values
                        dataset.data = Highcharts.map(dataset.data, function (val, j) {
                            return [activity.xData[j], val];
                        });
                    });

                    function addSeriesLabels(targetChart) {
                        if (targetChart && targetChart.series) {
                            var context = new Object();
                            context.tickerLabelTop = undefined;
                            context.serCntr = undefined;
                            for (context.serCntr = 0; context.serCntr < targetChart.series.length; context.serCntr++) {
                                context.data = targetChart.series[context.serCntr].data;
                                context.lastIndex = context.data.length - 1;
                                for (context.i = context.lastIndex; context.i >= 0; context.i--) {
                                    context.lastPoint = context.data[context.i];
                                    if (context.lastPoint && context.lastPoint.plotY) {
                                        break;
                                    }
                                }

                                if (context.lastPoint && context.lastPoint.plotY) {
                                    context.x = targetChart.chartWidth - targetChart.marginRight + 5;
                                    context.y = context.lastPoint.plotY + targetChart.plotTop - 40;
                                    context.label = undefined;

                                    //adding tooltip as side labels with customize tooltip properties.
                                    context.label = targetChart.renderer.label(_.unescape(targetChart.series[context.serCntr].name),
                                        context.x,
                                        context.y,
                                        'callout',
                                        0,
                                            context.lastPoint.plotY + targetChart.plotTop
                                        , null, null, 'tooltip')
                                        .css({
                                            color: '#FFFFFF',
                                            fontSize: '10px',
                                            width: '75px'
                                        })
                                        .attr({
                                            fill: targetChart.series[context.serCntr].color,
                                            padding: 8,
                                            r: 6,
                                            zIndex: 6
                                        }).addClass('tooltip')
                                        .add();

                                    labelsBoxes.push({
                                        label: context.label,
                                        y: context.y,
                                        height: context.label.getBBox().height
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
                                        if (context.tickerLabelTop && labelBox.y < context.tickerLabelTop) {
                                            labelBox.y = context.tickerLabelTop;
                                            labelBox.label.attr({ y: context.tickerLabelTop });
                                        }
                                    }
                                    context.tickerLabelTop = labelBox.y + labelBox.height;
                                });
                            }
                        }
                    }

                    function setupXAxisLabels(list) {
                        //console.log('[setupXAxisLabels]Rewriting xAxisLabels start');
                        var context = new Object();
                        //context.xAxisLabels = $(elem).find('.highcharts-xaxis-labels').find("text");
                        context.xAxisLabels = list;
                        context.blankCount = 0;
                        context.labelsChanged = false;
                        if (context.xAxisLabels && (context.xAxisLabels.length > 0)) {

                            context.i = 0;
                            context.n = context.xAxisLabels.length;
                            context.totalSkip = 0;
                            context.targetLabels = [];

                            //console.log('Found ' + context.n + ' labels.');

                            context.startDate = moment(context.xAxisLabels[0].textContent, 'YYYY-MM-DD');
                            context.endDate = moment(context.xAxisLabels[context.n - 1].textContent, 'YYYY-MM-DD');
                            context.duration = moment.duration(moment(context.endDate).diff(moment(context.startDate)));
                            context.diffDays = context.duration.asDays();
                            context.diffMonths = Math.floor(context.duration.asMonths());
                            context.labelFormat;

                            if (context.diffMonths <= 1 && context.diffDays > 7) {
                                context.duration = moment.duration(7, 'days');
                                context.labelFormat = 'YYYY-MM-DD';
                            } else if (context.diffMonths <= 3 && context.diffMonths > 1) {
                                context.duration = moment.duration(14, 'days');
                                context.labelFormat = 'YYYY-MM-DD';
                            } else if (context.diffMonths <= 12 && context.diffMonths > 3) {
                                context.duration = moment.duration(2, 'months');
                                context.labelFormat = 'MMM-YYYY';
                            } else if (context.diffMonths <= 24 && context.diffMonths > 12) {
                                context.duration = moment.duration(3, 'months');
                                context.labelFormat = 'MMM-YYYY';
                            } else if (context.diffMonths <= 36 && context.diffMonths > 24) {
                                context.duration = moment.duration(3, 'months');
                                context.labelFormat = 'MMM-YYYY';
                            } else if (context.diffMonths <= 60 && context.diffMonths > 36) {
                                context.duration = moment.duration(1, 'years');
                                context.labelFormat = 'MMM-YYYY';
                            } else if (context.diffMonths <= 120 && context.diffMonths > 60) {
                                context.duration = moment.duration(1, 'years');
                                context.labelFormat = 'YYYY';
                            } else if (context.diffMonths > 120) {
                                context.duration = moment.duration(1, 'years');
                                context.labelFormat = 'YYYY';
                            }
                            context.nextDispDate = context.startDate.add(context.duration);

                            context.skipCount = 0;
                            context.currentDate = null;
                            context.currentDiff = 0;
                            context.prevDiff;

                            context.xAxisLabels.sort(function (a, b) {
                                if (a.textContent < b.textContent) {
                                    return -1;
                                } else if (a.textContent > b.textContent) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            for (context.i = 0; context.i < context.n; context.i++) {
                                //console.log(context.xAxisLabels[context.i].textContent);
                                context.prevDiff = context.currentDiff;
                                context.currentDate = moment(context.xAxisLabels[context.i].textContent, 'YYYY-MM-DD');
                                context.currentDiff = context.currentDate.diff(context.nextDispDate, 'days');
                                //console.log('i = ' + context.i + ' skipcount = ' + context.skipCount + ' totalSkip = ' + context.totalSkip + ' prevDiff = ' + context.prevDiff + ' currentDate = ' + context.currentDate.format("YYYY-MM-DD") + ' currentDiff = ' + context.currentDiff + '  nextDispDate = ' + context.nextDispDate.format("YYYY-MM-DD"));
                                if (context.currentDiff < 0) {
                                    context.skipCount++;
                                } else {
                                    if (context.currentDiff == 0) {
                                        context.targetLabels.push(
                                            {
                                                index: context.i,
                                                originalLabel: context.xAxisLabels[context.i].textContent,
                                                finalLabel: moment(context.xAxisLabels[context.i].textContent, 'YYYY-MM-DD').format(context.labelFormat),
                                                skipCount: context.skipCount
                                            }
                                        );
                                        context.totalSkip += context.skipCount;
                                        context.skipCount = 0;
                                    } else {
                                        if (Math.abs(context.prevDiff) > context.currentDiff) {
                                            context.targetLabels.push(
                                                {
                                                    index: context.i,
                                                    originalLabel: context.xAxisLabels[context.i].textContent,
                                                    finalLabel: moment(context.xAxisLabels[context.i].textContent, 'YYYY-MM-DD').format(context.labelFormat),
                                                    skipCount: context.skipCount
                                                }
                                            );
                                            context.totalSkip += context.skipCount;
                                            context.skipCount = 0;
                                        } else if (Math.abs(context.prevDiff) <= context.currentDiff) {
                                            if (context.targetLabels.length > 0) {
                                                if (context.targetLabels[context.targetLabels.length - 1].originalLabel === context.xAxisLabels[context.i - 1].textContent) {
                                                    context.targetLabels.push(
                                                        {
                                                            index: context.i,
                                                            originalLabel: context.xAxisLabels[context.i].textContent,
                                                            finalLabel: moment(context.xAxisLabels[context.i].textContent, 'YYYY-MM-DD').format(context.labelFormat),
                                                            skipCount: context.skipCount
                                                        }
                                                    );
                                                    context.totalSkip += context.skipCount;
                                                    context.skipCount = 0;
                                                } else {
                                                    context.targetLabels.push(
                                                        {
                                                            index: context.i - 1,
                                                            originalLabel: context.xAxisLabels[context.i - 1].textContent,
                                                            finalLabel: context.nextDispDate.format(context.labelFormat),
                                                            skipCount: context.skipCount - 1
                                                        }
                                                    );
                                                    context.totalSkip += context.skipCount - 1;
                                                    context.skipCount = 1;
                                                }
                                            } else {
                                                context.targetLabels.push(
                                                    {
                                                        index: context.i - 1,
                                                        originalLabel: context.xAxisLabels[context.i - 1].textContent,
                                                        finalLabel: context.nextDispDate.format(context.labelFormat),
                                                        skipCount: context.skipCount - 1
                                                    }
                                                );
                                                context.totalSkip += context.skipCount - 1;
                                                context.skipCount = 1;
                                            }
                                        }
                                    }
                                    if (context.currentDiff > context.duration.asDays()) {
                                        context.nextDispDate = context.currentDate;
                                    } else {
                                        context.nextDispDate = context.nextDispDate.add(context.duration);
                                    }

                                }
                                if (!context.xAxisLabels[context.i].textContent) {
                                    context.blankCount++;
                                    break;
                                } else {
                                    var txt = context.xAxisLabels[context.i].textContent;
                                    var index = txt.search(/[A-Za-z]+\-[0-9]+/);
                                    //console.log('Label = ' + txt + ' position:' + index);
                                    if (index >= 0) {
                                        context.blankCount++;
                                        //console.log('Pre-existing Dates found.');
                                        break;
                                    }
                                }
                            }

                            //console.log('Found ' + context.blankCount + ' blanks.');
                            if (context.blankCount == 0) {
                                context.labelsChanged = true;
                                if (context.targetLabels.length > 0) {
                                    //we need to show the first label so we don't count the first label to skip
                                    context.targetLabels[0].skipCount--;
                                    context.totalSkip--;
                                    //console.log(JSON.stringify(context.targetLabels));
                                    context.labelCount = context.targetLabels.length;
                                    context.avgSkip_f = context.totalSkip / context.labelCount;
                                    context.avgSkip_low = Math.floor(context.avgSkip_f);
                                    context.finalSkip = (context.n - 1) - context.targetLabels[context.labelCount - 1].index - 1;
                                    //console.log('labelCount = ' + context.labelCount + ' totalSkip = ' + context.totalSkip + ' avgSkip_f = ' + context.avgSkip_f + ' avgSkip_low = ' + context.avgSkip_low + ' finalSkip = ' + context.finalSkip);
                                    if (context.finalSkip >= 0) {
                                        context.needToBorrow = context.avgSkip_low - context.finalSkip;
                                        //console.log('needToBorrow = ' + context.needToBorrow);
                                        context.targetLabels[context.labelCount - 1].index -= context.needToBorrow;
                                        if (context.needToBorrow > 0) {
                                            for (context.i = context.labelCount - 1; context.i >= 0; context.i--) {
                                                if (context.targetLabels[context.i].skipCount > context.avgSkip_low) {
                                                    context.targetLabels[context.i].skipCount = context.avgSkip_low;
                                                }
                                                if (context.i - 1 >= 0) {
                                                    context.newIndex = context.targetLabels[context.i].index - (context.avgSkip_low + 1);
                                                    if (context.targetLabels[context.i - 1].index > context.newIndex) {
                                                        context.targetLabels[context.i - 1].index = context.newIndex;
                                                    } else {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if (context.targetLabels[context.labelCount - 1].finalLabel === moment(context.xAxisLabels[context.n - 1].textContent, 'YYYY-MM-DD').format(context.labelFormat)) {
                                            context.targetLabels[context.labelCount - 1].index = context.n - 1;
                                            context.targetLabels[context.labelCount - 1].skipCount += context.avgSkip_low + 1;
                                            //console.log('Removed last x-axis label ' + context.targetLabels[context.labelCount - 1].finalLabel);
                                        } else {
                                            //add last label
                                            context.targetLabels.push(
                                                {
                                                    index: context.n - 1,
                                                    originalLabel: context.xAxisLabels[context.n - 1].textContent,
                                                    finalLabel: moment(context.xAxisLabels[context.n - 1].textContent, 'YYYY-MM-DD').format(context.labelFormat),
                                                    skipCount: context.avgSkip_low
                                                }
                                            );
                                        }
                                    }
                                    //add first label
                                    context.targetLabels.splice(0, 0,
                                        {
                                            index: 0,
                                            originalLabel: context.xAxisLabels[0].textContent,
                                            finalLabel: moment(context.xAxisLabels[0].textContent, 'YYYY-MM-DD').format(context.labelFormat),
                                            skipCount: 0
                                        }
                                    );
                                    //console.log(JSON.stringify(context.targetLabels));
                                    context.j = 0;
                                    context.beforeText;
                                    context.afterText;
                                    context.labelCount = context.targetLabels.length;
                                    context.totalSkip = 0;
                                    context.skipCount = 0;
                                    for (context.i = 0; context.i < context.n; context.i++) {
                                        context.beforeText = context.xAxisLabels[context.i].textContent;
                                        if ((context.j < context.labelCount) && (context.i == context.targetLabels[context.j].index)) {
                                            //$(context.xAxisLabels[context.i].firstChild).attr('content', context.xAxisLabels[context.i].firstChild.textContent);
                                            context.xAxisLabels[context.i].firstChild.textContent = context.targetLabels[context.j].finalLabel;
                                            context.targetLabels[context.j].skipCount = context.skipCount;
                                            context.skipCount = 0
                                            context.j++;
                                        } else {
                                            //$(context.xAxisLabels[context.i].firstChild).attr('content', context.xAxisLabels[context.i].firstChild.textContent);
                                            context.xAxisLabels[context.i].firstChild.textContent = '';
                                            context.totalSkip++;
                                            context.skipCount++;
                                        }
                                        context.afterText = context.xAxisLabels[context.i].textContent;
                                        //console.log('[' + context.beforeText + ',' + context.afterText + ']');
                                    }
                                    context.avgSkip_f = context.totalSkip / (context.labelCount - 1);
                                    context.avgSkip_low = Math.floor(context.avgSkip_f);
                                    context.extra = context.totalSkip - (context.avgSkip_low * (context.labelCount - 1));
                                    context.shortCount = context.labelCount - context.extra - 1;
                                    //console.log('labelCount = ' + context.labelCount + ' totalSkip = ' + context.totalSkip + ' avgSkip_f = ' + context.avgSkip_f + ' avgSkip_low = ' + context.avgSkip_low + ' extra = ' + context.extra + ' shortCount = ' + context.shortCount);
                                    if (context.avgSkip_low > 1) {
                                        for (context.i = 1; context.i <= context.labelCount - 2; context.i++) {
                                            context.j = context.targetLabels[context.i].index;
                                            //console.log('i = ' + context.i + ' before index = ' + context.j + ' extra = ' + context.extra + ' shortCount = ' + context.shortCount);
                                            if (context.targetLabels[context.i - 1].index < context.j) {
                                                context.xAxisLabels[context.j].firstChild.textContent = '';
                                            }
                                            if ((context.i % 2) == 1) {
                                                if (context.shortCount > 0) {
                                                    context.skipCount = context.avgSkip_low;
                                                    context.shortCount--;
                                                } else {
                                                    context.skipCount = context.avgSkip_low + 1;
                                                    context.extra--;
                                                }
                                            } else {
                                                if (context.extra > 0) {
                                                    context.skipCount = context.avgSkip_low + 1;
                                                    context.extra--;
                                                } else {
                                                    context.skipCount = context.avgSkip_low;
                                                    context.shortCount--;
                                                }
                                            }
                                            if (context.i == 1) {
                                                context.j = context.skipCount + 1;
                                            } else {
                                                context.j = context.targetLabels[context.i - 1].index + context.skipCount + 1;
                                            }
                                            context.targetLabels[context.i].index = context.j;
                                            //console.log('i = ' + context.i + ' after index = ' + context.j + ' extra = ' + context.extra + ' shortCount = ' + context.shortCount);
                                            context.xAxisLabels[context.j].firstChild.textContent = context.targetLabels[context.i].finalLabel;
                                        };
                                    }
                                }
                                //console.log(JSON.stringify(context.targetLabels));
                                //for (context.i = 0; context.i < context.n; context.i++) {
                                //    console.log('[' + context.i + '][' + context.xAxisLabels[context.i].textContent + ']');
                                //}
                            }
                        }
                        //console.log('[setupXAxisLabels]Rewriting xAxisLabels end');
                        return context.labelsChanged;
                    }

                    //$('<div style="min-height: 270px;">')
                    $('<div id="container" style="min-height: 550px;">')
                        .appendTo(elem)
                        .highcharts({
                            chart: {
                                events: {
                                    redraw: function () {
                                        //console.log('Inside redraw ' + activity.name);
                                        var currentChart = this;
                                        if (labelsBoxes.length > 0) {
                                            labelsBoxes.forEach(function (item) {
                                                item.label.destroy();
                                            });
                                            labelsBoxes = [];
                                        }
                                        addSeriesLabels(currentChart);
                                        //setupXAxisLabels();
                                    },

                                    // side labels tooltip and legends to show the stock & peer name ticker in sorted order with custom dates
                                    load: function() {
                                        $(".highcharts-legend-item path").attr({'stroke-width': 20});
                                        var chart = this,
                                            legend = chart.legend;

                                        if(legend && legend.allItems) {
                                            for (var legendNum = 0, len = legend.allItems.length; legendNum < len; legendNum++) {
                                                (function (legendNum) {
                                                    var item = legend.allItems[legendNum].legendItem;

                                                    //item.attr({ text: _.unescape(item.attr('textStr')) });
                                                    item.on('mouseover', function (evt) {
                                                        var text = $(this)[0].innerHTML;
                                                        if($(this)[0].innerHTML.indexOf(' ') > -1)
                                                            text = $(this)[0].innerHTML.substring(0, $(this)[0].innerHTML.lastIndexOf(' '));

                                                        var tooltipBox = $(this).closest('div').closest('#financial-chart').find('.highcharts-legend-box');

                                                        tooltipBox.css({
                                                            left:$(this).position().left,
                                                            top:$(this).position().top+7
                                                        }).parent().css({'position':'relative'});
                                                        tooltipBox.mouseover(function() {
                                                            tooltipBox.show();
                                                        });

                                                        tooltipBox.mouseout(function() {
                                                            tooltipBox.hide();
                                                        });

                                                        tooltipBox.find('.name').html(text);
                                                        tooltipBox.show();

                                                    }).on('mouseout', function (evt) {
                                                        var tooltipBox = $(this).closest('div').closest('#financial-chart').find('.highcharts-legend-box');
                                                        //hide tooltip
                                                        tooltipBox.hide();
                                                    });
                                                })(legendNum);
                                            }
                                        }

                                    }
                                },

                                marginLeft: 80,
                                marginRight: 80,
                                spacingTop: activity.spacingTop,
                                spacingBottom: 4,
                                type: activity.type
                            },
                            title: {
                                //text: activity.name,
                                text: '',
                                align: 'left',
                                margin: 0,
                                x: 30
                            },
                            credits: {
                                enabled: false
                            },
                            legend: {
                                enabled: activity.showlegend,
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
                                //tickPixelInterval: 10,
                                showFirstLabel: true,
                                showLastLabel: true,
                                labels: {
                                    align: 'center',
                                    //rotation: -45,
                                    enabled: activity.showxaxisLabel
                                }
                            },
                            plotOptions: {
                                series: {
                                    marker: { enabled: false },
                                    events: {
                                        legendItemClick: function () {
                                            //return false to disable hiding of line chart when legend item is click;
                                            return false;
                                        }
                                    },
                                    point: {
                                        events: {
                                            mouseOver: function(e) {
                                                hoveredChart=this;
                                                var legend = this.series.chart.legend,
                                                    series = this.series.chart.series,
                                                    legendItems = legend.allItems,
                                                    legendItem,
                                                    tspan,
                                                //pointIndex = this.index,
                                                    yValue,
                                                    value;
                                                var xIndex = this.category;
                                                var dateItem = activity.dateList[xIndex];
                                                var ratioValue;
                                                var i = 0;
                                                var currentObj;
                                                var fullName;

                                                if (dateItem) {
                                                    activity.series.forEach(function (series) {
                                                        fullName = null;
                                                        activity.ratioNameArr.forEach(function (ratioName) {
                                                            currentObj = activity.ratioNames[ratioName];
                                                            if (currentObj.shortName === series.name) {
                                                                fullName = ratioName;
                                                            }
                                                        });
                                                        if (!fullName) {
                                                            fullName = series.name;
                                                        }
                                                        ratioValue = dateItem[fullName];
                                                        legendItem = legendItems[i].legendItem;
                                                        if (ratioValue) {
                                                            legendItem.attr({ text: (_.unescape(series.name) + ' ' + $filter("number")(ratioValue, 2)) });
                                                        } else {
                                                            legendItem.attr({ text: (_.unescape(series.name) + ' N/A') });
                                                        }
                                                        i++;
                                                    });
                                                }

                                            }
                                        }
                                    }
                                }
                            },
                            yAxis: {
                                title: {
                                    text: activity.yaxisTitle
                                },
                                crosshair: {
                                    width: 1,
                                    color: 'gray',
                                    dashStyle: 'shortdot'
                                }
                            },
                            tooltip: {
                                formatter: function(){

                                    var xPoint = this.x;
                                    var tooltipText= xPoint;
                                    var dateItem = activity.dateList[xPoint];
                                    var ratioValue;
                                    var finalName;
                                    var currentObj;

                                    if (dateItem) {
                                        activity.ratioNameArr.forEach(function (ratioName) {
                                            ratioValue = dateItem[ratioName];
                                            currentObj = activity.ratioNames[ratioName];
                                            if (currentObj.shortName) {
                                                finalName = currentObj.shortName;
                                            } else {
                                                finalName = ratioName;
                                            }
                                            finalName = _.unescape(finalName);
                                            if (ratioValue) {
                                                tooltipText += "<br/>" + finalName + ':' + $filter("number")(ratioValue, 2);
                                            } else {
                                                tooltipText += "<br/>" + finalName + ': N/A';
                                            }
                                        });
                                    }
                                    return tooltipText;
                                },
                                valueDecimals: activity.valueDecimals,
                                positioner: function () {
                                    return {x: 70, y: 0}
                                },
                                enabled: activity.showtooltip
                            },
                            series: activity.series
                        });

                    activity.chartElement = elem.find('#container');

                    resizeSensor = new ResizeSensor(elem.find('#container')[0], function () {

                        var context = new Object();
                        context.chart = activity.chartElement.highcharts();
                        activity.currentSize = context.chart.chartWidth;
                        //console.log('[1]Chart ' + activity.name + ':' + activity.currentSize);

                        if (context.chart.xAxis != null && context.chart.xAxis.length > 0) {
                            context.chart.xAxis[0].setCategories(activity.xData);
                        }
                        $timeout(function (params) {
                            params.labelsChanged = setupXAxisLabels($(params.chart.container).find('.highcharts-xaxis-labels').find('text'));

                            //console.log('[3]Chart ' + params.name + ':Labels Changed:' + params.labelsChanged + ':width:' + params.chart.chartWidth);
                            if (params.labelsChanged && (params.chart.xAxis != null) && (params.chart.xAxis.length > 0)) {
                                params.chart.xAxis[0].labelRotation = 0;
                                params.chart.isDirty = true;
                                params.chart.redraw();
                            }
                        }, 500, false, { chart: context.chart, name: activity.name });
                        //console.log('[2]Calling reflow for ' + activity.name);
                        context.chart.reflow();

                    });

                }
            }
        };

    }

})();