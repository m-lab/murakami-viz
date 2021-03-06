// base imports
import React, { Suspense } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { START_DATE } from '@datepicker-react/hooks';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';

// modules imports
import AddNote from '../utils/AddNote.jsx';
import DatePicker from '../datepicker/DatePicker.jsx';
import GlossaryTooltip from '../utils/GlossaryTooltip.jsx';
import Loading from '../Loading.jsx';
import MainGraph from '../utils/MainGraph.jsx';
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
  iconButton: {
    padding: '0',
    position: 'absolute',
    right: '-35px',
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
  if (date) {
    return date.substr(0, 10);
  }
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export default function Home(props) {
  const classes = useStyles();
  const { user, library } = props;

  // handle add note
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle NDT or Ookla summary
  const [summary, setSummary] = React.useState('ndt5');

  const handleSummary = (event, newSummary) => {
    if (newSummary.length) {
      setSummary(newSummary);
    }
  };

  // handle glossary terms
  const handleGlossary = term => {
    return glossary.find(
      word => word.term.toLowerCase() === term.toLowerCase(),
    );
  };

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
  const [runs, setRuns] = React.useState(null);
  const [glossary, setGlossary] = React.useState(null);

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
    let status, glossaryStatus;

    if (library) {
      fetch(`/api/v1/libraries/${library.id}/runs`)
        .then(res => {
          status = res.status;
          return res.json();
        })
        .then(response => {
          if (status === 200) {
            setRuns(response.data);
          } else {
            processError(response);
            throw new Error(`Error in response from server.`);
          }
          return;
        })
        .catch(error => {
          setError(error);
          console.error(error.name + error.message);
          // setIsLoaded(true);
        });
    }

    fetch('/api/v1/glossaries')
      .then(glossaryRes => {
        glossaryStatus = glossaryRes.status;
        return glossaryRes.json();
      })
      .then(glossaryResponse => {
        if (glossaryStatus === 200) {
          setGlossary(glossaryResponse.data);
          setIsLoaded(true);
          return;
        } else {
          processError(glossaryResponse);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        setError(error);
        console.error(error.name + error.message);
        setIsLoaded(true);
      });
  }, [library]);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else if (!library) {
    return (
      <Suspense>
        <Box mb={9}>
          <Typography component="h1" variant="h3">
            MLBN Data Visualization
          </Typography>
          <Typography component="p" variant="body1">
            No library to display. Contact an admin for help.
          </Typography>
        </Box>
      </Suspense>
    );
  } else {
    return (
      <Suspense>
        <Box mb={9}>
          <Grid
            className={classes.header}
            container
            spacing={2}
            alignItems="center"
            justify="space-between"
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
                <Grid item xs={4}>
                  <Typography component="div">
                    Last Test:{' '}
                    {runs && runs.length
                      ? formatDate(runs[runs.length - 1].TestStartTime)
                      : 'No tests yet. Is a device running?'}
                  </Typography>
                </Grid>
              </Grid>
              <TestsSummary runs={runs ? runs : []} summary={summary} />
            </Grid>
          </Grid>
          <Box mt={5}>
            <Grid
              container
              className={classes.grid}
              justify="space-between"
              spacing={2}
            >
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
                    Date range
                  </Typography>
                  <DatePicker
                    dateRange={dateRange}
                    handleDateSubmit={handleDateSubmit}
                  />
                </Grid>
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
                      <GlossaryTooltip term={handleGlossary('NDT')} />
                    </ToggleButton>
                    <ToggleButton
                      value="speedtest-cli-single-stream"
                      aria-label="Ookla"
                    >
                      Ookla
                      <GlossaryTooltip term={handleGlossary('Ookla')} />
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
                      <GlossaryTooltip term={handleGlossary('Download')} />
                    </ToggleButton>
                    <ToggleButton value="UploadValue" aria-label="Upload">
                      Upload
                      <GlossaryTooltip term={handleGlossary('Upload')} />
                    </ToggleButton>
                    <ToggleButton value="MinRTTValue" aria-label="Latency">
                      Latency
                      <GlossaryTooltip term={handleGlossary('Latency')} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
              <Grid item xs={12} md={9}>
                <MainGraph
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
          <Grid container justify="space-between" alignItems="center">
            <Grid container alignItems="center" item spacing={2}>
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
              <Grid item>
                <Button variant="contained">
                  <Link
                    href={`/api/v1/libraries/${library.id}/runs?format=csv`}
                  >
                    Export All
                  </Link>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Suspense>
    );
  }
}
