// base imports
import React, { Suspense } from 'react';
import { CSVLink } from 'react-csv';
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
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';

// modules imports
import AddNote from '../utils/AddNote.jsx';
import Loading from '../Loading.jsx';
import MainGraph from '../utils/MainGraph.jsx';
import TestsSummary from '../utils/TestsSummary.jsx';

const headers = [
  { label: 'id', key: 'run.id' },
  { label: 'Test Name', key: 'run.TestName' },
  { label: 'Test Error', key: 'TestError' },
  { label: 'Server Name', key: 'ServerName' },
  { label: 'Server IP', key: 'server.ip' },
  { label: 'Client IP', key: 'ClientIP' },
  { label: 'Murakami Location', key: 'MurakamiLocation' },
  { label: 'Murakami Network Type', key: 'MurakamiNetworkType' },
  { label: 'Murakami Connetion Type', key: 'MurakamiConnectionType' },
  { label: 'Download UUID', key: 'DownloadUUID' },
  { label: 'Download Test Start Time', key: 'DownloadTestStartTime' },
  { label: 'Download Test End Time', key: 'DownloadTestEndTime' },
  { label: 'Download Value', key: 'DownloadValue' },
  { label: 'Download Unit', key: 'DownloadUnit' },
  { label: 'Download Error', key: 'DownloadError' },
  { label: 'Download Retrans Value', key: 'DownloadRetransValue' },
  { label: 'Download Retrans Unit', key: 'DownloadRetransUnit' },
  { label: 'Upload Value', key: 'UploadValue' },
  { label: 'Upload Unit', key: 'UploadUnit' },
  { label: 'Min RTT Value', key: 'MinRTTValue' },
  { label: 'Min RTT Unit', key: 'MinRTTUnit' },
];

const data = [
  {
    run: {
      id: 1,
      TestName: 'ndt7',
    },
    server: {
      ip: '0.0.0.0',
    },
  },
];

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
  mb1: {
    marginBottom: '10px',
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

function formatDate(date) {
  return date.substr(0, 10);
}

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
  const { library } = props;

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const handleDateChange = date => {
    setSelectedDate(date);
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
  const [summary, setSummary] = React.useState('ndt7');

  const handleSummary = (event, newSummary) => {
    setSummary(newSummary);
  };

  // handle connection change
  const [connections, setConnections] = React.useState(['wired']);

  const handleConnection = (event, newConnections) => {
    setConnections(newConnections);
  };

  // handle test type change
  const [testTypes, setTestTypes] = React.useState(['ndt7']);

  const handleTestType = (event, newTestTypes) => {
    setTestTypes(newTestTypes);
  };

  // handle metric change
  const [metric, setMetric] = React.useState('DownloadValue');

  const handleMetric = (event, nextMetric) => {
    setMetric(nextMetric);
  };

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [runs, setRuns] = React.useState(null);

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  React.useEffect(() => {
    let status;
    fetch(`/api/v1/libraries/${library.id}/runs`)
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(response => {
        if (status === 200) {
          setRuns(response.data);
          setIsLoaded(true);
          return;
        } else {
          processError(response);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        setError(error);
        console.error(error.name + error.message);
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
                <AddNote open={open} onClose={handleClose} library={library} />
              </Grid>
            </Grid>
            <Grid container item spacing={1} xs={6}>
              <Grid
                container
                item
                alignItems="center"
                direction="row"
                spacing={1}
                className={classes.mb1}
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
                  <ToggleButtonGroup
                    value={summary}
                    exclusive
                    onChange={handleSummary}
                    aria-label="tests summary data"
                  >
                    <ToggleButton value="ndt7" aria-label="NDT7">
                      NDT
                    </ToggleButton>
                    <ToggleButton value="ookla" aria-label="Ookla">
                      Ookla
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={4}>
                  <Typography component="div">
                    Last Test:{' '}
                    {runs
                      ? formatDate(runs[runs.length - 1].DownloadTestStartTime)
                      : 'No tests yet. Is a device running?'}
                  </Typography>
                </Grid>
              </Grid>
              <TestsSummary runs={runs} summary={summary} />
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
              <Grid
                container
                item
                direction="column"
                spacing={4}
                xs={12}
                md={2}
              >
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Connection
                  </Typography>
                  <ToggleButtonGroup
                    orientation="vertical"
                    value={connections}
                    onChange={handleConnection}
                    aria-label="connection type"
                  >
                    <ToggleButton value="wired" aria-label="wired">
                      Wired
                    </ToggleButton>
                    <ToggleButton value="wifi" aria-label="wifi">
                      Wireless
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Test
                  </Typography>
                  <ToggleButtonGroup
                    orientation="vertical"
                    value={testTypes}
                    onChange={handleTestType}
                    aria-label="connection type"
                  >
                    <ToggleButton value="ndt7" aria-label="NDT">
                      NDT
                    </ToggleButton>
                    <ToggleButton value="ookla" aria-label="Ookla">
                      Ookla
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item>
                  <Typography variant="overline" display="block" gutterBottom>
                    Metric
                  </Typography>
                  <ToggleButtonGroup
                    orientation="vertical"
                    value={metric}
                    exclusive
                    onChange={handleMetric}
                  >
                    <ToggleButton value="DownloadValue" aria-label="Download">
                      Download
                    </ToggleButton>
                    <ToggleButton value="UploadValue" aria-label="Upload">
                      Upload
                    </ToggleButton>
                    <ToggleButton
                      value="DownloadRetransValue"
                      aria-label="Latency"
                    >
                      Latency
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
              <Grid item xs={12} md={10}>
                <MainGraph
                  runs={runs}
                  connections={connections}
                  testTypes={testTypes}
                  metric={metric}
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
