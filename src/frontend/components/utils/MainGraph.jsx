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
  console.debug('handleData() - runs: ', runs);
  console.debug('handleData() - metric: ', metric);
  xAxis = [];
  yAxis = [];

  runs.map(run => {
    xAxis.push(run.TestStartTime.substr(0, 10));

    // workaround for the different parameters across tests
    if (metric === 'MinRTTValue') {
      let latency = run['MinRTTValue']
        ? run['MinRTTValue']
        : run['ServerLatency'];
      yAxis.push(Number(latency).toFixed(2));
    } else if (metric === 'DownloadValue') {
      let rate = run[metric];
      if (isString(run['DownloadValueUnit'])) {
        if (run['DownloadValueUnit'].toLowerCase() === 'bit/s') {
          rate = run[metric] / 1000000;
        } else if (run['DownloadValueUnit'] === 'kb/s') {
          rate = run[metric] / 1000;
        }
      } else if (isString(run['UploadValueUnit'])) {
        if (run['UploadValueUnit'].toLowerCase() === 'bit/s') {
          rate = run[metric] / 1000000;
        } else if (run['UploadValueUnit'] === 'kb/s') {
          rate = run[metric] / 1000;
        }
      }
      yAxis.push(Number(rate).toFixed(2));
    } else {
      yAxis.push(Number(run[metric]).toFixed(2));
    }
  });
}

function handleGroupedData(runs, metric) {
  console.debug('handleGroupedData() - runs: ', runs);
  console.debug('handleGroupedData() - metric: ', metric);
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
      console.debug('Filtering runs:');
      const filteredRuns = runs.filter(run => {
        console.debug('Run being filtered: ', run);
        if (lid && lid.length) {
          console.debug('Filtering for lid: ', lid);
          if (!lid.includes(run.lid)) {
            console.debug(
              'Rejected: We have lids but does not include run.lid',
              run.lid,
            );
            return false;
          }
        }
        if (connections.length) {
          console.debug('Filtering for connections: ', connections);
          if (!connections.includes(run.MurakamiConnectionType)) {
            console.debug(
              'Rejected: We have connections but does not include run.MurakamiConnectionType',
              run.MurakamiConnectionType,
            );
            return false;
          }
        }
        if (testTypes.length) {
          console.debug('Filtering for testTypes: ', testTypes);
          if (!testTypes.includes(run.TestName)) {
            console.debug(
              'Rejected: We have testTypes but does not include run.TestName',
              run.TestName,
            );
            return false;
          }
        }
        return connections.length && testTypes.length;
      });

      let groupedRuns;
      if (group === 'daily') {
        console.debug('Grouping daily');
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.TestStartTime, 'YYYY-MM-DD').startOf('day'),
        );
        handleGroupedData(groupedRuns, metric);
      } else if (group === 'hourly') {
        console.debug('Grouping hourly');
        groupedRuns = _.groupBy(filteredRuns, run =>
          moment(run.TestStartTime, 'YYYY-MM-DDThh:mm:ss').startOf('hour'),
        );
        handleGroupedData(groupedRuns, metric);
        console.debug('xAxis: ', xAxis);
        console.debug('yAxis: ', yAxis);
      } else {
        console.debug('Not grouping');
        handleData(filteredRuns, metric);
        console.debug('xAxis: ', xAxis);
        console.debug('yAxis: ', yAxis);
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
            mode: 'lines+markers',
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
