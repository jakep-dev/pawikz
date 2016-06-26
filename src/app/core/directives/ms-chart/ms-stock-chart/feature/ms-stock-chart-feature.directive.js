/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';
    angular.module('app.core')
        .directive('msStockChartFeature', ['$timeout','$rootScope','commonBusiness', function ($timeout,$rootScope, commonBusiness) {

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
                        $timeout(function(){
                            Highcharts.each(Highcharts.charts, function(p, i) {

                                $(p.renderTo).bind('mousemove touchmove touchstart', function(e) {
                                    var point, ind = 0;
                                    ind = i % 2 ? i - 1 : (i + 1 < Highcharts.charts.length ? i + 1 : i);

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
                                //var xAxisLabels = $(p.renderTo).find('.highcharts-xaxis-labels').find("text");
                                //if(xAxisLabels && i%2 != 0){
                                //
                                //        //Display xAxis Labels conditionally based on selected period - START
                                //        //var objLastLbl = $(elem).find('.highcharts-xaxis-labels').find("[text-anchor='end']");
                                //        var objLastLbl = xAxisLabels;
                                //        var lastValue = objLastLbl.length - 1;
                                //        var startDate = moment(objLastLbl[0].textContent);
                                //        var endDate = moment(objLastLbl[lastValue].textContent);
                                //        var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                                //        var diffDays = duration.asDays();
                                //        var diffMonths = duration.asMonths();
                                //        var nextDispDate =  startDate;
                                //
                                //        objLastLbl.each(function(txtCntr) {
                                //            var currentPeriod = $(this)[0].textContent;
                                //            //$(this).attr('x',parseFloat($(this).attr('x'))+10);
                                //            $(this).css('transform','rotate(0)');
                                //            if(diffMonths <= 1 && diffDays > 7){
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //                    if (nextDispDate - currentPeriod === 0)
                                //                    {
                                //                        nextDispDate = moment(nextDispDate).add('days',7);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('YYYY-MM-DD')+'</tspan>';
                                //                }
                                //            }
                                //            else if(diffMonths <= 3 && diffMonths>1)
                                //            {
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //
                                //                    if (nextDispDate <= currentPeriod)
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(nextDispDate).format('YYYY-MM-DD')+'</tspan>';
                                //                        nextDispDate =  moment(nextDispDate).add('days', 14);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('YYYY-MM-DD')+'</tspan>';
                                //                }
                                //            }
                                //            else if(diffMonths <= 18 && diffMonths >3)
                                //            {
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //
                                //                    if (nextDispDate <= currentPeriod)
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(nextDispDate).format('MMM-YYYY')+'</tspan>';
                                //                        nextDispDate =  moment(nextDispDate).add('months', 2);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('MMM-YYYY')+'</tspan>';
                                //                }
                                //            }
                                //            else if(diffMonths <= 24 && diffMonths > 18)
                                //            {
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //
                                //                    if (nextDispDate <= currentPeriod)
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(nextDispDate).format('MMM-YYYY')+'</tspan>';
                                //                        nextDispDate =  moment(nextDispDate).add('months', 3);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('MMM-YYYY')+'</tspan>';
                                //                }
                                //            }
                                //            else if(diffMonths <= 36 && diffMonths > 24)
                                //            {
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //
                                //                    if (nextDispDate <= currentPeriod)
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(nextDispDate).format('MMM-YYYY')+'</tspan>';
                                //                        nextDispDate =  moment(nextDispDate).add('months', 4);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('MMM-YYYY')+'</tspan>';
                                //                }
                                //            }
                                //            else if(diffMonths <= 120 && diffMonths > 36)
                                //            {
                                //                if(currentPeriod && nextDispDate){
                                //                    currentPeriod = moment(currentPeriod);
                                //
                                //                    if (nextDispDate <= currentPeriod)
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(nextDispDate).format('YYYY')+'</tspan>';
                                //                        nextDispDate =  moment(nextDispDate).add('years', 1);
                                //                    }
                                //                    else
                                //                    {
                                //                        $(this)[0].innerHTML = '<tspan></tspan>';
                                //                    }
                                //                    if(txtCntr == lastValue)
                                //                        $(this)[0].innerHTML = '<tspan>'+moment(currentPeriod).format('YYYY')+'</tspan>';
                                //                }
                                //            }
                                //        });
                                //        //Display xAxis Labels - End
                                //}

                            })},500);




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
                            //$('<div style="min-height: 270px;">')
                            $('<div style="min-height: 275px;">')
                                .appendTo(elem)
                                .highcharts({
                                    chart: {
                                        events:{
                                            load: function() {
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
                                                                    width: '75px'
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
                                                else {
                                                    $timeout(function() {
                                                            var xAxisLabels = $(elem).find('.highcharts-xaxis-labels').find("text");
                                                            if (xAxisLabels) {

                                                                //Display xAxis Labels conditionally based on selected period - START
                                                                var objLastLbl = xAxisLabels;
                                                                var lastValue = objLastLbl.length - 1;
                                                                var startDate = moment(objLastLbl[0].textContent);
                                                                var endDate = moment(objLastLbl[lastValue].textContent);
                                                                var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                                                                var diffDays = duration.asDays();
                                                                var diffMonths = Math.floor(duration.asMonths());
                                                                var nextDispDate = startDate;
                                                                /*console.log('startDate: ' + objLastLbl[0].textContent);
                                                                console.log('endDate: ' + objLastLbl[lastValue].textContent);
                                                                console.log('diffMonths: ' + diffMonths);*/
                                                                objLastLbl.each(function (txtCntr) {
                                                                    var currentPeriod = $(this)[0].textContent;
                                                                    //$(this).css('transform','rotate(0)');
                                                                    if (diffMonths <= 1 && diffDays > 7) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);
                                                                            if (nextDispDate - currentPeriod === 0) {
                                                                                nextDispDate = moment(nextDispDate).add('days', 7);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            if (txtCntr == lastValue)
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('YYYY-MM-DD') + '</tspan>';
                                                                        }
                                                                    }
                                                                    else if (diffMonths <= 3 && diffMonths > 1) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);

                                                                            if (nextDispDate <= currentPeriod) {
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(nextDispDate).format('YYYY-MM-DD') + '</tspan>';
                                                                                nextDispDate = moment(nextDispDate).add('days', 14);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            //if (txtCntr == lastValue)
                                                                            //    $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('YYYY-MM-DD') + '</tspan>';
                                                                        }
                                                                    }
                                                                    else if (diffMonths <= 18 && diffMonths > 3) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);

                                                                            if (nextDispDate <= currentPeriod) {
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(nextDispDate).format('MMM-YYYY') + '</tspan>';
                                                                                nextDispDate = moment(nextDispDate).add('months', 2);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            //if (txtCntr == lastValue)
                                                                            //    $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('MMM-YYYY') + '</tspan>';
                                                                        }
                                                                    }
                                                                    else if (diffMonths <= 24 && diffMonths > 18) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);

                                                                            if (nextDispDate <= currentPeriod) {
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(nextDispDate).format('MMM-YYYY') + '</tspan>';
                                                                                nextDispDate = moment(nextDispDate).add('months', 3);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            if (txtCntr == lastValue)
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('MMM-YYYY') + '</tspan>';
                                                                        }
                                                                    }
                                                                    else if (diffMonths <= 36 && diffMonths > 24) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);

                                                                            if (nextDispDate <= currentPeriod) {
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(nextDispDate).format('MMM-YYYY') + '</tspan>';
                                                                                nextDispDate = moment(nextDispDate).add('months', 4);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            if (txtCntr == lastValue)
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('MMM-YYYY') + '</tspan>';
                                                                        }
                                                                    }
                                                                    else if (diffMonths <= 120 && diffMonths > 36) {
                                                                        if (currentPeriod && nextDispDate) {
                                                                            currentPeriod = moment(currentPeriod);

                                                                            if (nextDispDate <= currentPeriod) {
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(nextDispDate).format('YYYY') + '</tspan>';
                                                                                nextDispDate = moment(nextDispDate).add('years', 1);
                                                                            }
                                                                            else {
                                                                                $(this)[0].innerHTML = '<tspan></tspan>';
                                                                            }
                                                                            if (txtCntr == lastValue)
                                                                                $(this)[0].innerHTML = '<tspan>' + moment(currentPeriod).format('YYYY') + '</tspan>';
                                                                        }
                                                                    }
                                                                });
                                                                //Display xAxis Labels - End
                                                                //chart.xAxis[0].update({labels{rotation:0}});
                                                                if(chart.xAxis != null && chart.xAxis.length > 0)
                                                                {
                                                                    chart.xAxis[0].labelRotation = 0;
                                                                    chart.redraw();
                                                                }
                                                            }
                                                        },500);
                                                }
                                                //Auto Save functionality
                                               // $rootScope.$broadcast('autosave');
                                            }},

                                        //marginLeft: 80, // Keep all charts left aligned
                                        //marginRight: 90,
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
                                        //ordinal: true,
                                        //tickInterval: 24*3600*1000,
                                        //minTickInterval: 24*3600*1000,
                                        //min: activity.xData[0],
                                        //max: activity.xData[activity.xData.length-1],
                                        //title: {
                                            //text: dataset.xaxisTitle,
                                            //text: (i%2==0)?'':'Period'
                                        //},
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
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
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
                              //  peer = peer.substring(0,peer.lastIndexOf(' ')).trim();
                                scope.onPeerRemove(peer);
                            });

                        });
                        //Auto Save functionality
                        commonBusiness.emitMsg('autosave');
                    }
                }
            };
        }]);
})();