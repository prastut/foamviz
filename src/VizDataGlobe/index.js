import React from 'react';
import Geohash from 'latlon-geohash';
import Globe from './components/globe';
import Analytics from './components/analytics';
import TimeSeries from './components/timeseries';
import './index.css';

const transformData = data => data
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  .map((item) => ({
    createdAt: item.state.createdAt,
    lat: Geohash.decode(item.geohash).lat,
    lng: Geohash.decode(item.geohash).lon,
    stakedvalue: parseFloat((parseInt(item.state.deposit, 16) * 10 ** -18).toFixed(2)),
  }));

const getDataDateChunks = data => {
  const chunks = {};
  data.forEach(p => {
    const date = new Date(p.createdAt);
    const id = `${date.getFullYear()}-${date.getMonth()}`;
    if (!chunks[id]) chunks[id] = [];
    chunks[id].push(p);
  });
  return chunks;
};

class VizDataGlobe extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filteredData: [],
      loading: true,
      totalStackedValue: null,
      foamUSDRate: null,
    };

    this.reset = this.reset.bind(this);
    this.toggle = this.toggle.bind(this);
    this.filterData = this.filterData.bind(this);
  }

  async componentDidMount() {
    window.onresize = function(e) {
      if (window.RT) clearTimeout(window.RT);
      window.RT = setTimeout(function()
      { this.location.reload(false); }, 10)
    }
    const response = await fetch('https://map-api-direct.foam.space/poi/filtered?swLng=-180&swLat=-90&neLng=180&neLat=90&limit=10000&offset=0&sort=oldest').then(res => res.json());
    const data = transformData(response);
    const dataDateChunks = Object.values(getDataDateChunks(data));
    const foamUSDResponse = await fetch('https://poloniex.com/public?command=returnTicker').then(res => res.json());
    const {BTC_FOAM, USDC_BTC } = foamUSDResponse;

    this.setState({
      loading: false,
      data,
      filteredData: data,
      dataDateChunks,
      timelineMin: 0,
      timelineMax: dataDateChunks.length - 1,
      globalMax: dataDateChunks.length - 1,
      totalStackedValue: data
        .map(d => d.stakedvalue)
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
      foamUSDRate: BTC_FOAM.last * USDC_BTC.last
    });
  }

  filterData(newMinVal, newMaxVal) {
    const { timelineMin, timelineMax, dataDateChunks } = this.state;
    const filteredData = dataDateChunks
    .slice(newMinVal, newMaxVal)
    .reduce((a, b) => a.concat(b), []);

    if (newMinVal !== timelineMin || newMaxVal !== timelineMax) {
      this.setState({
        timelineMin: newMinVal,
        timelineMax: newMaxVal,
        filteredData,
        totalStackedValue: filteredData
          .map(d => d.stakedvalue)
          .reduce((a, b) => a + b, 0)
          .toFixed(2),
      });
    }
  }

  toggle() {
    const { playing } = this.state;
    this.setState({ playing: !playing });

    if (this.showInterval) {
      clearInterval(this.showInterval);
      this.showInterval = !this.showInterval;
      return;
    }

    const { timelineMax, timelineMin, globalMax } = this.state;

    this.setState(
      {
        timelineMin,
        timelineMax:
          timelineMax !== globalMax
            ? timelineMax + 1
            : timelineMin + 1,
      },
      () => {
        if (this.showInterval) clearInterval(this.showInterval);
        this.showInterval = setInterval(() => {
          const { timelineMin, timelineMax } = this.state;
          if (timelineMax + 1 > globalMax) return this.toggle();
          this.filterData(timelineMin, timelineMax + 1);
        }, 3000);
      },
    );
  }

  reset() {
    const { playing, dataDateChunks } = this.state;
    if (playing) this.toggle();
    this.filterData(0, dataDateChunks.length - 1);
  }

  render() {
    const {
      loading,
      playing,
      filteredData,
      dataDateChunks,
      timelineMin,
      timelineMax,
      totalStackedValue,
      foamUSDRate
    } = this.state;

    if (loading) return <p>loading...</p>;

    const [min, max] = [0, dataDateChunks.length - 1];

    return (
      <div>
        <Analytics
          display
          stackedValue={totalStackedValue}
          USDRate={foamUSDRate} />
        <Globe
          data={filteredData}
          pointWeight="stakedvalue"
          maxAltVal={10e3}
        />
        <TimeSeries
          display={true}
          count={2}
          length={filteredData.length || 0}
          minRange={min}
          maxRange={max}
          curMinVal={timelineMin}
          curMaxVal={timelineMax}
          curMinDate={dataDateChunks[timelineMin][0].createdAt}
          curMaxDate={dataDateChunks[timelineMax][0].createdAt}
          initialMinValue={min}
          initialMaxValue={max}
          filterData={this.filterData}
          play={this.toggle}
          reset={this.reset}
          isPlayButton={!playing}
        />
      </div>
    );
  }
}

export default VizDataGlobe;
