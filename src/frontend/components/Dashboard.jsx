import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
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
import Home from './dashboard/Home.jsx';

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
              <Home />
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
