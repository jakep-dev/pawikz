/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .directive('msStockChartFeature', ['$timeout','$rootScope', function ($timeout,$rootScope) {

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
                    function initializeChart (elem) {
                       /* $(elem).bind('mousemove', function (e) {
                            var chart,
                                point,
                                i;




                        Highcharts.each(Highcharts.charts, function(p, i) {

                            //console.log(p);
                            //p.renderTo.getAttribute('data-highcharts-chart')
                            //$(p.renderTo).mouseover(function(e) {
                            //$(elem).bind('mousemove touchmove', function (e) {

                                console.log('chartIndex: ' + p.index + ' i: ' + i);
                                console.log('Attr: ' + p.renderTo.getAttribute('data-highcharts-chart'));
                                //console.log('hoveredChartIndex in mouseover before: ' + hoveredChartIndex);
                                //hoveredChartIndex= p.index;
                            hoveredChartIndex = i;
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

                                    return;
                                }
                            })
                        });*/
$timeout(function(){
                        Highcharts.each(Highcharts.charts, function(p, i) {

                            $(p.renderTo).bind('mousemove touchmove touchstart', function(e) {
                                var point, ind = 0;
                                ind = i % 2 ? i - 1 : (i + 1 < Highcharts.charts.length ? i + 1 : i);

                                //ind = i % 2 ? i - 1 : (i < Highcharts.charts.length ? i + 1 : i);
                                //ind = i % 2 ? i - 1 : (i < Highcharts.charts.length ? i + 1 : i);
                                Array(i,ind).forEach(function(index){
                                    e = Highcharts.charts[index].pointer.normalize(e.originalEvent);
                                    point = Highcharts.charts[index].series[0].searchPoint(e, true);
                                    if (point) {
                                        point.onMouseOver(); // Show the hover marker
                                        //Highcharts.charts[ind].tooltip.refresh(point); // Show the tooltip
                                        Highcharts.charts[index].xAxis[0].drawCrosshair(e, point); // Show the crosshair
                                    }
                                })
                            });
                        })},5000);


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
                        //console.log('activity: ', scope.config.split('|')[0]);
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
                                                var startDate = new Date(activity.xData[0]);
                                                var endDate = new Date(activity.xData[activity.xData.length-1]);
                                                var currPeriod = new Date();
                                                var dispText = '';
                                                var diffDays = Math.round((endDate-startDate)/(1000*60*60*24));
                                                console.log(startDate);

                                                var nextDispDate =  new Date(startDate);
                                                //var nextDispDate = moment();
                                                console.log(nextDispDate);

                                                $('.highcharts-xaxis-labels').find("[text-anchor='end']").each(function(txtCntr) {
                                                    var currentPeriod = $(this)[0].textContent;
                                                    if(diffDays <= 31 && diffDays > 7){
                                                        if(currentPeriod && nextDispDate){
                                                            currentPeriod = new Date(currentPeriod);
                                                            if (nextDispDate - currentPeriod === 0)
                                                            {
                                                                nextDispDate.setDate(nextDispDate.getDate() + 7);
                                                            }
                                                            else
                                                            {
                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                            }
                                                        }
                                                    }
                                                    else if(diffDays <= 90 && diffDays>31)
                                                    {
                                                        if(currentPeriod && nextDispDate){
                                                            currentPeriod = new Date(currentPeriod);
                                                            if (nextDispDate - currentPeriod === 0)
                                                            {
                                                                nextDispDate.setDate(nextDispDate.getDate() + 15);
                                                            }
                                                            else
                                                            {
                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                            }
                                                        }
                                                    }
                                                     /* else if(diffDays <= 540)
                                                    {
                                                        console.log('60 Days');
                                                        dispText = '60 Days';
                                                        if (txtCntr % 60 > 0)
                                                            $(this)[0].innerHTML = '<tspan></tspan>';
                                                    }
                                                    else if(diffDays <= 730)
                                                    {
                                                        console.log('90 Days');
                                                        dispText = '90 Days';
                                                        if (txtCntr % 90 > 0)
                                                            $(this)[0].innerHTML = '<tspan></tspan>';
                                                    }
                                                    else if(diffDays <= 1095)
                                                    {
                                                        console.log('120 Days');
                                                        dispText = '120 Days';
                                                        if (txtCntr % 120 == 0)
                                                            $(this)[0].innerHTML = $(this)[0].innerHTML;
                                                        else
                                                            $(this)[0].innerHTML = '<tspan></tspan>';
                                                    }
                                                    else if(diffDays <= 3650)
                                                    {
                                                        console.log('365 Days');
                                                        dispText = '365 Days';
                                                        if (txtCntr % 365 > 0)
                                                            $(this)[0].innerHTML = '<tspan></tspan>';
                                                    }*/
                                                });

                                                $(".highcharts-legend-item path").attr({'stroke-width': 20});
                                                var chart = this,
                                                    legend = chart.legend;

                                                //chart.xAxis[0].setCategories(['15-Apr', '18-Apr', '19-Apr', '20-Apr']);
                                                if(legend && legend.allItems) {
                                                    //console.log('legend.allItems.length: ' + legend.allItems.length);
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
                                                                    top:$(this).position().top+17
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

                                                //Auto Save functionality
                                                $rootScope.$broadcast('autosave');
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
                                        type: 'datetime',
                                        //ordinal: true,
                                        //tickInterval: 24*3600*1000,
                                        //minTickInterval: 24*3600*1000,
                                        //min: activity.xData[0],
                                        //max: activity.xData[activity.xData.length-1],
                                        title: {
                                           ///text: dataset.xaxisTitle,
                                           text: (i%2==0)?'':'Period'
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
                                            /*,formatter: function() {
                                                //if(activity.xData[0])
                                                return Highcharts.dateFormat('%d %b %Y', this.value);
                                            }*/
                                            /*,formatter: function() {
                                                var d = new Date(this.value);
                                                if (d.getUTCMonth() == 0){
                                                    return Highcharts.dateFormat("%b-%Y",this.value);
                                                }else{
                                                    return Highcharts.dateFormat("%b",this.value);
                                                }
                                            }*/
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

                                                         for(var seriesCntr = 0; seriesCntr < seriesCnt; seriesCntr++) {
                                                             if ($('.highcharts-legend-item') && $('.highcharts-legend-item')[seriesCntr]) {
                                                                 if ((primarystockresp.stockChartPeerData[xIndex + (seriesCntr * primarystockresp.stockChartPrimaryData.length)]) &&
                                                                     primarystockresp.stockChartPeerData[xIndex + (seriesCntr * primarystockresp.stockChartPrimaryData.length)].ticker) {
                                                                     ($('.highcharts-legend-item')[seriesCntr]).children[1].innerHTML =
                                                                         primarystockresp.stockChartPeerData[xIndex + (seriesCntr * primarystockresp.stockChartPrimaryData.length)].ticker
                                                                         + ' ' + primarystockresp.stockChartPeerData[xIndex +
                                                                         (seriesCntr * primarystockresp.stockChartPrimaryData.length)].priceClose;

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
                                                        var xIndex = this.x;
                                                        Highcharts.each(series, function(p, n) {
                                                            yValue = p.data[pointIndex] ? p.data[pointIndex].y : ''
                                                            if(legendItems && legendItems[n])
                                                            {
                                                                legendItem = legendItems[n].legendItem;
                                                                //console.log('legendItem: ', legendItem);
                                                                if(n==0) {
                                                                    $.each(primarystockresp.stockChartPrimaryData, function (legCntr, v) {

                                                                        if (legCntr == xIndex) {
                                                                            //console.log('v.priceClose: v.ticker');
                                                                            //tooltipText = xPoint +"<br/>" + "Open: " + v.priceOpen + "<br/>" +"Close: " + v.priceClose + "<br/>" +"High: " + v.priceHigh + "<br/>" +"Low: " + v.priceLow + "<br/>" +"Vol: " + v.volume ;
                                                                            legendItem.attr({text: (p.name + ' ' + v.priceClose)});
                                                                        }
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    legendItem.attr({text: (p.name + ' ' + primarystockresp.stockChartPeerData[primarystockresp.stockChartPrimaryData.length*(n-1) + xIndex].priceClose)});
                                                                    //var legCntr=0;
                                                                    //legendItem.attr({ text: (p.name + ' ' + yValue.toFixed(2))});

                                                                    /*$.each(primarystockresp.stockChartPeerData, function (legCntr, v) {

                                                                        if (legCntr == n*xIndex && p.name == v.ticker) {
                                                                            //console.log('v.priceClose: v.ticker');
                                                                            //tooltipText = xPoint +"<br/>" + "Open: " + v.priceOpen + "<br/>" +"Close: " + v.priceClose + "<br/>" +"High: " + v.priceHigh + "<br/>" +"Low: " + v.priceLow + "<br/>" +"Vol: " + v.volume ;
                                                                            legendItem.attr({text: (p.name + ' ' + v.priceClose)});
                                                                        }
                                                                    });*/
                                                                }
                                                            }
                                                        });


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
                                                    tooltipText = xPoint +"<br/>" + "Open: " + v.priceOpen + "<br/>" +"Close: " + v.priceClose + "<br/>" +"High: " + v.priceHigh + "<br/>" +"Low: " + v.priceLow + "<br/>" +"Vol: " + v.volume ;
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