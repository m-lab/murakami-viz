import React, { Component } from "react";
import DateFnsUtils from '@date-io/date-fns';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
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
import { withStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/core/styles';

const styles = {
  border: {
    border: '1px solid black',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
};

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

class Home extends Component {
  constructor(props) {
    super(props);
    this.theme = useTheme();
    this.selectedDate = React.useState(new Date());
    this.setSelectedDate = React.useState(new Date());
    this.handleDateChange = (date) => {
      this.setSelectedDate(date);
    };
    this.viewValue = React.useState('wired');
    this.setViewValue = React.useState('wired');
    this.handleViewChange = (event) => {
      this.setViewValue(event.target.value);
    };
    this.speedMetricValue = React.useState('wired');
    this.setSpeedMetricValue = React.useState('wired');
    this.handleSpeedMetricChange = (event) => {
      this.setSpeedMetricValue(event.target.value);
    };
    this.connectionType = React.useState([]);
    this.setConnectionType = React.useState([]);
    this.handleConnectionChangeMultiple = (event) => {
      const { options } = event.target;
      const value = [];
      for (let i = 0, l = options.length; i < l; i += 1) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      this.setConnectionType(value);
    };
    this.handleConnectionChange = (event) => {
      this.setConnectionType(event.target.value);
    };
    this.test = React.useState('');
    this.setTest = React.useState('');
    this.handleTestChange = (event) => {
      this.setTest(event.target.value);
    };
  }

  render() {

    return (
      <Container>
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
                <Grid item classes={{ border: this.props.classes.border }}>
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
                    layout={{ width: 250, height: 250, title: '' }}
                  />
                </Grid>
                <Grid item classes={{ border: this.props.classes.border }}>
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
                    layout={{ width: 250, height: 250, title: '' }}
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
              <Grid item classes={{ border: this.props.classes.border }}>
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
                  layout={{ width: 250, height: 250, title: '' }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Box mt={5}>
          <Grid container classes={{ border: this.props.classes.border }} justify="space-between" spacing={2} xs={12} md={12}>
            <Grid item xs={12} md={3}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Date range"
                  value={this.selectedDate}
                  onChange={this.handleDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">View</FormLabel>
                <RadioGroup aria-label="view" name="view" value={this.viewValue} onChange={handleViewChange}>
                  <FormControlLabel value="overall" control={<Radio />} label="Overall" />
                  <FormControlLabel value="day" control={<Radio />} label="Day of the week" />
                  <FormControlLabel value="hour" control={<Radio />} label="Hour of the day" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl classes={{ formControl: this.props.classes.formControl }}>
                <InputLabel id="demo-mutiple-chip-label">Connection</InputLabel>
                <Select
                  labelId="demo-mutiple-chip-label"
                  id="demo-mutiple-chip"
                  multiple
                  value={this.connectionType}
                  onChange={handleConnectionChange}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={(selected) => (
                    <div classes={{ chips: this.props.classes.chips }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} classes={{ chip: this.props.classes.chip }} />
                      ))}
                    </div>
                  )}
                  MenuProps={MenuProps}
                >
                  {connections.map((connection) => (
                    <MenuItem key={connection} value={connection} style={getStyles(connection, connectionType, this.theme)}>
                      {connection}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container classes={{ border: this.props.classes.border }} justify="space-between" spacing={2} xs={12} md={12}>
            <Grid item xs={12} md={3}>
              <Typography component="div">
                Internet Speed
                <Tooltip title="Quae vero auctorem tractata ab fiducia dicuntur. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Gallia est omnis divisa in partes tres, quarum.">
                  <IconButton aria-label="internet-speed-tip">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <FormControl classes={{ formControl: this.props.classes.formControl }}>
                <InputLabel id="demo-simple-select-placeholder-label-label">
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
                  value={this.test}
                  onChange={this.handleTestChange}
                  displayEmpty
                  classes={{ selectEmpty: this.props.classes.selectEmpty }}
                >
                  <MenuItem value={10}>NDT</MenuItem>
                  <MenuItem value={20}>Speedtest</MenuItem>
                  <MenuItem value={30}>DASH</MenuItem>
                </Select>
              </FormControl>
              <FormControl component="fieldset">
                <FormLabel component="legend">Metric</FormLabel>
                <RadioGroup aria-label="view" name="view" value={this.speedMetricValue} onChange={this.handleSpeedMetricChange}>
                  <FormControlLabel value="download" control={<Radio />} label="Download Speed" />
                  <FormControlLabel value="upload" control={<Radio />} label="Upload Speed" />
                  <FormControlLabel value="latency" control={<Radio />} label="Latency" />
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
          <Grid container classes={{ border: this.props.classes.border }} justify="space-between" spacing={2} xs={12} md={12}>
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
      </Container>
    )
  }
}

export default withStyles(styles)(Home);
