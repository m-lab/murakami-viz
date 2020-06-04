// base imports
import React from 'react';
import Plot from 'react-plotly.js';

// module imports
import Loading from '../Loading.jsx';

let xAxis = [], yAxis = [];

function handleData(runs, metric) {
  xAxis = [];
  yAxis = [];

  runs.map(run => {
    // const runDate = moment(run.DownloadTestStar tTime.substr(0, 10));
    xAxis.push(run.DownloadTestStartTime.substr(0, 10));
    yAxis.push(run[metric].toFixed(2));
  });
}

export default function MainGraph(props) {
  const [ testSummary, setTestSummary ] = React.useState(null);
  const [ isLoaded, setIsLoaded ] = React.useState(false);
  const { runs, connections, testTypes, metric } = props;

  React.useEffect(() => {
    if (runs) {
      const filteredRuns = runs.filter( run => {
        if ( connections.length ) {
          if (connections.indexOf(run.MurakamiConnectionType) > -1) {
              return run;
          }
        }
        if ( testTypes.length ) {
          if (connections.indexOf(run.TestName) > -1) {
              return run;
          }
        }
      });

      console.log(filteredRuns);

      setTestSummary(filteredRuns);
      handleData(filteredRuns, metric);
    }
    setIsLoaded(true);
  }, [connections, testTypes, metric])

  if ( !isLoaded ) {
    return <Loading />;
  } else if ( !runs ) {
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
