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

                    var hoveredChart = '';
                    scope.sourceOptions = stockChartBusiness.sigDevSources;
                    var resizeSensor;
                    var labelsBoxes = [];
                    var redrawIndex = 0; 

                    function initializeChart (elem) {
                        // Get the data. The contents of the data file can be viewed at
                        var activity = JSON.parse(scope.config.split('|')[0]);
                        var primarystockresp = JSON.parse(scope.config.split('|')[1]);

                        scope.enableLabelRewrite = true;

                        $timeout(function() {
                            $(elem).find('.highcharts-legend-item').off('mouseover').on('mouseover', function(evt) {
                                var text = $(this).find('tspan').text();
                                $('.highcharts-legend-box').css({
                                    left:evt.clientX - 320,
                                    top:evt.clientY - $(this).position().top + 30
                                }).parent().css({'position':'relative'})

                                if (!$('.highcharts-legend-box').html()) {
                                    $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                        '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                        '</div><div class="delete"><i class="fa fa-trash-o fa-lg pointer"></i></div>').show();
                                }
                                $('.highcharts-legend-box .name').text(text);
                            });
                        }, 500);

                        $timeout(function() {
                            Highcharts.each(Highcharts.charts, function(p, i) {
                                $(p.renderTo).bind('mousemove touchmove touchstart', function(e) {
                                    var point;
                                    var ind = i % 2 ? i - 1 : (i + 1 < Highcharts.charts.length ? i + 1 : i);
                                    Array(i, ind).forEach(function(index) {
                                        e = Highcharts.charts[index].pointer.normalize(e.originalEvent);
                                        point = Highcharts.charts[index].series[0].searchPoint(e, true);
                                        if (point) {
                                            point.onMouseOver(); // Show the hover marker
                                            if (!(index % 2)) {
                                                Highcharts.charts[index].xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                            } else {
                                                Highcharts.charts[index].xAxis[0].hideCrosshair();
                                            }
                                        }
                                    })
                                });
                            })
                        }, 500);

                        /**
                         * Override the reset function, we don't need to hide the tooltips and crosshairs.
                         */
                        // Highcharts.Pointer.prototype.reset = function () {
                        //     return true;
                        // };

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
                            if (targetChart.series) {
                                var tickerLabelTop;
                                for (var seriesNdx = 0; seriesNdx < targetChart.series.length; seriesNdx++) {
                                    var data = targetChart.series[seriesNdx].data;
                                    var lastIndex = data.length - 1;
                                    var chart = targetChart;
                                    var lastPoint = data[lastIndex];
                                    var x = chart.chartWidth - chart.marginRight + 5;
                                    var y = lastPoint.plotY + chart.plotTop - 40;
                                    var label;

                                    //adding tooltip as side labels with customize tooltip properties.
                                    label = chart.renderer.label(targetChart.series[seriesNdx].name, x, y, 'callout', 0, lastPoint.plotY + chart.plotTop, null, null, 'tooltip')
                                        .css({
                                            color: '#FFFFFF',
                                            fontSize: '10px',
                                            width: '75px'
                                        })
                                        .attr({
                                            fill: targetChart.series[seriesNdx].color,
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
                                labelsBoxes.sort(function(a, b) {
                                    return a.y - b.y;
                                });

                                if (labelsBoxes.length > 1) {
                                    var H = Highcharts;
                                    H.each(labelsBoxes, function(labelBox, k) {
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

                        $(elem).empty();
                        $.each(activity.datasets, function (i, dataset) {
                            // Add X values
                            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                                return [activity.xData[j], val];
                            });

                            $('<div id="container" style="min-height: 275px;">')
                                .appendTo(elem)
                                .highcharts({
                                    chart: {
                                        events: {
                                            redraw: function () {
                                                if (i == 0 && redrawIndex == 0) {
                                                    if (labelsBoxes.length > 0) {
                                                        labelsBoxes.forEach(function (item) {
                                                            item.label.destroy();
                                                        });
                                                        labelsBoxes = [];
                                                    }
                                                    addSeriesLabels(this);
                                                    redrawIndex++;
                                                } else {
                                                    redrawIndex = 0;
                                                }
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
                                                                tooltipBox.hide();
                                                            });
                                                        })(legendNum);
                                                    }
                                                }
                                                if (i == 0) {
                                                    addSeriesLabels(this);
                                                }
                                            }
                                        },
                                        marginLeft: 80, // Keep all charts left aligned
                                        marginRight: 80,
                                        spacingTop: dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
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
                                        labels: {
                                            align: 'center',
                                            enabled: dataset.showxaxisLabel,
                                            autoRotationLimit: 90
                                        },
                                        tickInterval: parseInt(activity.xData.length / 10),
                                        tickLength: 5
                                    },
                                    yAxis: {
                                        title: {
                                            text: dataset.yaxisTitle
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false },
                                            point: {
                                                events: {
                                                    mouseOver: function(e) {
                                                        hoveredChart = this;
                                                        var legend = this.series.chart.legend;
                                                        var series = this.series.chart.series;
                                                        var legendItems = legend.allItems;
                                                        var legendItem;
                                                        var tspan;
                                                        var pointIndex = this.index;
                                                        var yValue;
                                                        var value;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, n) {
                                                            yValue = p.data[pointIndex] ? p.data[pointIndex].y : ''
                                                            if (legendItems && legendItems[n]) {
                                                                legendItem = legendItems[n].legendItem;
                                                                if (n == 0) {
                                                                    $.each(primarystockresp.stockChartPrimaryData, function (legCntr, v) {
                                                                        if (legCntr == xIndex) {
                                                                            v.priceClose = v.priceClose ? v.priceClose : 0;
                                                                            legendItem.attr({ text: (p.name + ' ' + ($filter('currency')(v.priceClose, '', 2))) });
                                                                        }
                                                                    });
                                                                } else {
                                                                    var peerLegendValue = primarystockresp.stockChartPeerData[primarystockresp.stockChartPrimaryData.length * (n - 1) + xIndex].priceClose;
                                                                    peerLegendValue = peerLegendValue ? peerLegendValue : 0;
                                                                    legendItem.attr({ text: (p.name + ' ' + ($filter('currency')(peerLegendValue, '', 2))) });
                                                                }
                                                            }
                                                        });
                                                    },
                                                    mouseOut: function(e) {
                                                        var legend = this.series.chart.legend;
                                                        var series = this.series.chart.series;
                                                        var legendItems = legend.allItems;
                                                        var legendItem;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, n) {
                                                            if (legendItems && legendItems[n]) {
                                                                legendItem = legendItems[n].legendItem;
                                                                legendItem.attr({ text: (p.name + '') });
                                                            }
                                                        });
                                                    },
                                                    click: function (evt) {
                                                        var series = this.series.chart.series;
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, n) {

                                                            if(scope.$parent.vm.chartId === 'chart-0' && n==0) {
                                                                $.each(primarystockresp.stockChartPrimaryData, function (legCntr, v) {
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
                                                                                $scope.selectedSources = [scope.sourceOptions[0]]; //$scope.$parent.vm.selectedSources || [scope.sourceOptions[0]];
                                                                                $scope.selectedRange = '+/- 3 months'; //$scope.$parent.vm.selectedRange || '+/- 3 months';
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
                                        formatter: function(){
                                            var tooltipText = '';
                                            var xPoint = this.x;
                                            $.each(primarystockresp.stockChartPrimaryData, function(i, v) {
                                                if (v.dataDate.substring(0, 10) == xPoint) {
                                                    tooltipText = xPoint + "<br/>" + "Open: " + v.priceOpen + "<br/>" + "Close: " + v.priceClose + "<br/>" + "High: " + v.priceHigh + "<br/>" + "Low: " + v.priceLow + "<br/>" + "Vol: " + v.volume;
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
                                    series: dataset.series
                                });

                            if (!$(elem).find('.highcharts-legend-box').length) {
                                $(elem).append('<div class="highcharts-legend-box" style="display:none;"></div>');
                            }

                            $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                '</div><div class="delete"><a href="javascript:" class="trashIconTooltip"><i class="fa fa-trash-o fa-lg pointer"></i></a></div>');

                            $('.trashIconTooltip').click(function() {
                                var peer = $(this).parent().parent().find('.name').text().replace('&amp;', '&');
                                peer = peer.substring(0, peer.lastIndexOf(' ')).trim();
                                scope.onPeerRemove(peer);
                            });
                        });

                        resizeSensor = new ResizeSensor($(elem).find('#container'), function () {
                            for (var ndx = 0; ndx < Highcharts.charts.length; ndx++) {
                                var chart = Highcharts.charts[ndx];
                                chart.reflow();
                            }
                        });

                        //Auto Save functionality
                        commonBusiness.emitMsg('autosave');
                    }
                }
            };
        }]);
})();