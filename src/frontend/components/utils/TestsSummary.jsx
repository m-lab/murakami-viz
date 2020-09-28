// base imports
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';
import moment from 'moment';

// material ui imports
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// module imports
import Loading from '../Loading.jsx';
import { isString } from '../../../common/utils.js';

const useStyles = makeStyles(() => ({
  gridBorder: {
    border: '1px solid #000',
    borderRadius: '10px',
  },
  large: {
    fontSize: '3rem',
  },
  plotSmall: {
    height: '60px',
    width: '100%',
  },
  upper: {
    textTransform: 'uppercase',
  },
}));

let xAxisDay = [],
  yAxisDay = [],
  xAxisWeek = [],
  yAxisWeek = [];
let dayMedian = 0,
  weekMedian = 0,
  dayRuns = 0,
  weekRuns = 0;

function handleData(runs) {
  xAxisDay = [];
  yAxisDay = [];
  xAxisWeek = [];
  yAxisWeek = [];

  if (!runs.length) {
    dayMedian = 0;
    weekMedian = 0;
    dayRuns = 0;
    weekRuns = 0;
    return;
  } else {
    const weekAgo = moment()
      .subtract(7, 'd')
      .format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    let weekTotalMbps = 0,
      dayTotalMbps = 0;
    dayRuns = 0;
    weekRuns = 0;

    runs.map(run => {
      const runDate = moment(run.TestStartTime.substr(0, 10));

      let rate = Number(run.DownloadValue);
      if (isString(run.DownloadValueUnit)) {
        if (run['DownloadValueUnit'].toLowerCase() === 'bit/s') {
          rate = rate / 1000000;
        } else if (run['DownloadValueUnit'] === 'kb/s') {
          rate = rate / 1000;
        }
      }

      if (runDate.isBetween(weekAgo, today, 'days', '[]')) {
        weekTotalMbps += parseFloat(rate.toFixed(2));
        weekRuns += 1;
        xAxisWeek.push(run.TestStartTime.substr(0, 10));
        yAxisWeek.push(rate.toFixed(2));
      }

      if (runDate.format('YYYY-MM-DD') === today) {
        dayTotalMbps += parseFloat(rate.toFixed(2));
        dayRuns += 1;
        xAxisDay.push(run.TestStartTime.substr(0, 10));
        yAxisDay.push(rate.toFixed(2));
      }
    });

    weekMedian = weekTotalMbps / weekRuns;
    dayMedian = dayTotalMbps / dayRuns;

    if (isNaN(weekMedian)) {
      weekMedian = 0;
    }

    if (isNaN(dayMedian)) {
      dayMedian = 0;
    }
  }
}

export default function TestsSummary(props) {
  const classes = useStyles();
  const [testSummary, setTestSummary] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { runs, summary } = props;

  React.useEffect(() => {
    if (runs) {
      const filteredRuns = runs.filter(run => {
        return run.TestName === summary;
      });

      setTestSummary(filteredRuns);
      handleData(filteredRuns);
      setIsLoaded(true);
    }
  }, [runs, summary]);

  if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Grid
        container
        item
        direction="row"
        spacing={4}
        xs={12}
        className={classes.gridParent}
      >
        <Grid
          item
          className={`${classes.grid} ${classes.gridBorder}`}
          xs={12}
          sm={6}
        >
          <Typography component="div" className={classes.upper}>
            7 day median:
          </Typography>
          <Typography component="div" className={classes.large}>
            {weekMedian}
          </Typography>
          <Typography component="div">Mbps</Typography>
          <Plot
            className={classes.plotSmall}
            config={{ displayModeBar: false }}
            data={[
              {
                x: xAxisWeek,
                y: yAxisWeek,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'rgb(52, 235, 107)' },
                hoverinfo: 'none',
              },
            ]}
            layout={{
              autosize: true,
              margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 5,
              },
              title: false,
              xaxis: {
                showgrid: false,
                visible: false,
                zeroline: false,
              },
              yaxis: {
                showgrid: false,
                visible: false,
                zeroline: false,
              },
            }}
          />
          <Typography
            component="div"
            className={`${classes.upper} ${classes.textBorder}`}
          >
            Last 7 days: {weekRuns} tests
          </Typography>
        </Grid>
        <Grid
          item
          className={`${classes.grid} ${classes.gridBorder}`}
          xs={12}
          sm={6}
        >
          <Typography component="div" className={classes.upper}>
            24 hour median:
          </Typography>
          <Typography component="div" className={classes.large}>
            {dayMedian}
          </Typography>
          <Typography component="div">Mbps</Typography>
          <Plot
            className={classes.plotSmall}
            config={{ displayModeBar: false }}
            data={[
              {
                x: xAxisDay,
                y: yAxisDay,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'rgb(235, 64, 52)' },
                hoverinfo: 'none',
              },
            ]}
            layout={{
              autosize: true,
              margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 5,
              },
              title: false,
              xaxis: {
                showgrid: false,
                visible: false,
                zeroline: false,
              },
              yaxis: {
                showgrid: false,
                visible: false,
                zeroline: false,
              },
            }}
          />
          <Typography
            component="div"
            className={`${classes.upper} ${classes.textBorder}`}
          >
            Last 24 hours: {dayRuns} tests
          </Typography>
        </Grid>
      </Grid>
    );
  }
}
