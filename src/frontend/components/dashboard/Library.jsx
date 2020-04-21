import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function Library() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item>
          <Typography component="h1" variant="h3">
            Holis Public Library
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained">
            Edit
          </Button>
        </Grid>
      </Grid>
      <Box>
        <Typography variant="overline" display="block" gutterBottom>
          Basic Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Physical Address" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Shipping Address" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Timezone" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Coordinates" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Primary Library Contact" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Primary IT Contact" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Opening Hours" />
          </ListItem>
        </List>
      </Box>
      <Box>
        <Typography variant="overline" display="block" gutterBottom>
          ISP &amp; Library Network Information
        </Typography>
      </Box>
    </React.Fragment>
  )
}
