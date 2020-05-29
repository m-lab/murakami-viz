// base imports
import React, { Suspense } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
// import { DateRangePicker } from 'material-ui-datetime-range-picker';
import Grid from '@material-ui/core/Grid';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Typography from '@material-ui/core/Typography';

// modules imports
import Loading from '../Loading.jsx';
import AddNote from '../utils/AddNote.jsx';
import TestsSummary from '../utils/TestsSummary.jsx';

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
    padding: '20px',
  },
  header: {
    marginTop: '40px',
  },
  inputLabel: {
    position: 'absolute',
    top: '-15px',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  textBorder: {
    borderTop: '1px solid #000',
    paddingTop: '5px',
  },
  upper: {
    textTransform: 'uppercase',
  },
}));

const connections = ['Wired', 'Wifi', 'Other'];

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

function Home(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = props;

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const [viewValue, setViewValue] = React.useState('wired');
  const handleViewChange = event => {
    setViewValue(event.target.value);
  };

  const [speedMetricValue, setSpeedMetricValue] = React.useState('wired');
  const handleSpeedMetricChange = event => {
    setSpeedMetricValue(event.target.value);
  };

  const [connectionType, setConnectionType] = React.useState([]);
  const handleConnectionChangeMultiple = event => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setConnectionType(value);
  };
  const handleConnectionChange = event => {
    setConnectionType(event.target.value);
  };

  const [test, setTest] = React.useState('');
  const handleTestChange = event => {
    setTest(event.target.value);
  };

  // handle add note
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle NDT or Ookla summary
  const [ summary, setSummary ] = React.useState('NDT');

  const handleSummaryClick = (test) => {
    setSummary(test);
  }

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [library, setLibrary] = React.useState(null);
  const [runs, setRuns] = React.useState(null);

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/v1/libraries?of_user=${user.id}`),
      fetch(`/api/v1/runs`),
    ])
      .then(([librariesResponse, runsResponse]) => Promise.all([librariesResponse.json(), runsResponse.json()]))
      .then(([libraries, runs]) => {
        setLibrary(libraries.data[0]);
        setRuns(runs.data);
        setIsLoaded(true);
        return;
      })
      .catch(error => {
        setError(error);
        setIsLoaded(true);
      });
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Suspense>
        <Box mb={9}>
          <Grid
            className={classes.header}
            container
            spacing={2}
            alignItems="space-between"
          >
            <Grid container item direction="column" spacing={2} xs={6}>
              <Grid item>
                <Typography component="h1" variant="h3">
                  {library.name}
                </Typography>
                <div>{library.physical_address}</div>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  disableElevation
                  color="primary"
                  onClick={handleClickOpen}
                >
                  Add a note
                </Button>
                <AddNote
                  open={open}
                  onClose={handleClose}
                />
              </Grid>
            </Grid>
            <Grid container item spacing={1} xs={6}>
              <Grid
                container
                item
                alignItems="center"
                direction="row"
                spacing={1}
              >
                <Grid item xs={4}>
                  <Typography component="div" className={classes.upper}>
                    Download Speed
                  </Typography>
                </Grid>
                <Grid
                  container
                  item
                  alignItems="center"
                  justify="center"
                  spacing={0}
                  xs={4}
                >
                  <ButtonGroup
                    color="primary"
                    aria-label="outlined primary button group"
                  >
                    <Button
                      onClick={() => handleSummaryClick('NDT')}>
                      NDT
                    </Button>
                    <Button
                      onClick={() => handleSummaryClick('Ookla')}>
                      Ookla
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item xs={4}>
                  <Typography component="div">
                    Last Test: March 9, 8:00 a.m.
                  </Typography>
                </Grid>
              </Grid>
              <TestsSummary test={summary} />
            </Grid>
          </Grid>
          <Box mt={5}>
            <div>
              <Typography variant="overline" display="block" gutterBottom>
                Date range
              </Typography>
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
            </div>
            <Grid
              container
              className={classes.grid}
              justify="space-between"
              spacing={2}
              xs={12}
              md={12}
            >
              <Grid container item direction="column" spacing={4} xs={12} md={2}>
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Connection
                  </Typography>
                  <ButtonGroup
                    orientation="vertical"
                    color="primary"
                    aria-label="vertical outlined primary button group"
                  >
                    <Button>Wired</Button>
                    <Button>Wifi</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Test
                  </Typography>
                  <ButtonGroup
                    orientation="vertical"
                    color="primary"
                    aria-label="vertical outlined primary button group"
                  >
                    <Button>NDT</Button>
                    <Button>Ookla</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Metric
                  </Typography>
                  <ButtonGroup
                    orientation="vertical"
                    color="primary"
                    aria-label="vertical outlined primary button group"
                  >
                    <Button>Download</Button>
                    <Button>Upload</Button>
                    <Button>Latency</Button>
                  </ButtonGroup>
                </Grid>
              </Grid>
              <Grid item xs={12} md={10}>
                <Plot
                  data={[
                    {
                      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                      y: [2, 6, 3, 1, 10, 4, 9, 7, 12, 4, 5, 11],
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: 'red' },
                    },
                  ]}
                  layout={{
                    width: 820,
                    height: 440,
                    title: '',
                    xaxis: {
                      showgrid: false,
                    },
                    yaxis: {
                      showgrid: false,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Grid container justify="space-between" alignItems="center">
            <Grid container item spacing={2} xs={12} sm={10}>
              <Grid item>
                <Typography variant="overline" display="block" gutterBottom>
                  View
                </Typography>
              </Grid>
              <Grid item>
                <ButtonGroup
                  color="primary"
                  aria-label="outlined primary button group"
                >
                  <Button>All tests</Button>
                  <Button>By hour</Button>
                  <Button>By day</Button>
                  <Button>By month</Button>
                </ButtonGroup>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="contained">Export</Button>
            </Grid>
          </Grid>
        </Box>
      </Suspense>
    );
  }
}

export default Home;
