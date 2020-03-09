import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import RoomIcon from '@material-ui/icons/Room';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Box from '@material-ui/core/Box';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
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

export default function Share(props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  // calling this variable "where" instead of "state" because "state" could be confused with the React state
  const [where, setWhere] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [medium, setMedium] = useState({
    'checkbox-2': false,
    'checkbox-1': false,
    checkbox3: false,
    other: false,
    'other-text': '',
  });
  const classes = useStyles();
  let { files, links, description } = props.location.state;

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  //console.log('passed info',props.location.state)

  const handleWhereChange = event => {
    setWhere(event.target.value);
  };

  const handleFollowUpChange = event => {
    setFollowUp(event.target.value);
  };

  const handleAdditonalInfoChange = event => {
    setAdditionalInfo(event.target.value);
  };

  const handleMediumChange = name => event => {
    console.log(name, event.target.checked);
    setMedium({ ...medium, [name]: event.target.checked });
  };

  const handleMediumOtherChange = event => {
    setMedium({ ...medium, 'other-text': event.target.value });
  };

  const uploadForm = () => {
    console.log(
      files,
      links,
      description,
      selectedDate,
      where,
      followUp,
      medium,
      additionalInfo,
    );

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
    formData.append('sighted_on', selectedDate.toJSON());
    formData.append('geography', where);
    formData.append('follow_up', followUp);

    // make array of true items in object
    const mediumArray = Object.keys(
      Object.keys(medium).reduce((acc, c) => {
        if (medium[c]) acc[c] = medium[c];
        return acc;
      }, {}),
    );

    formData.append('medium', JSON.stringify(mediumArray));
    formData.append('medium_other', medium['other-text']);
    formData.append('reason', additionalInfo);

    // TODO: turn the endpoint into an environment variable
    fetch('/api/v1/fixme', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(success => {
        console.log('success??', success);
        props.history.push('/thankyou');
      })
      .catch(error => {
        console.log('error:', error);
      });
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      <IconButton
        color="primary"
        component={RouterLink}
        to={{
          pathname: '/',
          state: {
            selectedDate,
            where,
            followUp,
            additionalInfo,
            medium,
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Date mattis iudicium purus sit amet fermentum?
        </Typography>
        <FormControl fullWidth>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Enter date"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              InputAdornmentProps={{
                position: 'start',
              }}
            />
          </MuiPickersUtilsProvider>
        </FormControl>
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Location curabitur est gravida et libero vitae dictum?
        </Typography>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item xs={2}>
            <RoomIcon />
          </Grid>
          <Grid item xs={10}>
            <FormControl fullWidth>
              <InputLabel htmlFor="age-native-simple">Select State</InputLabel>
              <Select
                native
                value={where}
                onChange={handleWhereChange}
                inputProps={{
                  name: 'where',
                  id: 'where',
                }}
              >
                <option value="" />
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="DC">District Of Columbia</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Additional info libero vitae dictum?
        </Typography>
        <TextField
          id="suspicious"
          label="Explain"
          value={additionalInfo}
          onChange={handleAdditonalInfoChange}
          multiline
          rowsMax="4"
          fullWidth
        />
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Where est gravida et?
        </Typography>
        <Box mb={3}>
          <Typography
            className={classes.sub1}
            variant="subtitle1"
            component="p"
            gutterBottom
          >
            Check all that apply.
          </Typography>
        </Box>
        <FormControl component="fieldset">
          <FormGroup>
            <FormControlLabel
              onChange={handleMediumChange('checkbox-1')}
              value="checkbox-1"
              control={<Checkbox color="primary" />}
              label="Checkbox 1"
            />
            <FormControlLabel
              onChange={handleMediumChange('checkbox-2')}
              value="checkbox-2"
              control={<Checkbox color="primary" />}
              label="Checkbox 2"
            />
            <FormControlLabel
              onChange={handleMediumChange('checkbox3')}
              value="checkbox3"
              control={<Checkbox color="primary" />}
              label="Checkbox 3"
            />
            <FormControlLabel
              onChange={handleMediumChange('other')}
              value="other"
              control={<Checkbox color="primary" />}
              label="Other"
            />
            <TextField
              disabled={!medium.other}
              onChange={handleMediumOtherChange}
            />
          </FormGroup>
        </FormControl>
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Do you have additional information?
        </Typography>
        <Typography className={classes.sub1} variant="subtitle1" component="p">
          For example: Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae..
        </Typography>
      </Box>
      <Box mt={2} mb={6}>
        <Typography className={classes.h6} variant="h6">
          Would you like someone to follow up with you?
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={followUp} onChange={handleFollowUpChange}>
            <FormControlLabel
              value="urgent"
              control={<Radio color="primary" />}
              label="Yes, need immediate followup"
            />
            <FormControlLabel
              value="not-urgent"
              control={<Radio color="primary" />}
              label="Yes, but not urgent"
            />
            <FormControlLabel
              value="none"
              control={<Radio color="primary" />}
              label="None needed"
            />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box mt={2} mb={6}>
        <Grid container direction="row" alignItems="center" justify="center">
          <Grid className={classes.centerText} item xs={12}>
            <Button variant="contained" color="primary" onClick={uploadForm}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
