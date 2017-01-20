/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .directive('msStockChartFeature', ['$timeout', '$rootScope', '$filter', '$mdDialog', 'stockService', 'commonBusiness', 'stockChartBusiness', function ($timeout, $rootScope, $filter, $mdDialog, stockService, commonBusiness, stockChartBusiness) {
            return {
                restrict: 'EA',
                scope: {
                    'config': '=',
                    'onPeerRemove': '='
                },
                link: function (scope, elem, attr) {
                    scope.$watch('config', function (newVal, oldVal) {
                        if(newVal) {
                            $timeout(function(){
                                initializeChart(elem);
                            }, 1000);

                        }
                    });

                    scope.sourceOptions = stockChartBusiness.sigDevSources;
                    var resizeSensor;
                    var labelsBoxes = [];
                    var redrawIndex = 0;

                    function initializeChart (elem) {
                        // Get the data. The contents of the data file can be viewed at
                        var activity = JSON.parse(scope.config.split('|')[0]);
                        var stockDataResp = JSON.parse(scope.config.split('|')[1]);

                        scope.enableLabelRewrite = true;

                        $timeout(function() {
                            $(elem).find('.highcharts-legend-item').off('mouseover').on('mouseover', function(evt) {
                                $('.highcharts-legend-box').css({
                                    left:evt.clientX - 320,
                                    top:evt.clientY - $(this).position().top + 30
                                }).parent().css({'position':'relative'})
                            });
                        }, 500);

                        $timeout(function() {
                            Highcharts.each(Highcharts.charts, function(chart, chartNdx) {
                                $(chart.renderTo).bind('mousemove touchmove touchstart', function(e) {
                                    var ind = chartNdx % 2 ? chartNdx - 1 : (chartNdx + 1 < Highcharts.charts.length ? chartNdx + 1 : chartNdx);
                                    Array(chartNdx, ind).forEach(function(index) {
                                        var event = Highcharts.charts[index].pointer.normalize(e.originalEvent);
                                        var point;
                                        var i;
                                        var n;
                                        var targetY;
                                        var minDiff = Number.MAX_VALUE;
                                        var diff;
                                        var closestPoint;
                                        n = Highcharts.charts[index].series.length;
                                        if (n > 0) {
                                            targetY = event.chartY - 30;
                                            for (i = 0; i < n; i++) {
                                                point = Highcharts.charts[index].series[i].searchPoint(event, true);
                                                if (point) {
                                                    diff = Math.abs(point.plotY - targetY);
                                                    if (minDiff > diff) {
                                                        closestPoint = point;
                                                        minDiff = diff;
                                                    }
                                                }
                                            }
                                        }
                                        if (closestPoint) {
                                            closestPoint.onMouseOver(); // Show the hover marker
                                            Highcharts.charts[index].xAxis[0].drawCrosshair(e, closestPoint); // Show the crosshair
                                        }
                                    })
                                });
                            })
                        }, 500);

                        $timeout(function() {
                            Highcharts.each(Highcharts.charts, function(chart, chartNdx) {
                                $(chart.renderTo).bind('mouseleave', function(e) {
                                    var ind = chartNdx % 2 ? chartNdx - 1 : (chartNdx + 1 < Highcharts.charts.length ? chartNdx + 1 : chartNdx);
                                    if (chartNdx > ind) {
                                        var tempInd = ind;
                                        ind = chartNdx;
                                        chartNdx = tempInd;
                                    }
                                    Array(chartNdx, ind).forEach(function(index) {
                                        var event = Highcharts.charts[index].pointer.normalize(e.originalEvent);
                                        var point;
                                        var i;
                                        var n;
                                        n = Highcharts.charts[index].series.length;
                                        if (n > 0) {
                                            for (i = 0; i < n; i++) {
                                                point = Highcharts.charts[index].series[i].searchPoint(event, true);
                                                if (point) {
                                                    point.onMouseOut();
                                                    Highcharts.charts[index].xAxis[0].hideCrosshair();
                                                    if (Highcharts.charts[index].tooltip) {
                                                        Highcharts.charts[index].tooltip.hide(point);
                                                    }
                                                }
                                            }
                                        }
                                    })
                                });
                            })
                        }, 500);

                        /**
                         * Synchronize zooming through the setExtremes event handler.
                         */
                        function syncExtremes(e) {
                            var thisChart = this.chart;
                            if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
                                Highcharts.each(Highcharts.charts, function (chart) {
                                    if (chart !== thisChart) {
                                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                                            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                                        }
                                    }
                                });
                            }
                        }

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

                        $(elem).empty();
                        $.each(activity.datasets, function (i, dataset) {
                            // Add X values
                            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                                return [activity.xData[j], val];
                            });

                            var currentChart = $('<div id="container" style="min-height: 275px;">')
                                .appendTo(elem)
                                .highcharts({
                                    chart: {
                                        events: {
                                            redraw: function () {
                                                if (labelsBoxes.length > 0) {
                                                    labelsBoxes.forEach(function (item) {
                                                        item.label.destroy();
                                                    });
                                                    labelsBoxes = [];
                                                }
                                                addSeriesLabels(activity.topChart);
                                            }, 

                                            // side labels tooltip and legends to show the stock & peer name ticker in sorted order with custom dates
                                            load: function() {
                                                $(".highcharts-legend-item path").attr({'stroke-width': 20});
                                                var chart = this;
                                                var legend = chart.legend;
                                                if (legend && legend.allItems) {
                                                    for (var legendNum = 0, len = legend.allItems.length; legendNum < len; legendNum++) {
                                                        (function (legendNum) {
                                                            var item = legend.allItems[legendNum].legendItem;
                                                            item.on('mouseover', function (evt) {
                                                                var text = $(this)[0].innerHTML;
                                                                if ($(this)[0].innerHTML.indexOf(' ') > -1) {
                                                                    text = $(this)[0].innerHTML.substring(0, $(this)[0].innerHTML.lastIndexOf(' '));
                                                                }

                                                                var tooltipBox = $(this).closest('div').closest('#stock-chart').find('.highcharts-legend-box');

                                                                tooltipBox.css({
                                                                    left:$(this).position().left,
                                                                    top:$(this).position().top + 7
                                                                }).parent().css({'position':'relative'});

                                                                tooltipBox.html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                                                    '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                                                    '</div><div class="delete"><a href="javascript:" class="trashIconTooltip"><i class="fa fa-trash-o fa-lg pointer"></i></a></div>');

                                                                tooltipBox.find('.name').html(text);
                                                                tooltipBox.show();

                                                                $('.trashIconTooltip').click(function() {
                                                                    var peer = $(this).parent().parent().find('.name').text().replace('&amp;', '&');
                                                                    scope.onPeerRemove(peer);
                                                                });

                                                                tooltipBox.mouseover(function() {
                                                                    tooltipBox.show();
                                                                });

                                                                tooltipBox.mouseout(function() {
                                                                    tooltipBox.hide();
                                                                });
                                                            }).on('mouseout', function (evt) {
                                                                var tooltipBox = $(this).closest('div').closest('#stock-chart').find('.highcharts-legend-box');
                                                                tooltipBox.hide();
                                                            });
                                                        })(legendNum);
                                                    }
                                                }
                                            }
                                        },
                                        marginLeft: 80, // Keep all charts left aligned
                                        marginRight: 80,
                                        spacingTop: dataset.spacingTop,
                                        spacingBottom: 4,
                                        type: dataset.type
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
                                        events: {
                                            setExtremes: syncExtremes
                                        },
                                        showFirstLabel: true,
                                        showLastLabel: true,
                                        labels: {
                                            align: 'center',
                                            enabled: dataset.showxaxisLabel
                                        }
                                        ,
                                        tickPositioner: function () {
                                            if (i == 0) {
                                                //don't show tick marks for the line chart
                                                return [];
                                            } else {
                                                //show all marks for volume chart (i=1)
                                                return null;
                                            }
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
                                                        var legend = this.series.chart.legend;
                                                        var series = this.series.chart.series;
                                                        var legendItems = legend.allItems;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, seriesNdx) {
                                                            if (legendItems && legendItems[seriesNdx]) {
                                                                if (seriesNdx == 0) {
                                                                    $.each(stockDataResp.stockChartPrimaryData, function (stockNdx, primaryStock) {
                                                                        if (stockNdx == xIndex) {
                                                                            primaryStock.priceClose = primaryStock.priceClose ? primaryStock.priceClose : 0;
                                                                            legendItems[seriesNdx].legendItem.attr({ text: (p.name + ' ' + ($filter('currency')(primaryStock.priceClose, '', 2))) });
                                                                        }
                                                                    });
                                                                } else {
                                                                    var peerNdx = stockDataResp.stockChartPrimaryData.length * (seriesNdx - 1) + xIndex;
                                                                    var peerLegendValue = stockDataResp.stockChartPeerData[peerNdx].priceClose;
                                                                    peerLegendValue = peerLegendValue ? peerLegendValue : 0;
                                                                    legendItems[seriesNdx].legendItem.attr({ text: (p.name + ' ' + ($filter('currency')(peerLegendValue, '', 2))) });
                                                                }
                                                            }
                                                        });
                                                    },
                                                    mouseOut: function(e) {
                                                        var legend = this.series.chart.legend;
                                                        var series = this.series.chart.series;
                                                        var legendItems = legend.allItems;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, seriesNdx) {
                                                            if (legendItems && legendItems[seriesNdx]) {
                                                                legendItems[seriesNdx].legendItem.attr({ text: (p.name + '') });
                                                            }
                                                        });
                                                    },
                                                    click: function (evt) {
                                                        var series = this.series.chart.series;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, n) {

                                                            if(scope.$parent.vm.chartId === 'chart-0' && n==0) {
                                                                $.each(stockDataResp.stockChartPrimaryData, function (legCntr, v) {
                                                                    if (legCntr == xIndex) {
                                                                        var top = evt.layerY;
                                                                        var left = evt.layerX - 380;
                                                                        var width = 300;
                                                                        var html = ''+
                                                                        '<div layout="row" layout-align="space-around center" ng-if="selectedSources.length === 0"> ' +
                                                                        '   <div style="color: #ff0000; padding-top: 10px;">{{errorMessage}}</div> ' +
                                                                        '</div> ' +
                                                                        '<div layout="row" layout-align="space-between center"> ' +
                                                                        '   <h6><span>Sources</span></h6> ' +
                                                                        '   <md-select ng-model="selectedSources" multiple aria-label="Significant Sources"> ' +
                                                                        '       <md-option ng-repeat="source in sourceOptions" ng-value="source">{{source.label}}</md-option> ' +
                                                                        '   </md-select> ' +
                                                                        '</div> ' +
                                                                        '<div layout="row" layout-align="space-between center"> ' +
                                                                        '   <h6><span>Range</span></h6> ' +
                                                                        '   <md-select ng-model="selectedRange" aria-label="Significant Range">' +
                                                                        '       <md-option ng-repeat="range in rangeOptions" value="{{range}}">{{range}}</md-option> ' +
                                                                        '   </md-select> ' +
                                                                        '</div>' +
                                                                        '';
                                                                        $mdDialog.show({
                                                                            scope: scope,
                                                                            template: '<md-dialog>' + 
                                                                            '   <md-toolbar style="text-align: center; padding: 0px 10px">' + 
                                                                            '       <h2><span> Get More Information </span>' + 
                                                                            '       <span> {{selectedDate | date:"MM/dd/yyyy"}} </span> </h2>' + 
                                                                            '   </md-toolbar>' + 
                                                                            '   <md-dialog-content style="padding: 0px 15px">' + html + '</md-dialog-content>' + 
                                                                            '   <md-dialog-actions>' +  
                                                                            '       <md-button ng-click="showInfo()" style="text-transform: capitalize; background-color: #1e2129; color: #ffffff;"> Show Information </md-button>' + 
                                                                            '       <md-button ng-click="closeDialog()" style="text-transform: capitalize; background-color: #1e2129; color: #ffffff"> Close </md-button>' + 
                                                                            '   </md-dialog-actions>' +  
                                                                            '</md-dialog>',
                                                                            preserveScope:true,
                                                                            animate: 'full-screen-dialog',
                                                                            clickOutsideToClose:true,
                                                                            controller: function DialogController($scope, $mdDialog) {
                                                                                $scope.selectedSources = [scope.sourceOptions[0]];
                                                                                $scope.selectedRange = '+/- 3 months';
                                                                                $scope.rangeOptions = '+/- 1 week, +/- 1 month, +/- 3 months, +/- 6 months, +/- 1 year'.split(', ');
                                                                                $scope.selectedDate = new Date(v.dataDate);
                                                                                $scope.errorMessage = 'Please select source(s)';

                                                                                $scope.closeDialog = function () {
                                                                                    $mdDialog.hide();
                                                                                };

                                                                                $scope.showInfo = function () {

                                                                                    if($scope.selectedSources.length !== 0){
                                                                                        $scope.$parent.vm.selectedSources = $scope.selectedSources;
                                                                                        $scope.$parent.vm.selectedRange = $scope.selectedRange;
                                                                                        $scope.$parent.vm.selectedDate = v.dataDate;

                                                                                        $mdDialog.hide();
                                                                                    }
                                                                                };
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    tooltip: {
                                        formatter: function() {
                                            var tooltipText = '';
                                            var xPoint = this.x;
                                            var value;
                                            $.each(stockDataResp.stockChartPrimaryData, function(i, v) {
                                                if (v.dataDate.substring(0, 10) == xPoint) {
                                                    tooltipText = Highcharts.dateFormat('%m-%d-%Y', new Date(xPoint)) + "<br/>" + "Open: ";
                                                    value = parseFloat(v.priceOpen);
                                                    if (!isNaN(value)) {
                                                        value = $filter("number")(value, 2);
                                                    }
                                                    tooltipText += value;
                                                    tooltipText += "<br/>" + "Close: ";
                                                    value = parseFloat(v.priceClose);
                                                    if (!isNaN(value)) {
                                                        value = $filter("number")(value, 2);
                                                    }
                                                    tooltipText += value;
                                                    tooltipText += "<br/>" + "High: ";
                                                    value = parseFloat(v.priceHigh);
                                                    if (!isNaN(value)) {
                                                        value = $filter("number")(value, 2);
                                                    }
                                                    tooltipText += value;
                                                    tooltipText += "<br/>" + "Low: ";
                                                    value = parseFloat(v.priceLow);
                                                    if (!isNaN(value)) {
                                                        value = $filter("number")(value, 2);
                                                    }
                                                    tooltipText += value;
                                                    tooltipText += "<br/>" + "Vol: ";
                                                    value = parseFloat(v.volume);
                                                    if (!isNaN(value)) {
                                                        value = $filter("number")(value / 1000000.0, 2);
                                                    }
                                                    tooltipText += value;
                                                    tooltipText += "M";
                                                    //tooltipText = Highcharts.dateFormat('%m-%d-%Y', new Date(xPoint)) + "<br/>" + "Open: " + v.priceOpen + "<br/>" + "Close: " + v.priceClose + "<br/>" + "High: " + v.priceHigh + "<br/>" + "Low: " + v.priceLow + "<br/>" + "Vol: " + value + 'M';
                                                }
                                            });
                                            return tooltipText;
                                        },
                                        valueDecimals: dataset.valueDecimals,
                                        positioner: function () {
                                            return {x: 70, y: 0}
                                        },
                                        enabled: dataset.showtooltip
                                    },
                                    lang: {
                                        noData: "No Data Available"
                                    },
                                    noData: {
                                        style: {
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            color: '#FF0000'
                                        }
                                    },
                                    series: dataset.series
                                });

                            if (i == 0) {
                                activity.topChart = currentChart.highcharts();
                            } else {
                                activity.bottomChart = currentChart.highcharts();
                            }
                            if (!$(elem).find('.highcharts-legend-box').length) {
                                $(elem).append('<div class="highcharts-legend-box" style="display:none;"></div>');
                            }
                        });

                        resizeSensor = new ResizeSensor($(elem).find('#container'), function () {
                            var context = new Object();
                            if (activity.bottomChart.xAxis != null && activity.bottomChart.xAxis.length > 0) {
                                activity.bottomChart.xAxis[0].setCategories(activity.xData);
                            }
                            $timeout(function (params) {
                                params.labelsChanged = setupXAxisLabels($(params.chart.container).find('.highcharts-xaxis-labels').find('text'));
                                if (params.labelsChanged && (params.chart.xAxis != null) && (params.chart.xAxis.length > 0)) {
                                    params.chart.xAxis[0].labelRotation = 0;
                                    params.chart.isDirty = true;
                                    params.chart.redraw();
                                }
                            }, 500, false, { chart: activity.bottomChart, name: activity.name });
                            activity.topChart.reflow();
                            activity.bottomChart.reflow();
                        });
                    }
                }
            };
        }]);
})();