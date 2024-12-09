import React, { useState } from "react";
import { ChartCanvas, Chart, ZoomButtons } from "react-stockcharts";
import { BarSeries, CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY } from "react-stockcharts/lib/coordinates";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { timeFormat } from "d3-time-format";
import { last } from "react-stockcharts/lib/utils";

// Generate dummy data for 100 candles based on selected time interval
const generateData = (interval = 'day') => {
    const data = [];
    let open = 200;
    let date = new Date(2024, 9, 12);

    const intervals = {
        'month': 30 * 24 * 60 * 1000,  
        'week': 7 * 24 * 60 *  1000,    
        'day': 24 * 60 *  1000,        
        'hour': 60 *  1000,            
        '15min': 15 *  1000,            
    };

    const intervalDuration = intervals[interval] || intervals['day'];

    for (let i = 0; i < 200; i++) {
        const close = open + (Math.random() * 10 - 5);
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        const volume = Math.random() * 1000 + 500;
        data.push({
            date: new Date(date.getTime() + i * intervalDuration),  // Ensure date is correct
            open,
            high,
            low,
            close,
            volume,
        });
        open = close;
    }

    return data;
};

const CandleStickChart = ({ width, ratio }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [interval, setInterval] = useState('day');  // Track selected interval
    const [hoveredCandle, setHoveredCandle] = useState(null); // Store hovered candle data

    // Generate data based on selected interval
    const data = generateData(interval);

    // Check if data is valid
    if (!data || data.length === 0) {
        return <div>Loading...</div>;
    }

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
    const { data: chartData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);

    const margin = { left: 50, right: 50, top: 10, bottom: 30 };
    const height = 500;
    const gridHeight = height - margin.top - margin.bottom;
    const barChartHeight = gridHeight * 0.2;
    const barChartOrigin = (w, h) => [0, h - barChartHeight];

    // Zooming in and out
    const handleZoomIn = () => {
        setZoomLevel(prevZoomLevel => prevZoomLevel + 0.5);
    };

    const handleZoomOut = () => {
        setZoomLevel(prevZoomLevel => Math.max(0.1, prevZoomLevel - 0.5));
    };

    // Handle hovering over candlesticks and display the hovered data
    const handleCandlestickHover = (e, { currentItem }) => {
        if (currentItem) {
            setHoveredCandle(currentItem); // Update the hovered candle data
        }
    };

    // Update xExtents dynamically based on zoom level
    const xExtents = chartData.length > 0
        ? [
            xAccessor(last(chartData)) - (80 / zoomLevel),
            xAccessor(last(chartData)),
        ]
        : [0, 0];  // Set default values if no data exists

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 100,
                }}
            >
                <button
                    onClick={handleZoomIn}
                    style={{
                        width: "30px",
                        height: "30px",
                        margin: "5px",
                        background: "white",
                        color: "black",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    style={{
                        width: "30px",
                        height: "30px",
                        margin: "5px",
                        background: "white",
                        color: "black",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                >
                    -
                </button>
            </div>

            {/* Dropdown to select the interval */}
            <div
                style={{
                    position: "absolute",
                    top: "50px",
                    right: "10px",
                    zIndex: 100,
                }}
            >
                <select
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    style={{
                        padding: "5px",
                        backgroundColor: "white",
                        borderRadius: "5px",
                    }}
                >
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                    <option value="day">Day</option>
                    <option value="hour">Hour</option>
                    <option value="15min">15 Minutes</option>
                </select>
            </div>

            <ChartCanvas
                height={height}
                width={width}
                ratio={ratio}
                margin={margin}
                type="svg"
                seriesName="Candlestick Chart"
                data={chartData}
                xScale={xScale}
                xAccessor={xAccessor}
                displayXAccessor={displayXAccessor}
                xExtents={xExtents}
                zoomAnchor="mouse"
            >
                <Chart id={1} yExtents={d => [d.high, d.low]}>
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                        stroke="white"
                    />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={d => d.toFixed(2)}
                        stroke="white"
                    />
                    <CandlestickSeries
                        widthRatio={0.5}
                        fill={d => (d.close > d.open ? "green" : "red")}
                        wickStroke={d => (d.close > d.open ? "green" : "red")}
                        onMouseMove={handleCandlestickHover} // Attach hover handler
                    />
                    <OHLCTooltip origin={[-40, 0]} textFill="white" />
                </Chart>
                <Chart
                    id={2}
                    height={barChartHeight}
                    yExtents={d => d.volume}
                    origin={barChartOrigin}
                >
                    <BarSeries yAccessor={d => d.volume} fill="rgba(70,130,180,0.8)" />
                    <YAxis axisAt="left" orient="left" ticks={5} stroke="white" tickStroke="white" />
                </Chart>
                <CrossHairCursor stroke="white" />
            </ChartCanvas>

            {hoveredCandle && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        padding: "5px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        borderRadius: "5px",
                    }}
                >
                    <div>Date: {timeFormat("%Y-%m-%d")(hoveredCandle.date)}</div>
                    <div>Open: {hoveredCandle.open.toFixed(2)}</div>
                    <div>High: {hoveredCandle.high.toFixed(2)}</div>
                    <div>Low: {hoveredCandle.low.toFixed(2)}</div>
                    <div>Close: {hoveredCandle.close.toFixed(2)}</div>
                    <div>Volume: {hoveredCandle.volume.toFixed(0)}</div>
                </div>
            )}
        </div>
    );
};

export default fitWidth(CandleStickChart);
