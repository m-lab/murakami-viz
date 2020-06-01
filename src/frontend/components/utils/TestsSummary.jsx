// base imports
import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';

// material ui imports
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
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

export default function TestsSummary(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { test } = props;

  if (test === 'NDT' || test === 'Ookla') {
    return (
      <Grid container item direction="row" spacing={2} xs={12}>
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
            50
          </Typography>
          <Typography component="div">Mbps</Typography>
          <Plot
            className={classes.plotSmall}
            config={{ displayModeBar: false }}
            data={[
              {
                x: [1, 2, 3],
                y: [6, 3, 9],
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'rgb(52, 235, 107)' },
                hoverinfo: 'none',
              },
            ]}
            layout={{
              autosize: true,
              // width: 250,
              // height: 250,
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
            Last 7 days: 28 tests
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
            61
          </Typography>
          <Typography component="div">Mbps</Typography>
          <Plot
            className={classes.plotSmall}
            config={{ displayModeBar: false }}
            data={[
              {
                x: [1, 2, 3],
                y: [2, 6, 3],
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'rgb(235, 64, 52)' },
                hoverinfo: 'none',
              },
            ]}
            layout={{
              autosize: true,
              // width: 250,
              // height: 250,
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
            Last 24 hours: 4 tests
          </Typography>
        </Grid>
      </Grid>
    );
  } else {
    return <div>Something went wrong. Please contact an administrator. </div>;
  }
}
