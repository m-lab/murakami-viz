// base imports
import React from 'react';
import Plot from 'react-plotly.js';
import _ from 'lodash';
import moment from 'moment';

// module imports
import Loading from '../Loading.jsx';
import { isString } from '../../../common/utils.js';

let xAxis = [],
  yAxis = [];

function handleData(runs, metric) {
  xAxis = [];
  yAxis = [];

  runs.map(run => {
    xAxis.push(run.TestStartTime.substr(0, 10));

    // workaround for the different parameters across tests
    if (metric === 'MinRTTValue') {
      let latency = run['MinRTTValue']
        ? run['MinRTTValue']
        : run['ServerLatency'];
      latency = parseFloat(latency);
      yAxis.push(latency.toFixed(2));
    } else if (metric === 'DownloadValue') {
      let rate = parseFloat(run[metric]);
      if (isString(run['DownloadUnit'])) {
        if (run['DownloadUnit'].toLowerCase() === 'bit/s') {
          rate = rate / 1000000;
        } else if (run['DownloadUnit'].toLowerCase() === 'kb/s') {
          rate = rate / 1000;
        }
      }
      yAxis.push(rate.toFixed(2));
    } else if (metric === 'UploadValue') {
      let rate = parseFloat(run[metric]);
      if (isString(run['UploadUnit'])) {
        if (run['UploadUnit'].toLowerCase() === 'bit/s') {
          rate = rate / 1000000;
        } else if (run['UploadUnit'].toLowerCase() === 'kb/s') {
          rate = rate / 1000;
        }
      }
      yAxis.push(rate.toFixed(2));
    } else {
      let rate = parseFloat(run[metric]);
      yAxis.push(Number(rate).toFixed(2));
    }
  });
}

function handleGroupedData(runs, metric) {
  xAxis = [];
  yAxis = [];

  Object.entries(runs)
    .sort((a, b) => moment(a[0]).diff(moment(b[0])))
    .map(([date, run]) => {
      const sorted = run.sort((a, b) =>
        moment(a.TestStartTime, 'YYYY-MM-DDThh:mm:ss').diff(
          moment(b.TestStartTime, 'YYYY-MM-DDThh:mm:ss'),
        ),
      );
      const midpoint = Math.ceil(sorted.length / 2);
      console.log('sorted: ', sorted);
      console.log('midpoint: ', midpoint);
      console.log('metric: ', metric);
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
  const { lid, runs, connections, testTypes, metric, group, dateRange } = props;

  React.useEffect(() => {
    if (runs) {
      const filteredRuns = runs.filter(run => {
        if (lid && lid.length) {
          if (!lid.includes(run.lid)) {
            return false;
          }
        }
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
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.TestStartTime, 'YYYY-MM-DD').startOf('day'),
        );
        handleGroupedData(groupedRuns, metric);
      } else if (group === 'hourly') {
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.TestStartTime, 'YYYY-MM-DDThh:mm:ss').startOf('hour'),
        );
        handleGroupedData(groupedRuns, metric);
      } else {
        handleData(filteredRuns, metric);
      }

      if (metric === 'DownloadValue') {
        setTitleText('Download Speed (Mbit/s)');
      } else if (metric === 'UploadValue') {
        setTitleText('Upload Speed (Mbit/s)');
      } else if (metric === 'MinRTTValue') {
        setTitleText('Latency (ms)');
      }

      if (groupedRuns) {
        setTestSummary(groupedRuns);
      } else {
        setTestSummary(filteredRuns);
      }
    }
    setIsLoaded(true);
  }, [connections, testTypes, metric, group, runs, lid]);

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
            mode: 'markers',
            marker: { color: 'red' },
          },
        ]}
        layout={{
          autosize: true,
          title: false,
          xaxis: {
            showgrid: false,
            range: [dateRange.startDate, dateRange.endDate],
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
