// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';

// material ui imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

// modules imports
import NavTabs from './utils/Tabs.jsx';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    //display: 'flex',
  },
  content: {
    flexGrow: 1,
    height: '100%',
    overflow: 'auto',
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

export default function Dashboard(props) {
  const classes = useStyles();
  const { user } = props;

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
              <p>
                {user.firstName} {user.lastName}
                <br />
                {user.role}
              </p>
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
          <NavTabs user={user} />
        </Container>
      </main>
    </Container>
  );
}

Dashboard.propTypes = {
  user: PropTypes.object.isRequired,
};
