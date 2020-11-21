// base imports
import React from 'react';
import Plot from 'react-plotly.js';
import _ from 'lodash';
import moment from 'moment';

// module imports
import Loading from '../Loading.jsx';
import { isString } from '../../../common/utils.js';

function handleData(runs, metric) {
  const xAxis = [];
  const yAxis = [];

  runs.map(run => {
    xAxis.push(moment(run.TestStartTime).format('YYYY-MM-DDThh:mm:ss'));

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

  return { xAxis: xAxis, yAxis: yAxis };
}

function handleGroupedData(runs, metric) {
  const xAxis = [];
  const yAxis = [];

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
      xAxis.push(moment(date).format('YYYY-MM-DDThh:mm:ss'));
      yAxis.push(parseFloat(median).toFixed(2));
    });

  return { xAxis: xAxis, yAxis: yAxis };
}

export default function MainGraph(props) {
  //const [testSummary, setTestSummary] = React.useState(null);
  const [titleText, setTitleText] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  //const [color, setColor] = React.useState('red');
  const [ndt, setNdt] = React.useState({});
  const [ookla, setOokla] = React.useState({});
  const { lid, runs, connections, testTypes, metric, group, dateRange } = props;

  function formatHover(runs) {
    return runs.map(run => {
      return `<span>${moment(
        run.TestStartTime,
        'YYYY-MM-DDThh:mm:ss',
      )}</span><br><span>${run.TestName} test</span><br><span>${
        run.MurakamiConnectionType
      } connection</span><br><span>${parseFloat(run.DownloadValue).toFixed(
        2,
      )} ${run.DownloadUnit} download</span><br><span>${parseFloat(
        run.UploadValue,
      ).toFixed(2)} ${run.UploadUnit} upload</span><br><span>${parseFloat(
        run.MinRTTValue,
      ).toFixed(2)} ${run.MinRTTUnit} latency</span><br>`;
    });
  }

  React.useEffect(() => {
    if (runs) {
      const ndtRuns = [];
      const ooklaRuns = [];
      runs.forEach(run => {
        if (lid && lid.length) {
          if (!lid.includes(run.lid)) {
            return;
          }
        }
        if (connections.length) {
          if (!connections.includes(run.MurakamiConnectionType)) {
            return;
          }
        }
        if (['ndt5', 'ndt7'].includes(run.TestName.toLowerCase())) {
          ndtRuns.push(run);
        } else if (
          [
            'speedtest-cli-single-stream',
            'speedtest-cli-multi-stream',
          ].includes(run.TestName.toLowerCase())
        ) {
          ooklaRuns.push(run);
        }
        return;
      });

      let ndtCoords, ooklaCoords;
      if (group === 'daily') {
        ndtCoords = handleGroupedData(
          _.groupBy(ndtRuns, run =>
            moment(run.TestStartTime, 'YYYY-MM-DD').startOf('day'),
          ),
          metric,
        );
        ooklaCoords = handleGroupedData(
          _.groupBy(ooklaRuns, run =>
            moment(run.TestStartTime, 'YYYY-MM-DD').startOf('day'),
          ),
          metric,
        );
      } else if (group === 'hourly') {
        ndtCoords = handleGroupedData(
          _.groupBy(ndtRuns, run =>
            moment(run.TestStartTime, 'YYYY-MM-DDThh:mm:ss').startOf('hour'),
          ),
          metric,
        );
        ooklaCoords = handleGroupedData(
          _.groupBy(ooklaRuns, run =>
            moment(run.TestStartTime, 'YYYY-MM-DDThh:mm:ss').startOf('hour'),
          ),
          metric,
        );
      } else {
        ndtCoords = handleData(ndtRuns, metric);
        ooklaCoords = handleData(ooklaRuns, metric);
      }

      if (metric === 'DownloadValue') {
        setTitleText('Download Speed (Mbit/s)');
      } else if (metric === 'UploadValue') {
        setTitleText('Upload Speed (Mbit/s)');
      } else if (metric === 'MinRTTValue') {
        setTitleText('Latency (ms)');
      }

      ndtCoords.text = formatHover(ndtRuns);
      ooklaCoords.text = formatHover(ooklaRuns);

      setNdt(ndtCoords);
      setOokla(ooklaCoords);

      //if (groupedRuns) {
      //  setTestSummary(groupedRuns);
      //} else {
      //  setTestSummary(filteredRuns);
      //}
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
            name: 'NDT',
            x: ndt.xAxis,
            y: ndt.yAxis,
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'red' },
            text: ndt.text,
            hoverinfo: 'text',
            hoverlabel: { bgcolor: '#41454c' },
            visible: testTypes.includes('ndt5'),
          },
          {
            name: 'Ookla',
            x: ookla.xAxis,
            y: ookla.yAxis,
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'orange' },
            text: ookla.text,
            hoverinfo: 'text',
            hoverlabel: { bgcolor: '#41454c' },
            visible: testTypes.includes('speedtest-cli-single-stream'),
          },
        ]}
        layout={{
          autosize: false,
          hovermode: 'closest',
          title: false,
          xaxis: {
            type: 'date',
            showgrid: false,
            range: [dateRange.startDate, dateRange.endDate],
            autorange: false,
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
