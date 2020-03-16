import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
//import Plot from 'react-plotly.js';
//import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    //display: 'flex',
  },
  toolbar: {
    //paddingRight: 24, // keep right padding when drawer closed
    //maxWidth: '100%',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
}));

export default function Dashboard() {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Dashboard
          </Typography>
          <IconButton color="inherit" href="/logout">
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container className={classes.container}>
          {/* Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Plot
                data={[
                  {
                    x: [1, 2, 3],
                    y: [2, 6, 3],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'rgb(235, 64, 52)' },
                  },
                  {
                    x: [1, 2, 3],
                    y: [6, 3, 9],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'rgb(52, 235, 107)' },
                  },
                  {
                    x: [1, 2, 3],
                    y: [3, 10, 4],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'rgb(38, 146, 163)' },
                  },
                  { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
                ]}
                layout={{ width: 600, height: 400, title: 'Speed Tests' }}
              />
            </Grid>
            <Grid item xs={12} />
          </Grid>
        </Container>
      </main>
    </Container>
  );
}
