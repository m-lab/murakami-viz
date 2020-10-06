// base imports
import React, { Suspense } from 'react';
import clsx from 'clsx';
import { CSVLink } from 'react-csv';
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';
import { START_DATE } from '@datepicker-react/hooks';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';

// module imports
import DatePicker from '../datepicker/DatePicker.jsx';
import Loading from '../Loading.jsx';
import MainGraph from '../utils/MainGraph.jsx';

const headers = [
  { label: 'id', key: 'id' },
  { label: 'Test Name', key: 'TestName' },
  { label: 'Test Error', key: 'TestError' },
  { label: 'Server Name', key: 'ServerName' },
  { label: 'Server IP', key: 'ServerIP' },
  { label: 'Client IP', key: 'ClientIP' },
  { label: 'Murakami Location', key: 'MurakamiLocation' },
  { label: 'Murakami Network Type', key: 'MurakamiNetworkType' },
  { label: 'Murakami Connetion Type', key: 'MurakamiConnectionType' },
  { label: 'Download UUID', key: 'DownloadUUID' },
  { label: 'Test Start Time', key: 'TestStartTime' },
  { label: 'Test End Time', key: 'TestEndTime' },
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

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
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

function getStyles(name, library, theme) {
  return {
    fontWeight:
      library.name.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function Compare(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { libraries } = props;
  const [libraryName, setLibraryName] = React.useState([libraries[0].name]);
  const [libraryId, setLibraryId] = React.useState([libraries[0].id]);

  // handle date range
  const today = new Date();
  const weekAgo = new Date(today.setDate(today.getDate() - 7));
  const [dateRange, setDateRange] = React.useState({
    startDate: weekAgo,
    endDate: new Date(),
    focusedInput: START_DATE,
  });

  const handleDateSubmit = range => {
    setDateRange(range);
  };

  // handle library select
  const handleLibraryChange = event => {
    let newLibrary = [];
    setLibraryName(event.target.value);
    const filteredLibraries = libraries.find(library => {
      if (event.target.value.includes(library.name)) {
        newLibrary = [...newLibrary, library.id];
        newLibrary = [...new Set(newLibrary)];
        setLibraryId(newLibrary);
        return;
      }
    });
  };

  // handle connection change
  const [connections, setConnections] = React.useState(['wired']);

  const handleConnection = (event, newConnections) => {
    if (newConnections.length) {
      setConnections(newConnections);
    }
  };

  // handle test type change
  const [testTypes, setTestTypes] = React.useState(['ndt5']);

  const handleTestType = (event, newTestTypes) => {
    if (newTestTypes.length) {
      setTestTypes(newTestTypes);
    }
  };

  // handle metric change
  const [metric, setMetric] = React.useState('DownloadValue');

  const handleMetric = (event, newMetric) => {
    if (newMetric.length) {
      setMetric(newMetric);
    }
  };

  // handle group by change
  const [group, setGroup] = React.useState('all');

  const handleGroup = (event, newGroup) => {
    if (newGroup.length) {
      setGroup(newGroup);
    }
  };

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [runs, setRuns] = React.useState([]);

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
    let newLibrary = runs;

    libraries.forEach(library => {
      fetch(`/api/v1/libraries/${library.id}/runs`)
        .then(res => {
          status = res.status;
          return res.json();
        })
        .then(response => {
          if (status === 200) {
            newLibrary = [...newLibrary, ...response.data];
            setRuns(newLibrary);
          } else {
            processError(response);
            throw new Error(`Error in response from server.`);
          }
          setIsLoaded(true);
        })
        .catch(error => {
          setError(error);
          console.error(error.name + error.message);
          setIsLoaded(true);
        });
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
          <Box mt={5}>
            <Grid
              container
              className={classes.grid}
              justify="space-between"
              spacing={2}
              xs={12}
              md={12}
            >
              <Grid container item spacing={3} xs={12}>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" display="block" gutterbottom>
                    Date range
                  </Typography>
                  <DatePicker
                    dateRange={dateRange}
                    handleDateSubmit={handleDateSubmit}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography id="libraries-label" variant="overline" display="block" gutterbottom>
                    Location
                  </Typography>
                  <FormControl className={classes.formControl}>
                    <Select
                      labelId="libraries-label"
                      id="libraries"
                      multiple
                      displayEmpty
                      value={libraryName}
                      onChange={handleLibraryChange}
                      input={<Input id="select-libraries" />}
                      renderValue={selected => (
                        <div className={classes.chips}>
                          {selected.map(value => (
                            <Chip
                              key={value}
                              label={value}
                              className={classes.chip}
                            />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {libraries.map(library => (
                        <MenuItem
                          key={library.id}
                          value={library.name}
                          style={getStyles(library.name, library, theme)}
                        >
                          {library.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid
                container
                item
                direction="column"
                spacing={3}
                xs={12}
                md={2}
              >
                <Grid item>
                  <Typography variant="overline" display="block" gutterbottom>
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
                  <Typography variant="overline" display="block" gutterbottom>
                    Test
                  </Typography>
                  <ToggleButtonGroup
                    orientation="vertical"
                    value={testTypes}
                    onChange={handleTestType}
                    aria-label="connection type"
                  >
                    <ToggleButton value="ndt5" aria-label="NDT">
                      NDT
                    </ToggleButton>
                    <ToggleButton
                      value="speedtest-cli-single-stream"
                      aria-label="Ookla"
                    >
                      Ookla
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item>
                  <Typography variant="overline" display="block" gutterbottom>
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
              <Grid item xs={12} md={9}>
                <MainGraph
                  lid={libraryId}
                  runs={runs}
                  connections={connections}
                  testTypes={testTypes}
                  metric={metric}
                  group={group}
                  dateRange={dateRange}
                />
              </Grid>
            </Grid>
          </Box>
          <Box mt={3}>
            <Grid container justify="space-between" alignItems="center">
              <Grid
                container
                alignItems="center"
                item
                spacing={2}
                xs={12}
                sm={10}
              >
                <Grid item>
                  <Typography variant="overline" display="block" gutterbottom>
                    Group by
                  </Typography>
                </Grid>
                <Grid item>
                  <ToggleButtonGroup
                    value={group}
                    exclusive
                    onChange={handleGroup}
                  >
                    <ToggleButton value="all" aria-label="All tests">
                      All tests
                    </ToggleButton>
                    <ToggleButton value="hourly" aria-label="By hour">
                      By hour
                    </ToggleButton>
                    <ToggleButton value="daily" aria-label="By day">
                      By day
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained">
                  <CSVLink data={runs} headers={headers}>
                    Export
                  </CSVLink>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Suspense>
    );
  }
}
