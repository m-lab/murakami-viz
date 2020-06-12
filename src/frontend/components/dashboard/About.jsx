import React, { useEffect, useState, Suspense } from 'react';
import parse from 'html-react-parser';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Loading from '../Loading.jsx';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function About() {
  const classes = useStyles();
  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [about, setAbout] = useState();
  const [contact, setContact] = useState();
  const [forum, setForum] = useState();
  const [faqs, setFaqs] = useState();
  const [glossaries, setGlossaries] = useState();
  const [showAbout, setShowAbout] = useState(true);
  const [showFaqs, setShowFaqs] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const clickAbout = () => {
    setShowAbout(true);
    setShowFaqs(false);
    setShowGlossary(false);
  };

  const clickFaq = () => {
    setShowAbout(false);
    setShowFaqs(true);
    setShowGlossary(false);
  };

  const clickGlossary = () => {
    setShowAbout(false);
    setShowFaqs(false);
    setShowGlossary(true);
  };

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
    async function fetchData() {
      const settings = await fetch('/api/v1/settings')
        .then(res => {
          status = res.status;
          return res.json();
        })
        .then(res => {
          if (status === 200 && res.data) {
            const settings = new Map(res.data.map(i => [i.key, i.value]));
            setAbout(settings.get('about'));
            setContact(settings.get('contact'));
            setForum(settings.get('forum'));
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
        })
      const faqs = await fetch('/api/v1/faqs')
        .then(res => {
          status = res.status;
          return res.json();
        })
        .then(res => {
          if (status === 200 && res.data) {
            setFaqs(res.data);
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
        })
      const glossaries = await fetch('/api/v1/glossaries')
        .then(res => {
          status = res.status;
          return res.json();
        })
        .then(res => {
          if (status === 200 && res.data) {
            setGlossaries(res.data);
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
        })
    }

    fetchData().then(() => {
      setIsLoaded(true);
      return;
    });
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Suspense>
        <Container className={classes.root}>
          <Typography component="h1" variant="srOnly">
            More
          </Typography>
          <Grid container justify="center" spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={clickAbout}>
                About
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={clickFaq}>
                FAQ
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={clickGlossary}>
                Glossary
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" href={forum}>
                Forum
              </Button>
            </Grid>
          </Grid>
          {showAbout && (
            <Box>
              <Box>
                <Typography component="h2" variant="h4">
                  Contact
                </Typography>
                <Typography component="div" variant="body1">
                  {parse('<div>' + contact + '</div>')}
                </Typography>
              </Box>
              <Box>
                <Typography component="h2" variant="h4">
                  About
                </Typography>
                <Typography component="div" variant="body1">
                  {parse('<div>' + about + '</div>')}
                </Typography>
              </Box>
            </Box>
          )}
          {showFaqs &&
            faqs.map((item, index) => (
              <Box key={index}>
                <Typography component="h2" variant="h4">
                  {console.log('item: ', item)}
                  {parse('<div>' + item.question + '</div>')}
                </Typography>
                <Typography>
                  {parse('<div>' + item.answer + '</div>')}
                </Typography>
              </Box>
            ))}
          {showGlossary &&
            glossaries.map((item, index) => (
              <Box key={index}>
                <Typography component="h2" variant="h4">
                  {parse('<div>' + item.term + '</div>')}
                </Typography>
                <Typography>
                  {parse('<div>' + item.definition + '</div>')}
                </Typography>
              </Box>
            ))}
        </Container>
      </Suspense>
    );
  }
}
