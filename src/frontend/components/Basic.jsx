// base imports
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

// icons imports
import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/Link';
import AddIcon from '@material-ui/icons/Add';
import ImageIcon from '@material-ui/icons/Image';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import MovieIcon from '@material-ui/icons/Movie';
import MusicVideoIcon from '@material-ui/icons/MusicVideo';
import CloseIcon from '@material-ui/icons/Close';

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

const decorateLink = (text, i) => {
  if (i === 0 || text !== '') {
    return (
      <InputAdornment position="start">
        <LinkIcon />
      </InputAdornment>
    );
  } else {
    return (
      <InputAdornment position="start">
        <AddIcon />
      </InputAdornment>
    );
  }
};

const validateLink = text => {
  var regEx = /^(http|https):\/\/[^ "]+$/;
  return text === '' || regEx.test(text);
};

export default function Basic(props) {
  const classes = useStyles();
  const [links, setLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isFormValid, setIsFormValid] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  const [modalDebug, setModalDebug] = React.useState('');

  useEffect(() => {
    if (props.location.state) {
      if (props.location.state.description) {
        setDescription(props.location.state.description);
      }
      if (props.location.state.links) {
        setLinks(props.location.state.links);
      }
      if (props.location.state.files) {
        setFiles(props.location.state.files);
      }
    }
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleUploadChange = event => {
    let newArr = [...files];
    newArr = newArr.concat(event.target.files[0]);
    setFiles(newArr);
  };

  const handleLinkChange = (i, event) => {
    let newArr = [...links];
    newArr[i] = event.target.value;
    if (newArr[i + 1] === undefined) {
      newArr[i + 1] = '';
    }
    // test to see if every link is valid, if not, invalidate the form
    const allValid = newArr.every(url => validateLink(url));
    if (!allValid) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
    setLinks(newArr);
  };

  const handleFileRemove = i => {
    let newArr = [...files];
    newArr.splice(i, 1);
    setFiles(newArr);
  };

  const renderLinks = () => {
    return links.map((text, i) => (
      <TextField
        placeholder="Paste link"
        fullWidth
        error={!validateLink(text)}
        helperText={
          !validateLink(text)
            ? "All links need to start with http:// or https:// and can't have a space"
            : ''
        }
        data-id={i}
        key={i}
        value={text}
        style={{ display: 'block' }}
        onChange={handleLinkChange.bind(this, i)}
        InputProps={{
          startAdornment: decorateLink(text, i),
        }}
      />
    ));
  };

  const renderFiles = () => {
    let listItems = files.map((file, i) => {
      let icon = <AddIcon />;
      if (file.type.includes('image')) {
        icon = <ImageIcon />;
      } else if (file.type.includes('pdf')) {
        icon = <PictureAsPdfIcon />;
      } else if (file.type.includes('video')) {
        icon = <MovieIcon />;
      } else if (file.type.includes('audio')) {
        icon = <MusicVideoIcon />;
      }
      return (
        <ListItem key={i}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={file.name} secondary={file.type} />
          <ListItemIcon>
            <Box ml={2} mt={0.5}>
              <IconButton
                onClick={handleFileRemove.bind(this, i)}
                color="primary"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </ListItemIcon>
        </ListItem>
      );
    });
    return <List dense={true}>{listItems}</List>;
  };

  // eslint-disable-next-line no-unused-vars
  const handleDescriptionChange = event => {
    setDescription(event.target.value);
  };

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  // eslint-disable-next-line no-unused-vars
  const uploadForm = () => {
    let formData = new FormData();

    files.map((file, i) => {
      formData.append(`file${i}`, file);
      return file;
    });

    formData.append(
      'links',
      JSON.stringify(links.filter(link => link.length > 0)),
    );
    formData.append('description', description);

    let status;
    fetch('/api/v1/items', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          props.history.push('/thankyou');
          return data;
        } else {
          let [text, debug] = processError(data);
          setModalText(text);
          setModalDebug(debug);
          setOpenModal(true);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

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
        <Dialog open={openModal} aria-describedby="alert-dialog-description">
          <DialogContent>
            <Box p={2}>
              <DialogContentText id="alert-dialog-description">
                {modalText}
              </DialogContentText>
              <Typography className={classes.debug} component="div">
                {modalDebug}
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
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
