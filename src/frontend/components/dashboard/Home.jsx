import React, { Component } from "react";
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
//import Plot from 'react-plotly.js';
//import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const useStyles = makeStyles(theme => ({
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    position: 'relative',
  },
  formControlLabel: {
    marginBottom: '0',
  },
  grid: {
    border: '1px solid black',
    padding: '20px',
  },
  inputLabel: {
    position: 'absolute',
    top: '-15px',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const connections = [
  'Wired',
  'Wifi',
  'Other',
];

function getStyles(connection, connectionType, theme) {
  return {
    fontWeight:
      connectionType.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const [viewValue, setViewValue] = React.useState('wired');
  const handleViewChange = (event) => {
    setViewValue(event.target.value);
  };

  const [speedMetricValue, setSpeedMetricValue] = React.useState('wired');
  const handleSpeedMetricChange = (event) => {
    setSpeedMetricValue(event.target.value);
  };

  const [connectionType, setConnectionType] = React.useState([]);
  const handleConnectionChangeMultiple = (event) => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setConnectionType(value);
  };
  const handleConnectionChange = (event) => {
    setConnectionType(event.target.value);
  };

  const [test, setTest] = React.useState('');
  const handleTestChange = (event) => {
    setTest(event.target.value);
  };

  return (
    <React.Fragment>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Typography component="h1" variant="h3">
            Holis Public Library
          </Typography>
          <div>Craig, AK 9921</div>
        </Grid>
        <Grid item>
          <Button variant="contained">Add a note</Button>
        </Grid>
      </Grid>
      <Box mt={5}>
        <Grid container spacing={1} direction="row" xs={12}>
          <Grid container item direction="column" alignItems="center" spacing={1} xs={6}>
            <Grid item>
              <Typography component="div">
                Download Speed
              </Typography>
            </Grid>
            <Grid container item direction="row" alignItems="center" justify="center" spacing={0}>
              <Grid item>
                <Button variant="contained">NDT</Button>
              </Grid>
              <Grid item>
                <Button variant="outlined">Ookla</Button>
              </Grid>
            </Grid>
            <Grid container item direction="row" spacing={2}>
              <Grid item className={classes.grid}>
                <Plot
                  data={[
                    {
                      x: [1, 2, 3],
                      y: [6, 3, 9],
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: 'rgb(52, 235, 107)' },
                    },
                  ]}
                  layout={{
                    width: 250,
                    height: 250,
                    margin: {
                      l: 20,
                      r: 20,
                      b: 20,
                      t: 20,
                      pad: 5
                    },
                    title: false
                   }}
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Plot
                  data={[
                    {
                      x: [1, 2, 3],
                      y: [2, 6, 3],
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: 'rgb(235, 64, 52)' },
                    },
                  ]}
                  layout={{
                    width: 250,
                    height: 250,
                    margin: {
                      l: 20,
                      r: 20,
                      b: 20,
                      t: 20,
                      pad: 5
                    },
                    title: false
                   }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid container item direction="column" alignItems="center" spacing={1} xs={6}>
            <Typography component="div">
              Streaming Media
            </Typography>
            <Grid item>
              <Button variant="contained">DASH</Button>
            </Grid>
            <Grid item className={classes.grid}>
              <Plot
                data={[
                  {
                    x: [1, 2, 3],
                    y: [12, 7, 2],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'rgb(52, 235, 107)' },
                  },
                ]}
                layout={{
                  width: 250,
                  height: 250,
                  margin: {
                    l: 20,
                    r: 20,
                    b: 20,
                    t: 20,
                    pad: 5
                  },
                  title: false
                 }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box mt={5}>
        <Grid container className={classes.grid} justify="space-between" spacing={2} xs={12} md={12}>
          <Grid item xs={12} md={3}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Date range"
                value={selectedDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend">View</FormLabel>
              <RadioGroup aria-label="view" name="view" value={viewValue} onChange={handleViewChange}>
                <FormControlLabel
                className={classes.formControlLabel} value="overall" control={<Radio />} label="Overall" />
                <FormControlLabel className={classes.formControlLabel} value="day" control={<Radio />} label="Day of the week" />
                <FormControlLabel className={classes.formControlLabel} value="hour" control={<Radio />} label="Hour of the day" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-mutiple-chip-label">Connection</InputLabel>
              <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                value={connectionType}
                onChange={handleConnectionChange}
                input={<Input id="select-multiple-chip" />}
                renderValue={(selected) => (
                  <div  className={classes.chips}>
                    {selected.map((value) => (
                      <Chip key={value} label={value}  className={classes.chip} />
                    ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {connections.map((connection) => (
                  <MenuItem key={connection} value={connection} style={getStyles(connection, connectionType, theme)}>
                    {connection}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container className={classes.grid} justify="space-between" spacing={2} xs={12} md={12}>
          <Grid item xs={12} md={3}>
            <Typography component="div">
              Internet Speed
              <Tooltip title="Quae vero auctorem tractata ab fiducia dicuntur. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Gallia est omnis divisa in partes tres, quarum.">
                <IconButton aria-label="internet-speed-tip">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-placeholder-label-label" className={classes.inputLabel}>
                Test
                <Tooltip title="Gallia est omnis divisa in partes tres, quarum.">
                  <IconButton aria-label="test-tip">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </InputLabel>
              <Select
                labelId="demo-simple-select-placeholder-label-label"
                id="demo-simple-select-placeholder-label"
                value={test}
                onChange={handleTestChange}
                displayEmpty
                 className={classes.selectEmpty}
              >
                <MenuItem value={10}>NDT</MenuItem>
                <MenuItem value={20}>Speedtest</MenuItem>
                <MenuItem value={30}>DASH</MenuItem>
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <FormLabel component="legend">Metric</FormLabel>
              <RadioGroup aria-label="view" name="view" value={speedMetricValue} onChange={handleSpeedMetricChange}>
                <FormControlLabel className={classes.formControlLabel} value="download" control={<Radio />} label="Download Speed" />
                <FormControlLabel className={classes.formControlLabel} value="upload" control={<Radio />} label="Upload Speed" />
                <FormControlLabel className={classes.formControlLabel} value="latency" control={<Radio />} label="Latency" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={9}>
            <Plot
              data={[
                {
                  x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                  y: [2, 6, 3, 1, 10, 4, 9, 7, 12, 4, 5, 11],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'red'},
                },
              ]}
              layout={{width: 620, height: 240, title: 'Hollis Public Library'}}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.grid} justify="space-between" spacing={2} xs={12} md={12}>
          <Grid item xs={12} md={3}>
            <Typography component="div">
              Streaming Media
              <Tooltip title="Quae vero auctorem tractata ab fiducia dicuntur. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Gallia est omnis divisa in partes tres, quarum.">
                <IconButton aria-label="internet-speed-tip">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography component="div">
              Test <br/>
              DASH
              <Tooltip title="Morbi fringilla convallis sapien, id pulvinar odio volutpat. Gallia est omnis divisa in partes tres, quarum.">
                <IconButton aria-label="internet-speed-tip">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
          </Grid>
          <Grid item xs={12} md={9}>
            <Plot
              data={[
                {
                  x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                  y: [5, 23, 56, 13, 27, 23, 18, 3, 43, 29, 41, 28],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'red'},
                },
              ]}
              layout={{width: 620, height: 240, title: ''}}
            />
          </Grid>
        </Grid>
      </Box>
      <Box m={2} justify="center">
        <Button variant="contained">Export</Button>
      </Box>
    </React.Fragment>
  )
}
