import React from 'react';
import CandleStickChart from './CandleStickChart';
import './App.css';

function App() {
    return (
        <div className="app-container">
            <div className="background-dots"></div>
            <h1 className="chart-title">Candlestick Chart Example</h1>
            <div className="chart-wrapper">
                <CandleStickChart />
            </div>
        </div>
    );
}

export default App;
