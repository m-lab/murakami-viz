// base imports
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// icons imports
import LinkIcon from '@material-ui/icons/Link';
import AddIcon from '@material-ui/icons/Add';

//import MUICookieConsent from 'material-ui-cookie-consent';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none',
  },
  h1: {
    fontFamily: 'Poppins',
    fontSize: '26px',
    lineHeight: '32px',
    fontWeight: '700',
  },
  h6: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: '700',
    color: '#4A4A4A',
  },
  debug: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
    fontFamily: 'monospace',
  },
  sub1: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  sub1a: {
    marginTop: theme.spacing(1),
    fontSize: '14px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  paper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  centerText: {
    textAlign: 'center',
  },
}));

export default function Basic() {
  const classes = useStyles();

  return (
    <Container maxWidth="sm">
      <Paper className={classes.paper} elevation={0}>
        <Typography
          className={classes.h1}
          color="primary"
          variant="h4"
          component="h1"
        >
          Murakami Visualizations
        </Typography>
        <Box mt={2} mb={2}>
          <Divider />
        </Box>
        <Box mt={2} mb={6}>
          <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justify="center"
          >
            <Grid className={classes.centerText} item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to={{
                  pathname: '/login',
                  state: {},
                }}
              >
                Log in
              </Button>
            </Grid>
            <Grid className={classes.centerText} item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to={{
                  pathname: '/dashboard',
                  state: {},
                }}
              >
                Dashboard
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {/*
      <MUICookieConsent
        cookieName="templateCookieConsent"
        componentType="Snackbar" // default value is Snackbar
        message="This site uses cookies.... bla bla..."
      />
      */}
    </Container>
  );
}

Basic.propTypes = {
  history: PropTypes.object,
  location: PropTypes.shape({
    state: PropTypes.shape({
      description: PropTypes.string,
      files: PropTypes.array,
      links: PropTypes.array,
    }),
  }),
};
