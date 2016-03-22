/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .directive('msStockChartFeature', ['$timeout', function ($timeout) {

            return {
                restrict: 'EA',
                scope: {
                    'config': '=',
                    'onPeerRemove': '='
                },
                link: function (scope, elem, attr) {
                    scope.$watch('config', function (newVal, oldVal) {
                        if(newVal) {
                            console.log('ms line bar chart initializeChart method------------');
                            $timeout(function(){
                                initializeChart(elem);
                            }, 1000);

                        }
                    });

                    var hoveredChart = '';
                    var hoveredChartIndex = 0;
                    function initializeChart (elem) {
                        Highcharts.each(Highcharts.charts, function(p, i) {
                            var chart,
                                point,
                                i;
                            //console.log(p);
                            //p.renderTo.getAttribute('data-highcharts-chart')
                            //$(p.renderTo).mouseover(function(e) {
                            //$(elem).bind('mousemove touchmove', function (e) {
                            $(elem).bind('mouseover', function (e) {

                                console.log('chartIndex: ' + p.index);
                                console.log('Attr: ' + p.renderTo.getAttribute('data-highcharts-chart'));
                                //console.log('hoveredChartIndex in mouseover before: ' + hoveredChartIndex);
                                hoveredChartIndex= p.index;
                                //console.log('hoveredChartIndex in mouseover after: ' + hoveredChartIndex);

                                chart = Highcharts.charts[hoveredChartIndex];
                                if(chart.series[0]){
                                    e = chart.pointer.normalize(e); // Find coordinates within the chart
                                    point = chart.series[0].searchPoint(e, true); // Get the hovered point
                                    if (point) {
                                        point.onMouseOver(); // Show the hover marker
                                        chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                    }

                                    if(hoveredChartIndex%2==0)
                                    {
                                        chart = Highcharts.charts[hoveredChartIndex+1];
                                    }
                                    else
                                    {
                                        chart = Highcharts.charts[hoveredChartIndex-1];
                                    }

                                    e = chart.pointer.normalize(e); // Find coordinates within the chart
                                    point = chart.series[0].searchPoint(e, true); // Get the hovered point
                                    if (point) {
                                        point.onMouseOver(); // Show the hover marker
                                        chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                    }
                                }
                            })
                        });

                        /**
                         * In order to synchronize tooltips and crosshairs, override the
                         * built-in events with handlers defined on the parent element.
                         */
                        /*$(elem).bind('mousemove touchmove', function (e) {
                         var chart,
                         point,
                         i;
                         var minCrossHairIndex=0, maxCrossHairIndex=1;
                         if(Highcharts.charts) {
                         console.log('hoveredChartIndex in mousemove: ' + hoveredChartIndex);
                         for (i = minCrossHairIndex; i <= maxCrossHairIndex; i = i + 1) {
                         chart = Highcharts.charts[i];
                         e = chart.pointer.normalize(e); // Find coordinates within the chart
                         point = chart.series[0].searchPoint(e, true); // Get the hovered point
                         if (point) {
                         point.onMouseOver(); // Show the hover marker
                         chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                         }
                         }
                         }
                         });*/

                        /*Highcharts.each(Highcharts.charts, function(p, i) {
                         $(elem).bind('mousemove touchmove touchstart', function(e) {
                         var point, ind = 0;
                         ind = i % 2 ? i - 1 : (i + 1 < Highcharts.charts.length ? i + 1 : i);
                         console.log(ind);
                         e = Highcharts.charts[ind].pointer.normalize(e.originalEvent);
                         point = Highcharts.charts[ind].series[0].searchPoint(e, true);
                         if (point) {
                         point.onMouseOver(); // Show the hover marker
                         //Highcharts.charts[ind].tooltip.refresh(point); // Show the tooltip
                         Highcharts.charts[ind].xAxis[0].drawCrosshair(e, point); // Show the crosshair
                         }
                         });
                         })*/

                        /**
                         * Override the reset function, we don't need to hide the tooltips and crosshairs.
                         */
                        Highcharts.Pointer.prototype.reset = function () {
                            return undefined;
                        };

                        /**
                         * Synchronize zooming through the setExtremes event handler.
                         */
                        function syncExtremes(e) {
                            var thisChart = this.chart;

                            if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
                                Highcharts.each(Highcharts.charts, function (chart) {
                                    if (chart !== thisChart) {
                                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                                            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {trigger: 'syncExtremes'});
                                        }
                                    }
                                });
                            }
                        }

                        // Get the data. The contents of the data file can be viewed at
                        var activity = JSON.parse(scope.config.split('|')[0]);
                        var primarystockresp = JSON.parse(scope.config.split('|')[1]);
                        $(elem).find('.highcharts-legend-item').off('mouseover').on('mouseover',function(evt){
                            var text = $(this).find('tspan').text();
                            $('.highcharts-legend-box').css({
                                left:evt.clientX-$(this).position().left+200,
                                top:evt.clientY-$(this).position().top
                            }).parent().css({'position':'relative'})

                            if(!$('.highcharts-legend-box').html()){
                                $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                    '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                    '</div><div class="delete"><i class="fa fa-trash-o fa-lg pointer"></i></div>').show();
                            }
                            $('.highcharts-legend-box .name').text(text);
                        });
                        $(elem).empty();
                        $.each(activity.datasets, function (i, dataset) {
                            // Add X values
                            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                                return [activity.xData[j], val];
                            });
                            //$('<div style="min-height: 270px;">')
                            $('<div style="min-height: 200px;">')
                                .appendTo(elem)
                                .highcharts({
                                    chart: {
                                        events:{
                                            load: function() {
                                                $(".highcharts-legend-item path").attr({'stroke-width': 20});
                                                var chart = this,
                                                    legend = chart.legend;

                                                if(legend && legend.allItems) {
                                                    //console.log('legend.allItems.length: ' + legend.allItems.length);
                                                    for (var legendNum = 0, len = legend.allItems.length; legendNum < len; legendNum++) {
                                                        (function (legendNum) {
                                                            var item = legend.allItems[legendNum].legendItem;
                                                            item.on('mouseover', function (evt) {
                                                                var text = $(this)[0].innerHTML;
                                                                if($(this)[0].innerHTML.indexOf(' ') > -1)
                                                                    text = $(this)[0].innerHTML.substring(0, $(this)[0].innerHTML.lastIndexOf(' '));

                                                                $('.highcharts-legend-box').css({
                                                                    left:$(this).position().left,
                                                                    top:$(this).position().top+17
                                                                }).parent().css({'position':'relative'});
                                                                $('.highcharts-legend-box').mouseover(function() {
                                                                    $('.highcharts-legend-box').show();
                                                                });

                                                                $('.highcharts-legend-box').mouseout(function() {
                                                                    $('.highcharts-legend-box').hide();
                                                                });

                                                                $('.highcharts-legend-box .name').html(text);
                                                                $('.highcharts-legend-box').show();

                                                            }).on('mouseout', function (evt) {
                                                                //hide tooltip
                                                                $('.highcharts-legend-box').hide();
                                                            });
                                                        })(legendNum);
                                                    }
                                                }
                                                if(i==0)
                                                {
                                                    if(this.series)
                                                    {
                                                        var labelsBoxes = [],
                                                            tickerLabelTop;
                                                        for(var serCntr=0;serCntr<this.series.length;serCntr++)
                                                        {
                                                            var data = this.series[serCntr].data,
                                                                lastIndex = data.length - 1,
                                                                chart = this,
                                                                lastPoint = data[lastIndex],
                                                                x = chart.chartWidth - chart.marginRight+5,
                                                                y = lastPoint.plotY + chart.plotTop - 17,
                                                                label;

                                                            //adding tooltip as label
                                                            label = chart.renderer.label(this.series[serCntr].name,
                                                                x,
                                                                y,
                                                                'callout',
                                                                0,
                                                                    lastPoint.plotY + chart.plotTop
                                                                , null, null, 'tooltip')
                                                                .css({
                                                                    color: '#FFFFFF',
                                                                    fontSize: '10px',
                                                                })
                                                                .attr({
                                                                    fill: this.series[serCntr].color,
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

                                                        if(labelsBoxes.length > 1) {
                                                            var H = Highcharts;
                                                            H.each(labelsBoxes, function(labelBox, k){
                                                                if(k>0){
                                                                    if(tickerLabelTop && labelBox.y < tickerLabelTop) {
                                                                        labelBox.y = tickerLabelTop;
                                                                        labelBox.label.attr({y: tickerLabelTop});
                                                                    }
                                                                }
                                                                tickerLabelTop = labelBox.y + labelBox.height;
                                                            });
                                                        }
                                                    }
                                                }
                                            }},

                                        //marginLeft: 80, // Keep all charts left aligned
                                        //marginRight: 90,
                                        marginRight: 55,
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
                                        title: {
                                            text: dataset.xaxisTitle
                                        },
                                        categories: activity.xData,
                                        //crosshair: true,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        events: {
                                            setExtremes: syncExtremes
                                        },
                                        labels: {
                                            enabled: dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: {enabled: false}
                                            ,point: {
                                                events: {
                                                    mouseOver: function(e) {
                                                        /*var xIndex = this.x;
                                                         var legendText='';
                                                         var seriesCnt = primarystockresp.stockChartPeerData.length/primarystockresp.stockChartPrimaryData.length;
                                                         //console.log('seriesCnt: ' + seriesCnt);
                                                         for(var seriesCntr = 0; seriesCntr < seriesCnt; seriesCntr++)
                                                         {
                                                         if($('.highcharts-legend-item') && $('.highcharts-legend-item')[seriesCntr])
                                                         {
                                                         if((primarystockresp.stockChartPeerData[xIndex + (seriesCntr*primarystockresp.stockChartPrimaryData.length)]) &&
                                                         primarystockresp.stockChartPeerData[xIndex + (seriesCntr*primarystockresp.stockChartPrimaryData.length)].ticker) {
                                                         ($('.highcharts-legend-item')[seriesCntr]).children[1].innerHTML =
                                                         primarystockresp.stockChartPeerData[xIndex + (seriesCntr*primarystockresp.stockChartPrimaryData.length)].ticker
                                                         + ' ' + primarystockresp.stockChartPeerData[xIndex +
                                                         (seriesCntr*primarystockresp.stockChartPrimaryData.length)].priceClose;

                                                         console.log(($('.highcharts-legend-item')[seriesCntr]).children[1].innerHTML);
                                                         }
                                                         }
                                                         }*/
                                                        hoveredChart=this;
                                                        var legend = this.series.chart.legend,
                                                            series = this.series.chart.series,
                                                            legendItems = legend.allItems,
                                                            legendItem,
                                                            tspan,
                                                            pointIndex = this.index,
                                                            yValue,
                                                            value;
                                                        Highcharts.each(series, function(p, n) {
                                                            yValue = p.data[pointIndex].y
                                                            //console.log('yValue: ' + yValue);
                                                            if(legendItems && legendItems[n])
                                                            {
                                                                legendItem = legendItems[n].legendItem;
                                                                //console.log(legendItem.innerHTML);
                                                                //console.log('legendItem.element.innerHTML: ' + legendItem.element.innerHTML);
                                                                //console.log('legendItem.textStr: ' + legendItem.textStr);
                                                                //console.log('p.name: ' + p.name);
                                                                //tspan = legendItem.element.children[0];
                                                                //console.log('tspan: ' + tspan);
                                                                //$(tspan)[0].innerHTML = p.name + ' ' + yValue;
                                                                //($('.highcharts-legend-item')[n]).children[1].innerHTML = p.name + ' ' + yValue.toFixed(2);
                                                                //legendItem.innerHTML = p.name + ' ' + yValue.toFixed(2);
                                                                legendItem.attr({ text: (p.name + ' ' + yValue.toFixed(2))})

                                                            }
                                                        });
                                                        //Write cross hair logic here
                                                        /*chart = Highcharts.charts[hoveredChartIndex];
                                                         e = chart.pointer.normalize(e); // Find coordinates within the chart
                                                         point = chart.series[0].searchPoint(e, true); // Get the hovered point
                                                         if (point) {
                                                         point.onMouseOver(); // Show the hover marker
                                                         chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                                         }

                                                         if(hoveredChartIndex%2==0)
                                                         {
                                                         chart = Highcharts.charts[hoveredChartIndex+1];
                                                         }
                                                         else
                                                         {
                                                         chart = Highcharts.charts[hoveredChartIndex-1];
                                                         }

                                                         e = chart.pointer.normalize(e); // Find coordinates within the chart
                                                         point = chart.series[0].searchPoint(e, true); // Get the hovered point
                                                         if (point) {
                                                         point.onMouseOver(); // Show the hover marker
                                                         chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                                         }*/
                                                    }
                                                }
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
                                    tooltip: {
                                        formatter: function(){

                                            var tooltipText='';
                                            var xPoint = this.x;
                                            $.each(primarystockresp.stockChartPrimaryData, function(i, v) {

                                                if (v.dataDate.substring(0,10) == xPoint) {
                                                    tooltipText = xPoint +"<br/>" + "Open: " + v.priceOpen + "<br/>" +"Close: " + v.priceClose + "<br/>" +"High: " + v.priceHigh + "<br/>" +"Low: " + v.priceLow + "<br/>" +"Vol: " + v.volume;
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
                            if(!$(elem).find('.highcharts-legend-box').length)
                                $(elem).append('<div class="highcharts-legend-box" style="display:none;"></div>');



                            $('.highcharts-legend-box').html('<div class="name"></div><div class="view"><i class="fa fa-eye fa-lg pointer"></i></div><div class="size">'+
                                '<div class="size-val">E</div><div class="size-val">S</div><div class="size-val">M</div><div class="size-val">L</div>'+
                                '</div><div class="delete"><a href="javascript:" class="trashIconTooltip"><i class="fa fa-trash-o fa-lg pointer"></i></a></div>');


                            $('.trashIconTooltip').click(function(){
                                var peer = $(this).parent().parent().find('.name').text().replace('&amp;','&');
                                scope.onPeerRemove(peer);
                            });

                        });

                    }

                }
            };
        }]);
})();