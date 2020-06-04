// base imports
import React from 'react';
import Plot from 'react-plotly.js';

// module imports
import Loading from '../Loading.jsx';

let xAxis = [],
  yAxis = [];

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
  const [ titleText, setTitleText ] = React.useState(null);
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

      if ( metric === 'DownloadValue' ) {
        setTitleText('Download Speed (Mbit/s)');
      } else if ( metric === 'UploadValue' ) {
        setTitleText('Upload Speed (Mbit/s)');
      } else if ( metric === 'DownloadRetransValue' ) {
        setTitleText('Latency (Mbit/s)');
      }

      setTestSummary(filteredRuns);
      handleData(filteredRuns, metric);
    }
    setIsLoaded(true);
  }, [connections, testTypes, metric, group]);

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
          title: false,
          xaxis: {
            showgrid: false,
          },
          yaxis: {
            showgrid: false,
            title: {
              text: titleText,
              font: {
                family: 'Roboto, monospace',
                size: 14,
              }
            }
          },
        }}
      />
    );
  }
}
