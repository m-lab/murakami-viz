// base imports
import React from 'react';
import Plot from 'react-plotly.js';
import _ from 'lodash';
import moment from 'moment';

// module imports
import Loading from '../Loading.jsx';

let xAxis = [],
  yAxis = [];

function handleData(runs, metric) {
  xAxis = [];
  yAxis = [];

  runs.map(run => {
    xAxis.push(run.DownloadTestStartTime.substr(0, 10));
    yAxis.push(run[metric].toFixed(2));
  });
}

function handleGroupedData(runs, metric) {
  xAxis = [];
  yAxis = [];

  Object.entries(runs)
    .sort((a, b) =>
        moment(a[0]).diff(moment(b[0]),
      ),
    )
    .map(([date, run]) => {
      const sorted = run.sort((a, b) =>
        moment(a.DownloadTestStartTime, 'YYYY-MM-DDThh:mm:ss').diff(
          moment(b.DownloadTestStartTime, 'YYYY-MM-DDThh:mm:ss'),
        ),
      );
      const midpoint = Math.ceil(sorted.length / 2);
      const median =
        sorted.length % 2 === 0
          ? (sorted[midpoint][metric] + sorted[midpoint - 1][metric]) / 2
          : sorted[midpoint - 1][metric];
      xAxis.push(date.substr(0, 10));
      yAxis.push(median.toFixed(2));
    });
}

export default function MainGraph(props) {
  const [testSummary, setTestSummary] = React.useState(null);
  const [titleText, setTitleText] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { runs, connections, testTypes, metric, group, dateRange } = props;

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

      let groupedRuns;
      if (group === 'daily') {
        console.debug('Grouping daily');
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.DownloadTestStartTime, 'YYYY-MM-DD').startOf('day'),
        );
        handleGroupedData(groupedRuns, metric);
      } else if (group === 'hourly') {
        console.debug('Grouping hourly');
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.DownloadTestStartTime, 'YYYY-MM-DDThh:mm:ss').startOf(
            'hour',
          ),
        );
        handleGroupedData(groupedRuns, metric);
      } else {
        console.debug('Not grouping');
        handleData(filteredRuns, metric);
      }

      if (metric === 'DownloadValue') {
        setTitleText('Download Speed (Mbit/s)');
      } else if (metric === 'UploadValue') {
        setTitleText('Upload Speed (Mbit/s)');
      } else if (metric === 'DownloadRetransValue') {
        setTitleText('Latency (Mbit/s)');
      }

      if ( groupedRuns ) {
        setTestSummary(groupedRuns);
      } else {
        setTestSummary(filteredRuns);
      }
    }
    setIsLoaded(true);
  }, [ connections, testTypes, metric, group ]);

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
            range: [
              dateRange.startDate,
              dateRange.endDate
            ]
          },
          yaxis: {
            showgrid: false,
            title: {
              text: titleText,
              font: {
                family: 'Roboto, monospace',
                size: 14,
              },
            },
          },
        }}
      />
    );
  }
}
