// base imports
import React from 'react';
import Plot from 'react-plotly.js';
import moment from 'moment';

// module imports
import Loading from '../Loading.jsx';

let xAxis = [], yAxis = [];
let hourMedian = 0, dayMedian = 0, hourRuns = 0, dayRuns = 0;

function handleData(runs, metric, group) {
  xAxis = [];
  yAxis = [];

  if ( group === 'hourly' ) {

    let hourTotalMbps = 0, dayTotalMbps = 0;

    let currentRunTime = moment(runs[0].DownloadTestStartTime.substr(0, 14));

    runs.map( (run, index) => {
      const runDate = moment(run.DownloadTestStartTime.substr(0, 14));
      if ( runDate.format('YYYY-MM-DD hh') === currentRunTime.format('YYYY-MM-DD hh') ) {
        hourTotalMbps += run[metric].toFixed(2);
        currentRunTime = moment(runs[index].DownloadTestStartTime.substr(0, 14));
      }
    })
  }

  runs.map(run => {
    const runDate = moment(run.DownloadTestStartTime.substr(0, 10));

    xAxis.push(run.DownloadTestStartTime.substr(0, 10));
    yAxis.push(run[metric].toFixed(2));
  });
}

export default function MainGraph(props) {
  const [ testSummary, setTestSummary ] = React.useState(null);
  const [ isLoaded, setIsLoaded ] = React.useState(false);
  const { runs, connections, testTypes, metric, group } = props;

  React.useEffect(() => {
    if (runs) {
      const filteredRuns = runs.filter(run => {
        if (connections.length) {
          if (!connections.includes(run.MurakamiConnectionType)) {
            return false;
          }
        }
        if (testTypes.length) {
          if (!testTypes.includes(run.TestName)) {
            return false;
          }
        }
        return connections.length && testTypes.length;
      });

      console.log(filteredRuns);

      setTestSummary(filteredRuns);
      handleData(filteredRuns, metric, group);
    }
    setIsLoaded(true);
  }, [connections, testTypes, metric]);

  if (!isLoaded) {
    return <Loading />;
  } else if (!runs) {
    return <div>No data to display. Is a device running?</div>;
  } else {
    return (
      <Plot
        data={[
          {
            x: xAxis,
            y: yAxis,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
        ]}
        layout={{
          autosize: true,
          // width: 820,
          // height: 440,
          title: false,
          xaxis: {
            showgrid: false,
          },
          yaxis: {
            showgrid: false,
          },
        }}
      />
    );
  }
}
