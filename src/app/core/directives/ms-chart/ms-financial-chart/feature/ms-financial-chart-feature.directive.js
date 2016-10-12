/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .directive('msFinancialChartFeature', ['$timeout','$rootScope','$filter','commonBusiness', function ($timeout, $rootScope, $filter, commonBusiness) {

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

                    var hoveredChart = '';
                    var hoveredChartIndex = 0;
                    var resizeSensor;
                    var labelsBoxes = [];

                    function initializeChart(elem) {

                        var activity = scope.config;
                        scope.enableLabelRewrite = true;
                        $timeout(function(){
                            $(elem).find('.highcharts-legend-item').off('mouseover').on('mouseover',function(evt){
                                var text = $(this).find('tspan').text();
                                $('.highcharts-legend-box').css({
                                    //left:evt.clientX-$(this).position().left+200,
                                    left:evt.clientX - 320,
                                    top:evt.clientY-$(this).position().top+30
                                }).parent().css({'position':'relative'})

                                if(!$('.highcharts-legend-box').html()){
                                    $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                        '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                        '</div><div class="delete"><i class="fa fa-trash-o fa-lg pointer"></i></div>').show();
                                }
                                $('.highcharts-legend-box .name').text(text);
                            });
                        },500);

                        $(elem).empty();
                        $.each(activity.datasets, function (i, dataset) {
                            // Add X values
                            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                                return [activity.xData[j], val];
                            });
                        });

                        function addSeriesLabels(targetChart) {
                            if (targetChart.series) {
                                var tickerLabelTop;

                                for (var serCntr = 0; serCntr < targetChart.series.length; serCntr++) {
                                    var data = targetChart.series[serCntr].data,
                                        lastIndex = data.length - 1,
                                        chart = targetChart,
                                        lastPoint = data[lastIndex],
                                        x = chart.chartWidth - chart.marginRight + 5,
                                        y = lastPoint.plotY + chart.plotTop - 40,
                                        label;

                                    //adding tooltip as side labels with customize tooltip properties.
                                    label = chart.renderer.label(targetChart.series[serCntr].name,
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
                                            fill: targetChart.series[serCntr].color,
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

                        function setupXAxisLabels() {
                            console.log('[setupXAxisLabels]Rewriting xAxisLabels');
                            if (scope.enableLabelRewrite) {
                                scope.enableLabelRewrite = false;
                                console.log('[setupXAxisLabels]Rewriting xAxisLabels start');
                                var xAxisLabels = $(elem).find('.highcharts-xaxis-labels').find("text");
                                var blankCount = 0;
                                //console.log('Found ' + xAxisLabels.length + ' labels.');
                                if (xAxisLabels.length > 0) {
                                    xAxisLabels.each(function (i, xAxisLabel) {
                                        if (!xAxisLabel.firstChild.textContent) {
                                            //console.log(xAxisLabel.textContent);
                                            blankCount++;
                                        }
                                    });
                                    console.log('Found ' + blankCount + ' blanks.');
                                    if (blankCount == 0) {
                                        //Display xAxis Labels conditionally based on selected period - START
                                        var objLastLbl = xAxisLabels;
                                        var lastValue = objLastLbl.length - 1;
                                        var startDate = moment(objLastLbl[0].textContent, 'YYYY-MM-DD');
                                        var endDate = moment(objLastLbl[lastValue].textContent, 'YYYY-MM-DD');
                                        var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                                        var diffDays = duration.asDays();
                                        var diffMonths = Math.floor(duration.asMonths());
                                        var nextDispDate = startDate;
                                        //var beforeText, afterText;

                                        objLastLbl.each(function (txtCntr, element) {
                                            var currentPeriod = element.textContent;
                                            //beforeText = element.firstChild.textContent;
                                            if (diffMonths <= 1 && diffDays > 7) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate - currentPeriod === 0) {
                                                        nextDispDate = moment(nextDispDate).add(7, 'days');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    if (txtCntr == lastValue) {
                                                        element.firstChild.textContent = moment(currentPeriod).format('YYYY-MM-DD');
                                                    }
                                                }
                                            } else if (diffMonths <= 3 && diffMonths > 1) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('YYYY-MM-DD');
                                                        nextDispDate = moment(nextDispDate).add(14, 'days');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    //if (txtCntr == lastValue)
                                                    //    $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('YYYY-MM-DD') + '</tspan>';
                                                }
                                            } else if (diffMonths <= 12 && diffMonths > 3) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                                        nextDispDate = moment(nextDispDate).add(2, 'months');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    //if (txtCntr == lastValue)
                                                    //    $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('MMM-YYYY') + '</tspan>';
                                                }
                                            } else if (diffMonths <= 24 && diffMonths > 12) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                                        nextDispDate = moment(nextDispDate).add(3, 'months');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    //if (txtCntr == lastValue)
                                                    //    $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('MMM-YYYY') + '</tspan>';
                                                }
                                            } else if (diffMonths <= 36 && diffMonths > 24) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                                        nextDispDate = moment(nextDispDate).add(3, 'months');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    if (txtCntr == lastValue) {
                                                        element.firstChild.textContent = moment(currentPeriod).format('MMM-YYYY');
                                                    }
                                                }
                                            } else if (diffMonths <= 60 && diffMonths > 36) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('MMM-YYYY');
                                                        nextDispDate = moment(nextDispDate).add(1, 'years');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    if (txtCntr == lastValue) {
                                                        element.firstChild.textContent = moment(currentPeriod).format('MMM-YYYY');
                                                    }
                                                }
                                            } else if (diffMonths <= 120 && diffMonths > 60) {
                                                if (currentPeriod && nextDispDate) {
                                                    currentPeriod = moment(currentPeriod, 'YYYY-MM-DD');
                                                    if (nextDispDate <= currentPeriod) {
                                                        element.firstChild.textContent = moment(nextDispDate).format('YYYY');
                                                        nextDispDate = moment(nextDispDate).add(1, 'years');
                                                    } else {
                                                        element.firstChild.textContent = '';
                                                    }
                                                    if (txtCntr == lastValue) {
                                                        element.firstChild.textContent = moment(currentPeriod).format('YYYY');
                                                    }
                                                }
                                            }
                                            //afterText = element.firstChild.textContent;
                                            //console.log('[' + beforeText +',' + afterText + ']');
                                        });
                                    }
                                }
                                console.log('[setupXAxisLabels]Rewriting xAxisLabels end');
                                scope.enableLabelRewrite = true;
                            } else {
                                console.log('[setupXAxisLabels]Rewriting xAxisLabels skipped');
                                return;
                            }
                        }
 
                            //$('<div style="min-height: 270px;">')
                            $('<div id="container" style="min-height: 550px;">')
                                .appendTo(elem)
                                .highcharts({
                                    chart: {
                                        events: {
                                            redraw: function () {
                                                console.log('Inside redraw!');
                                                if (labelsBoxes.length > 0) {
                                                    labelsBoxes.forEach(function (item) {
                                                        item.label.destroy();
                                                    });
                                                    labelsBoxes = [];
                                                }
                                                addSeriesLabels(this);

                                                //var xAxisLabels = $(elem).find('.highcharts-xaxis-labels').find("text");
                                                //var blankCount = 0;
                                                //console.log('Found ' +xAxisLabels.length + ' labels.');
                                                //xAxisLabels.each(function (i, xAxisLabel) {
                                                //    if (!xAxisLabel.firstChild.textContent) {
                                                //        console.log(xAxisLabel.textContent);
                                                //        blankCount++;
                                                //    }
                                                //});
                                                //console.log('Found ' + blankCount + ' blanks.');
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
                                                            item.on('mouseover', function (evt) {
                                                                var text = $(this)[0].innerHTML;
                                                                if($(this)[0].innerHTML.indexOf(' ') > -1)
                                                                    text = $(this)[0].innerHTML.substring(0, $(this)[0].innerHTML.lastIndexOf(' '));

                                                                var tooltipBox = $(this).closest('div').closest('#stock-chart').find('.highcharts-legend-box');

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
                                                                var tooltipBox = $(this).closest('div').closest('#stock-chart').find('.highcharts-legend-box');
                                                                //hide tooltip
                                                                tooltipBox.hide();
                                                            });
                                                        })(legendNum);
                                                    }
                                                }
                                                $timeout(function() {
                                                    addSeriesLabels;

                                                    setupXAxisLabels();
                                                    if (chart.xAxis != null && chart.xAxis.length > 0) {
                                                        chart.xAxis[0].labelRotation = 0;
                                                        chart.isDirty = true;
                                                    }
                                                }, 500);
                                            }
                                        },

                                        marginLeft: 80,
                                        marginRight: 80,
                                        spacingTop: activity.spacingTop,
                                        spacingBottom: 4,
                                        type: activity.type
                                    },
                                    title: {
                                        text: activity.name,
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
                                        tickPixelInterval: 10,
                                        labels: {
                                            align: 'right',
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

                                                        if (dateItem) {
                                                            activity.series.forEach(function (series) {
                                                                ratioValue = dateItem[series.name];
                                                                legendItem = legendItems[i].legendItem;
                                                                if (ratioValue) {
                                                                    legendItem.attr({ text: (series.name + ' ' + $filter("number")(ratioValue, 2)) });
                                                                } else {
                                                                    legendItem.attr({ text: (series.name + ' N/A') });
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

                                            if (dateItem) {
                                                activity.ratioNameArr.forEach(function (ratioName) {
                                                    ratioValue = dateItem[ratioName];
                                                    if (ratioValue) {
                                                        tooltipText += "<br/>" + ratioName + ':' + ratioValue;
                                                    } else {
                                                        tooltipText += "<br/>" + ratioName + ': N/A';
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

                            resizeSensor = new ResizeSensor(elem.find('#container')[0], function () {
                                console.log('Calling reflow!');
                                //$('#container').highcharts().xAxis[0].labelRotation = 0;
                                //$('#container').highcharts().isDirty = true;
                                var chart = $('#container').highcharts();
                                if(chart.xAxis != null && chart.xAxis.length > 0) {
                                    chart.xAxis[0].setCategories(activity.xData);
                                    chart.xAxis[0].labelRotation = 0;
                                    chart.isDirty = true;
                                }
                                $timeout(function () {
                                    setupXAxisLabels();
                                }, 500);
                                chart.reflow();
                            });

                            if (!$(elem).find('.highcharts-legend-box').length)
                                $(elem).append('<div class="highcharts-legend-box" style="display:none;"></div>');

                            $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                '</div><div class="delete"><a href="javascript:" class="trashIconTooltip"><i class="fa fa-trash-o fa-lg pointer"></i></a></div>');


                            $('.trashIconTooltip').click(function(){
                                var peer = $(this).parent().parent().find('.name').text().replace('&amp;','&');

                                peer = peer.substring(0,peer.lastIndexOf(' ')).trim();


                                scope.onPeerRemove(peer);
                            });

//                        });
                        //Auto Save functionality
                        commonBusiness.emitMsg('autosave');
                    }
                }
            };
        }]);
})();