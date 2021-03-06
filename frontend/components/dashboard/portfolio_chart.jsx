import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';
import { 
  fetchHistoricalPrices
} from '../../util/prices_util';
import {
  calculatePortfolioValues,
  currentPortfolioValue
} from './portfolio_chart_util';


class CustomTooltip extends React.Component {
  render() {
    // debugger
    // this.props == { offset:-65, animationDuration:100, active:true, label:"Oct 25", payload:[{}] ...}
    // payload == [{time:"Oct 25", portfolioValue:11115.93}]

    const { active, label } = this.props || {};
    // debugger

    if (active && this.props.payload != null) {
      const { payload } = this.props || [{}];
      // debugger
      // let value = payload[0].value;
      let value = payload[0].value.toLocaleString();

      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{value}</p>
          <p className="tooltip-time">{label}</p>
        </div>
      );
    }
    return null;
  }
}


class PortfolioChart extends React.Component {
  constructor(props) {          // ONLY CALLED ONCE BEFORE THE FIRST RENDER
    super(props);
    // props == { portfolio, cashBalance, currentPrices, transactions }
    // cashBalance    == 1871.57
    // portfolio      == { 'BTC': 1, 'LTC' }
    // transactions   == { quantity: 1, price: 8143.05, transaction_type: "BUY", created_at: "2019-10-22T21:13:03.849Z", currency_symbol: 'BTC' }
    
    // currentPrices object contains 7 keys (currency symbols) ? currentPrices data doesn't hit constructor on 2nd render of this component why? (does hit render method below 2nd time)
    // currentPrices  == {  
    //                    'BTC': { 'USD': { 'PRICE': 9000 } }, 
    //                    'ETH': { 'USD': { 'PRICE': 160 } }, 
    //                    ... 
    //                    }
    // debugger
    
  
    this.state = {
      "1D-values": [],                                                          // array of portfolio values (floats) for that time period
      "1W-values": [],
      "1M-values": [],                
      "1Y-values": [],                
      "AllTime-values": [],                
      portfolioSymbols: Object.keys(this.props.portfolio),                      // portfolioSymbols == [ 'BTC', 'ETH ]
      timePeriodActive: '',                                                     // will contain string representing which time period chart to render/bold for css
    }

    this.getPortfolioData = this.getPortfolioData.bind(this);
  }


  componentDidMount() {                                                         // ONLY CALLED ONCE AFTER THE FIRST RENDER
    // On initial page load, get all 1M data for each currency in portfolio
    this.getPortfolioData("30", "day", "1M-values");                            // inputs = timeframe in days/min/or hours, interval, key to set state                                  
  }



  getPortfolioData(timeframe, interval, timeframeKey) {                         // timeframe in days, minutes, or hours (depends on api)
    const { transactions, portfolio } = this.props;
    // timeframe            == '30'        On initial render, refers to 30 days
    // interval             == 'day', 'hour', or 'minute'
    // this.props.portfolio == { 'BTC': 1, 'LTC' }
    // transactions == { quantity: 1, price: 8143.05, transaction_type: "BUY", created_at: "2019-10-22T21:13:03.849Z", currency_symbol: 'BTC' }
    // debugger

    // current portfolio
    let portfolioArray = Object.keys(this.props.portfolio);
    // portfolioArray == ['BTC', 'LTC']
    
    // raw data of historical prices { BTC: [], LTC: [], ... }
    let priceData = {};     

    // debugger

    // Promise.all takes an array of call backs
    Promise.all(portfolioArray.map( (symbol)=> {
      return fetchHistoricalPrices(symbol, timeframe, interval).then(
        (response) => {                                                         // response == currencyArray of objects
          // response.Data == [ {time:1569801600, close:8000 }, {}, ... ]       // for 1 currency!
          priceData[symbol] = response.Data;                                    // populate priceData object (outside of asynch func/loop) with currencyArray
        } 
      )  
    })).then(
      () => {
        return (
          this.setState({
            [timeframeKey]: calculatePortfolioValues(priceData, transactions),
            timePeriodActive: timeframeKey
          })
        );
      }
    );
  }



  render() {
    // debugger
    const { portfolio, currentPrices, cashBalance } = this.props;
    const { timePeriodActive } = this.state;

    // Dynamically set css attribute name so active <li> is highlighted on appropriate chart
    let dayActive, weekActive, monthActive, yearActive, xAxisTickCount;
    switch (timePeriodActive) {
      case "1D-values":
        dayActive = 'day-active';
        xAxisTickCount = 120;                                                    // every 120 minutes, make a tick on x axis
        break;
      case "1W-values":
        weekActive = 'week-active';
        xAxisTickCount = 24;                                                    // every 24 hours, make a tick on x axis
        break;
      case "1M-values":
        monthActive = 'month-active';
        xAxisTickCount = 5;                                                     // every 5 days, make a tick on x axis
        break;
      case "1Y-values":
        yearActive = 'year-active';
        xAxisTickCount = 30;                                                    // very 30 days, make a tick on x axis
    }

    // debugger

    return (
      <div id="portfoliochart-container">
        <section id="top-container">
          <div id="portfoliochart-current-val">
            <span id="your-portfolio-value">Your Portfolio Value</span> 
            <br/>
            <span className="current-val">${currentPortfolioValue(portfolio, currentPrices, cashBalance)}</span>
          </div>
          <div id="portfolio-timeframe">
            <ul id="time-periods-dashboard">
              <li className={dayActive} onClick={() => this.getPortfolioData("1440", "minute", "1D-values")}>1D</li>
              <li className={weekActive} onClick={() => this.getPortfolioData("168", "hour", "1W-values")}>1W</li>    {/* ? 168 refers to #hours */}
              <li className={monthActive} onClick={() => this.getPortfolioData("30", "day", "1M-values")}>1M</li>
              <li className={yearActive} onClick={() => this.getPortfolioData("360", "day", "1Y-values")}>1Y</li>
            </ul>
          </div>
        </section>

        <section id="bottom-container">
          <LineChart width={750} height={245} data={this.state[timePeriodActive]}>
            {/* <Tooltip content={<CustomTooltip/>} coordinate={{x: -1000, y: 0}}/> */}
            <Tooltip content={<CustomTooltip />} offset={-65} animationDuration={100} />
            {/* <Tooltip/>} */}
            {/* <Tooltip labelFormatter={() => 'hello'}/>} */}
            {/* <Tooltip formatter={(a, b, c) => { console.log(a, b, c) } } /> */}
            {/* <Tooltip separator="$"/> */}

            <XAxis dataKey="time" interval={xAxisTickCount}/>
            {/* <YAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} /> */}
            <YAxis type="number" domain={['dataMin', 'dataMax']}/>
            <Line
              type="monotone"
              dataKey="portfolioValue"
              dot={false}
              activeDot={{ r: 5 }}
            // stroke="#8884d8" 
            // strokeWidth={4}
            />
          </LineChart>
        </section>
      </div>
    );
  }
}


export default PortfolioChart;