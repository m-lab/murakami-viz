// base imports
import React, { Suspense, useEffect } from 'react';
import parse from 'html-react-parser';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// modules imports
import EditAbout from './utils/EditAbout.jsx';
import EditContact from './utils/EditContact.jsx';
import EditForum from './utils/EditForum.jsx';

export default function About() {
  // handle about edit
  const [openAbout, setOpenAbout] = React.useState(false);
  const [selectedAboutValue, setSelectedAboutValue] = React.useState();

  const handleAboutClickOpen = () => {
    setOpenAbout(true);
  };

  const handleAboutClose = value => {
    setOpenAbout(false);
    setSelectedAboutValue(value);
  };

  // handle contact edit
  const [openContact, setOpenContact] = React.useState(false);
  const [selectedContactValue, setSelectedContactValue] = React.useState();

  const handleContactClickOpen = () => {
    setOpenContact(true);
  };

  const handleContactClose = value => {
    setOpenContact(false);
    setSelectedContactValue(value);
  };

  // handle contact edit
  const [openForum, setOpenForum] = React.useState(false);
  const [selectedForumValue, setSelectedForumValue] = React.useState();

  const handleForumClickOpen = () => {
    setOpenForum(true);
  };

  const handleForumClose = value => {
    setOpenForum(false);
    setSelectedForumValue(value);
  };

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

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

  useEffect(() => {
    let status;
    fetch('/api/v1/settings')
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(res => {
        if (status === 200 && res.data) {
          const settings = new Map(res.data.map(i => [i.key, i.value]));
          console.log('about: ', settings.get('about'));
          setSelectedAboutValue(settings.get('about'));
          setSelectedContactValue(settings.get('contact'));
          setSelectedForumValue(settings.get('forum'));
          setIsLoaded(true);
          return;
        } else {
          const error = processError(res);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        setError(error);
        console.error(error.name + error.message);
        setIsLoaded(true);
      });
    setIsLoaded(true);
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <Suspense>
        <Box mb={9} mt={9}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h3" variant="h3">
                About MLBN
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleAboutClickOpen}
              >
                Edit
              </Button>
              <EditAbout
                open={openAbout}
                onClose={handleAboutClose}
                aboutValue={selectedAboutValue}
              />
            </Grid>
          </Grid>
          <div>
            <Typography component="p" variant="body1">
              {parse('<div>' + selectedAboutValue + '</div>')}
            </Typography>
          </div>
        </Box>
        <Box mb={9} mt={9}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h3" variant="h3">
                Contact
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleContactClickOpen}
              >
                Edit
              </Button>
              <EditContact
                open={openContact}
                onClose={handleContactClose}
                selectedContactValue={selectedContactValue}
              />
            </Grid>
          </Grid>
          <div>
            <Typography component="p" variant="body1">
              {parse('<div>' + selectedContactValue + '</div>')}
            </Typography>
          </div>
        </Box>
        <Box mb={9} mt={9}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h3" variant="h3">
                Forum
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleForumClickOpen}
              >
                Edit
              </Button>
              <EditForum
                open={openForum}
                onClose={handleForumClose}
                selectedForumValue={selectedForumValue}
              />
            </Grid>
          </Grid>
          <div>
            <Typography component="p" variant="body1">
              {selectedForumValue}
            </Typography>
          </div>
        </Box>
      </Suspense>
    );
  }
}
