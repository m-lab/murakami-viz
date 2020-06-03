// base imports
import React from 'react';
import Plot from 'react-plotly.js';

// module imports
import Loading from '../Loading.jsx';

let xAxis = [], yAxis = [];

function handleData(runs) {
  runs.map(run => {
    // const runDate = moment(run.DownloadTestStartTime.substr(0, 10));
    xAxis.push(run.DownloadTestStartTime.substr(0, 10));
    yAxis.push(run.DownloadRetransValue.toFixed(2));
  });

  console.log(runs);

  console.log(xAxis);
  console.log(yAxis);
}

export default function MainGraph(props) {
  const [ testSummary, setTestSummary ] = React.useState(null);
  const [ isLoaded, setIsLoaded ] = React.useState(false);
  const { runs, connections, testTypes, metric } = props;

  React.useEffect(() => {
    if (runs) {
      console.log(connections);

      // const found = arr1.some(r=> arr2.includes(r))
      //
      const filteredRuns = runs.filter( run => {
        // return connections.some(run => {
        //   run.TestName;
        // })
      });

      setTestSummary(filteredRuns);
      handleData(runs);
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
