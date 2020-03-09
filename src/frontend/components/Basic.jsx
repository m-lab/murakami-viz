import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import LockIcon from '@material-ui/icons/Lock';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/Folder';
import LinkIcon from '@material-ui/icons/Link';
import { Link as RouterLink } from 'react-router-dom';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import AddIcon from '@material-ui/icons/Add';
import ImageIcon from '@material-ui/icons/Image';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import MovieIcon from '@material-ui/icons/Movie';
import MusicVideoIcon from '@material-ui/icons/MusicVideo';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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

export default function Basic() {
  const classes = useStyles();
  const [links, setLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    //console.log('files!',files);
  });

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
    setLinks(newArr);
  };

  const renderLinks = () => {
    return links.map((text, i) => (
      <TextField
        placeholder="Paste link"
        fullWidth
        error={!validateLink(text)}
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
        </ListItem>
      );
    });
    return <List dense={true}>{listItems}</List>;
  };

  const handleDescriptionChange = event => {
    setDescription(event.target.value);
  };

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

    // TODO: turn the endpoint into an environment variable
    fetch('/api/v1/fixme', {
      method: 'POST',
      body: formData,
    })
      .then(async response => {
        const res = await response.json();
        if (!response.ok) {
          throw Error(`${res.statusCode}: ${res.error}`);
        }
        return res;
      })
      .then(success => {
        console.log('success:', success);
        return success;
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography
        className={classes.h1}
        color="primary"
        variant="h4"
        component="h1"
      >
        Heading 1
      </Typography>
      <Typography className={classes.sub1a} variant="subtitle1" component="p">
        Plura mihi bona sunt, inclinet, amari petere vellent. Cras mattis iudicium purus sit amet fermentum.
      </Typography>
      <Typography className={classes.sub1} variant="subtitle1" component="p">
        <LockIcon color="primary" fontSize="inherit" /> Ullamco laboris nisi ut aliquid ex ea commodi consequat.
      </Typography>
      <Box mt={2} mb={2}>
        <Divider />
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Phasellus laoreet lorem vel dolor tempus vehicula?
        </Typography>
        <Typography
          className={classes.sub1}
          variant="subtitle1"
          component="p"
          gutterBottom
        >
          Ambitioni dedisse scripsisse iudicaretur.
        </Typography>
        <FormControl fullWidth>
          <TextField
            id="standard-multiline-static"
            label="Describe it"
            multiline
            value={description}
            onChange={handleDescriptionChange}
            rowsMax="4"
            required
          />
        </FormControl>
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6" gutterBottom>
          Helpful information
        </Typography>
        <Typography
          className={classes.sub1}
          variant="subtitle1"
          component="p"
          gutterBottom
        >
          Attachments tu quoque, Brute, fili mi, nihil timor populi, nihil!
        </Typography>
        {renderLinks()}
        <FormControl>
          {renderFiles()}
          <input
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            className={classes.input}
            id="upload-file"
            type="file"
            onChange={handleUploadChange}
          />
          <label htmlFor="upload-file">
            <Button
              aria-label="upload file"
              component="span"
              startIcon={<FolderIcon />}
              variant="text"
            >
              {files.length === 0 ? 'Add files' : 'Add another file'}
            </Button>
          </label>
        </FormControl>
      </Box>
      <Box mt={2} mb={6}>
        <Grid container direction="row" alignItems="center" justify="center">
          <Grid className={classes.centerText} item xs={6}>
            <Button onClick={uploadForm}>Submit</Button>
          </Grid>
          <Grid className={classes.centerText} item xs={6}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to={{
                pathname: '/share',
                state: {
                  links,
                  files,
                  description,
                },
              }}
            >
              Add Detail
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
