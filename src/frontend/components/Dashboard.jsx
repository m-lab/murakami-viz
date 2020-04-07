import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
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
import AccountCircle from '@material-ui/icons/AccountCircle';
import InfoIcon from '@material-ui/icons/Info';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Tooltip from '@material-ui/core/Tooltip';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs';
//import Plot from 'react-plotly.js';
//import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    //display: 'flex',
  },
  grow: {
    flexGrow: 1,
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
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

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

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

export default function Dashboard() {
  const classes = useStyles();
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));

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
    <Container className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            MLab Murakami Viz
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <AccountCircle />
            <div>
              <p>Sam Smith
              <br />
              Editor</p>
            </div>
            <IconButton color="inherit" href="/logout">
              <ExitToAppIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container className={classes.container}>
          <Tabs>
            <TabList>
              <Tab>Home</Tab>
              <Tab>Notes</Tab>
              <Tab>Users</Tab>
              <Tab>Library</Tab>
              <Tab>About</Tab>
            </TabList>

            <TabPanel>
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
                      <Grid item className={classes.border}>
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
                      <Grid item className={classes.border}>
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
                    <Grid item className={classes.border}>
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
                <Grid container className={classes.border} justify="space-between" spacing={2} xs={12} md={12}>
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
                        <FormControlLabel value="overall" control={<Radio />} label="Overall" />
                        <FormControlLabel value="day" control={<Radio />} label="Day of the week" />
                        <FormControlLabel value="hour" control={<Radio />} label="Hour of the day" />
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
                          <div className={classes.chips}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} className={classes.chip} />
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
                <Grid container className={classes.border} justify="space-between" spacing={2} xs={12} md={12}>
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
                <Grid container className={classes.border} justify="space-between" spacing={2} xs={12} md={12}>
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
            </TabPanel>
            <TabPanel>
              <Typography component="h2" variant="h3">
                Notes
                <Button variant="contained">Add</Button>
              </Typography>
              <List component="nav" aria-label="main mailbox folders">
                <ListItem button>
                  <ListItemText primary="March 3, 2020" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="March 9, 2020" />
                </ListItem>
              </List>
              <Divider />
              <List component="nav" aria-label="secondary mailbox folders">
                <ListItem button>
                  <ListItemText primary="April 2, 2020" />
                </ListItem>
                <ListItemLink href="#simple-list">
                  <ListItemText primary="April 3, 2020" />
                </ListItemLink>
              </List>
            </TabPanel>
            <TabPanel>
              <Typography component="h2" variant="h3">
                Users
              </Typography>
            </TabPanel>
            <TabPanel>
              <Typography component="h2" variant="h3">
                Holis Public Library
              </Typography>
            </TabPanel>
            <TabPanel>
              <Typography component="h2" variant="h3">
                About
              </Typography>
            </TabPanel>
          </Tabs>
          {/* Chart */}

        </Container>
      </main>
    </Container>
  );
}
