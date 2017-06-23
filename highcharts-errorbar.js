/**
 * Highcharts-errobar v1.0 (2015-07-29)
 *
 * (c) 2015 Michael Young
 *
 * License: Creative Commons Attribution
 */

/*global HighchartsAdapter*/
var Highcharts = require('highcharts');
(function (Highcharts, UNDEFINED) {


    var defaultOptions = Highcharts.getOptions(),
        defaultPlotOptions = Highcharts.getOptions().plotOptions,
        each = Highcharts.each,
        pick = Highcharts.pick,
        extendClass = Highcharts.extendClass,
        merge = Highcharts.merge,
        seriesTypes = Highcharts.seriesTypes,
        wrap = Highcharts.wrap,
        Series = Highcharts.Series,
        math = Math,
        mathRound = math.round,
        mathFloor = math.floor,
        mathMax = math.max,
        Color = Highcharts.Color,
        noop = function () {};

// 1 - set default options
    defaultPlotOptions.error_bar = merge(defaultPlotOptions.column, {
        color: '#000000',
        grouping: false,
        lineWidth: 1,
        linkedTo: ':previous',
        threshold: null,
        whiskerLength: 5,
        format: 'x'
    });


// 2 - Create the series object
    seriesTypes.error_bar = extendClass(seriesTypes.column, {
        type: 'error_bar',
        pointArrayMap: ['x','y','left','right'],
        xpointArrayMap: ['x','left','right'],
        ypointArrayMap: ['y'],
        toYData: function (point) {
            return [point.y];
        },
        pointValKey: 'y',
        drawDataLabels: seriesTypes.arearange ? seriesTypes.arearange.prototype.drawDataLabels : noop,


        translate: function () {
            var series = this,
                yAxis = series.yAxis,
                xAxis = series.xAxis,
                xpointArrayMap = series.xpointArrayMap,
                ypointArrayMap = series.ypointArrayMap;

            seriesTypes.column.prototype.translate.apply(series);

            // do the translation on each point dimension
            each(series.points, function (point) {

                each(xpointArrayMap, function (key) {
                    if (point[key] !== null) {
                        point[key + 'Plot'] = xAxis.translate(point[key], 0, 0, 0, 1);
                    }
                });
                each(ypointArrayMap, function (key) {
                    if (point[key] !== null) {
                        point[key + 'Plot'] = yAxis.translate(point[key], 0, 1, 0, 1);
                    }
                });
            });
        },

        getSymbol: noop,

        drawLegendSymbol: noop,

        drawGraph: noop,

        /**
         * Draw the data points
         */
        drawPoints: function () {
            var series = this,  //state = series.state,
                points = series.points,
                options = series.options,
                chart = series.chart,
                renderer = chart.renderer,
                pointAttr,
                graphic,
                shapeArgs,
                left,
                right,
                low,
                high,
                x,
                y,
                barPath,
                whiskerPath;

            each(points, function (point) {

                graphic = point.graphic;
                shapeArgs = point.shapeArgs;
                barAttr = {};
                whiskerAttr = {};
                format = options.format;
                color = point.color || series.color;
                if (point.plotY !== UNDEFINED) {

                    // Bar attributes
                    barAttr.stroke = point.barColor || options.barColor || color;
                    barAttr['stroke-width'] = pick(point.barWidth, options.barWidth, options.lineWidth);
                    barAttr.dashstyle = point.barDashStyle || options.barDashStyle;

                    // Whisker attributes
                    whiskerAttr.stroke = point.whiskerColor || options.whiskerColor || color;
                    whiskerAttr['stroke-width'] = pick(point.whiskerWidth, options.whiskerWidth, options.lineWidth);
                    whiskerAttr.dashstyle = point.whiskerDashStyle || options.whiskerDashStyle;

                    x = mathFloor(point.xPlot);
                    y = mathFloor(point.yPlot);
                    leftPlot = mathFloor(point.leftPlot);
                    rightPlot = mathFloor(point.rightPlot);

                    xWhiskerLow = mathFloor(y - options.whiskerLength);
                    xWhiskerHigh = mathFloor(y + options.whiskerLength);

                    switch(format) {
                        case 'x':
                            barPath = [
                                'M',
                                leftPlot, y,
                                'L',
                                rightPlot,y,
                                'z'
                            ];

                            whiskerPath = [
                                'M',
                                leftPlot, xWhiskerLow,
                                'L',
                                leftPlot, xWhiskerHigh,

                                'M',
                                rightPlot, xWhiskerLow,
                                'L',
                                rightPlot, xWhiskerHigh,

                                'z'
                            ];
                            break;
                    }


                    // Create or update the graphics
                    if (graphic) { // update
                        point.bar.animate({ d: barPath });
                        point.whiskers.animate({ d: whiskerPath });
                    } else {
                        point.graphic = graphic = renderer.g()
                            .add(series.group);

                        point.bar = renderer.path(barPath)
                            .attr(barAttr)
                            .add(graphic);

                        point.whiskers = renderer.path(whiskerPath)
                            .attr(whiskerAttr)
                            .add(graphic);
                    }
                }
            });
        }
    });
}(Highcharts));
