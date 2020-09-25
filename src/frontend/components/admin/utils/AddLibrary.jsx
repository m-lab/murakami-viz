// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash/core';

// material ui imports
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icon imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.54)',
    boxShadow: 'none',
  },
  cancelButton: {},
  closeButton: {
    marginTop: '15px',
    position: 'absolute',
    right: '0',
    top: '0',
  },
  day: {
    width: '60px',
  },
  dialog: {
    position: 'relative',
  },
  dialogTitleRoot: {
    // marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: '2.25rem',
    textAlign: 'center',
  },
  form: {
    padding: '50px',
  },
  formControl: {
    width: '100%',
  },
  formControlHours: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  formField: {
    marginBottom: '30px',
  },
  formFieldHours: {
    margin: '0 30px',
    width: '115px',
  },
  grid: {
    // marginLeft: "",
    marginTop: '50px',
  },
  gridItem: {
    marginLeft: '30px',
  },
  hours: {
    marginTop: '20px',
  },
  inline: {
    marginLeft: '20px',
  },
  saveButton: {
    marginBottom: '0',
  },
  saveButtonContainer: {
    marginBottom: '2em',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `add-library-tab-${index}`,
    'aria-controls': `add-library-tabpanel-${index}`,
  };
}

const useForm = (callback, validated) => {
  const [inputs, setInputs] = useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback();
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };
  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function AddLibrary(props) {
  const classes = useStyles();
  const { onClose, open } = props;
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    name: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        name: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        name: 'This field is required.',
      }));
      return false;
    } else {
      if (!inputs.name || !inputs.primary_contact_email) {
        if (!inputs.name) {
          setErrors(errors => ({
            ...errors,
            name: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            name: 'Required',
          }));
        }
        if (!validateEmail(inputs.primary_contact_email)) {
          setErrors(errors => ({
            ...errors,
            email: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            email: 'Please enter a valid email address.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
  };

  const validateEmail = email => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // handle api data errors
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

  //handle tabs
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // handle close
  const handleClose = () => {
    onClose();
  };

  const submitData = () => {
    let status;
    fetch(`api/v1/libraries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: inputs }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 201) {
          alert('Library submitted successfully.');
          onClose(inputs, result.data[0]);
          return;
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        console.log(error);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
        console.error(error.name + error.message);
        onClose();
      });
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
  );

  React.useEffect(() => {}, [errors, helperText]);

  return (
    <Dialog
      onClose={handleClose}
      modal="true"
      open={open}
      aria-labelledby="add-library-title"
      fullWidth={true}
      maxWidth={'lg'}
      className={classes.dialog}
    >
      <Button
        label="Close"
        primary="true"
        onClick={handleClose}
        className={classes.closeButton}
      >
        <ClearIcon />
      </Button>
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        className={classes.grid}
      >
        <Grid item className={classes.gridItem}>
          <DialogTitle
            id="add-library-title"
            className={classes.dialogTitleRoot}
          >
            <div className={classes.dialogTitleText}>Add Library</div>
          </DialogTitle>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            type="submit"
            label="Save"
            onClick={handleSubmit}
            className={classes.cancelButton}
            variant="contained"
            disableElevation
            color="primary"
            primary="true"
          >
            Save
          </Button>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            size="small"
            label="Cancel"
            primary="true"
            onClick={handleClose}
            className={classes.cancelButton}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
      <Box m={4}>
        <AppBar position="static" className={classes.appBar}>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={value}
            onChange={handleChange}
            aria-label="add library tabs"
          >
            <Tab label="Basic info" {...a11yProps(0)} />
            <Tab label="Network" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <Typography variant="overline" display="block" gutterBottom>
            Library Details
          </Typography>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="library-system-name">
              Library System Name (if applicable)
            </InputLabel>
            <Select
              labelId="library-system-name"
              className={classes.formField}
              id="library-name"
              label="Library System Name (if applicable)"
              name="library_name"
              onChange={handleInputChange}
              value=""
              disabled
            >
              <MenuItem value="" selected />
            </Select>
          </FormControl>
          <TextField
            error={errors && errors.name}
            helperText={helperText.name}
            className={classes.formField}
            id="library-name"
            label="Library Name"
            name="name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.name}
            required
          />
          <TextField
            className={classes.formField}
            id="library-physical-address"
            label="Physical Address"
            name="physical_address"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.physical_address}
          />
          <TextField
            className={classes.formField}
            id="library-shipping-address"
            label="Shipping Address"
            name="shipping_address"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.shipping_address}
          />
          <TextField
            className={classes.formField}
            id="library-timezone"
            label="Timezone"
            name="timezone"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.timezone}
          />
          <TextField
            className={classes.formField}
            id="library-coordinates"
            label="Coordinates"
            name="coordinates"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.coordinates}
          />
          <Typography variant="overline" display="block" gutterBottom>
            Library Contact for MLBN Devices
          </Typography>
          <TextField
            className={classes.formField}
            id="library-primary-contact-name"
            label="Name"
            name="primary_contact_name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.primary_contact_name}
          />
          <TextField
            error={errors.email}
            helperText={helperText.email}
            className={classes.formField}
            id="library-primary-contact-email"
            label="Email"
            name="primary_contact_email"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.primary_contact_email}
            required
          />
          <Typography variant="overline" display="block" gutterBottom>
            Library Hours
          </Typography>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Sunday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="sunday-open">Sunday open</InputLabel>
              </Hidden>
              <Select
                labelId="sunday-open"
                className={classes.formFieldHours}
                id="sunday-open"
                name="sunday_open"
                onChange={handleInputChange}
                value={inputs.sunday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="sunday-close">Sunday close</InputLabel>
              </Hidden>
              <Select
                labelId="sunday-close"
                className={classes.formFieldHours}
                id="sunday-close"
                name="sunday_close"
                onChange={handleInputChange}
                value={inputs.sunday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Monday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="monday-open">Monday open</InputLabel>
              </Hidden>
              <Select
                labelId="monday-open"
                className={classes.formFieldHours}
                id="monday-open"
                name="monday_open"
                onChange={handleInputChange}
                value={inputs.monday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="monday-close">Monday close</InputLabel>
              </Hidden>
              <Select
                labelId="monday-close"
                className={classes.formFieldHours}
                id="monday-close"
                name="monday_close"
                onChange={handleInputChange}
                value={inputs.monday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Tuesday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="tuesday-open">Tuesday open</InputLabel>
              </Hidden>
              <Select
                labelId="tuesday-open"
                className={classes.formFieldHours}
                id="tuesday-open"
                name="tuesday_open"
                onChange={handleInputChange}
                value={inputs.tuesday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="tuesday-close">Tuesday close</InputLabel>
              </Hidden>
              <Select
                labelId="tuesday-close"
                className={classes.formFieldHours}
                id="tuesday-close"
                name="tuesday_close"
                onChange={handleInputChange}
                value={inputs.tuesday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Wednesday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="wednesday-open">Wednesday open</InputLabel>
              </Hidden>
              <Select
                labelId="wednesday-open"
                className={classes.formFieldHours}
                id="wednesday-open"
                name="wednesday_open"
                onChange={handleInputChange}
                value={inputs.wednesday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="wednesday-close">Wednesday close</InputLabel>
              </Hidden>
              <Select
                labelId="wednesday-close"
                className={classes.formFieldHours}
                id="wednesday-close"
                name="wednesday_close"
                onChange={handleInputChange}
                value={inputs.wednesday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Thursday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="thursday-open">Thursday open</InputLabel>
              </Hidden>
              <Select
                labelId="thursday-open"
                className={classes.formFieldHours}
                id="thursday-open"
                name="thursday_open"
                onChange={handleInputChange}
                value={inputs.thursday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="thursday-close">Thursday close</InputLabel>
              </Hidden>
              <Select
                labelId="thursday-close"
                className={classes.formFieldHours}
                id="thursday-close"
                name="thursday_close"
                onChange={handleInputChange}
                value={inputs.thursday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Friday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="friday-open">Friday open</InputLabel>
              </Hidden>
              <Select
                labelId="friday-open"
                className={classes.formFieldHours}
                id="friday-open"
                name="friday_open"
                onChange={handleInputChange}
                value={inputs.friday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="friday-close">Friday close</InputLabel>
              </Hidden>
              <Select
                labelId="friday-close"
                className={classes.formFieldHours}
                id="friday-close"
                name="friday_close"
                onChange={handleInputChange}
                value={inputs.friday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className={classes.hours}>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                className={classes.day}
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                Saturday
              </Typography>
              <Hidden xsUp>
                <InputLabel id="saturday-open">Saturday open</InputLabel>
              </Hidden>
              <Select
                labelId="saturday-open"
                className={classes.formFieldHours}
                id="saturday-open"
                name="saturday_open"
                onChange={handleInputChange}
                value={inputs.saturday_open}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControlHours}
            >
              <Typography
                variant="body1"
                component="p"
                display="inline"
                gutterBottom
              >
                to
              </Typography>
              <Hidden xsUp>
                <InputLabel id="saturday-close">Saturday close</InputLabel>
              </Hidden>
              <Select
                labelId="saturday-close"
                className={classes.formFieldHours}
                id="saturday-close"
                name="saturday_close"
                onChange={handleInputChange}
                value={inputs.saturday_close}
              >
                <MenuItem value="closed">
                  <em>Closed</em>
                </MenuItem>
                <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
                <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
                <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
                <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
                <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
                <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
                <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
                <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
                <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
                <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
                <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
                <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
                <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
                <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
                <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
                <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
                <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
                <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
                <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
                <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
                <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
                <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
                <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
                <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
                <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
                <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
                <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
                <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
                <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
                <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
                <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
                <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
                <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
                <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
                <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
                <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
                <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
                <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
                <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
                <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
                <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
                <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
                <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
                <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
                <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
                <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TextField
            className={classes.formField}
            id="library-network-name"
            label="Network name"
            name="network_name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.network_name}
          />
          <TextField
            className={classes.formField}
            id="library-isp"
            label="ISP (company)"
            name="isp"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.isp}
          />
          <Grid container alignItems="center">
            <Grid item>
              <Typography variant="body2" display="block">
                Contracted Speed
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="library-contracted-speed-download"
                label="Download"
                name="contracted_speed_download"
                variant="outlined"
                onChange={handleInputChange}
                value={inputs.contracted_speed_download}
              />
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="library-contracted-speed-upload"
                label="Upload"
                name="contracted_speed_upload"
                variant="outlined"
                onChange={handleInputChange}
                value={inputs.contracted_speed_upload}
              />
            </Grid>
          </Grid>
          <TextField
            className={classes.formField}
            id="library-ip"
            label="IP address of custom DNS server (if applicable)"
            name="ip"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.ip}
          />
          <Grid container alignItems="center">
            <Grid item>
              <Typography variant="body2" display="block">
                Per device bandwidth caps
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="library-bandwidth-cap-download"
                label="Download"
                name="bandwidth_cap_download"
                variant="outlined"
                onChange={handleInputChange}
                value={inputs.bandwidth_cap_download}
              />
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="library-bandwidth-cap-upload"
                label="Upload"
                name="bandwidth_cap_upload"
                variant="outlined"
                onChange={handleInputChange}
                value={inputs.bandwidth_cap_upload}
              />
            </Grid>
          </Grid>
        </TabPanel>
        <div className={classes.saveButtonContainer}>
          <Button
            type="submit"
            label="Save"
            onClick={handleSubmit}
            className={classes.saveButton}
            variant="contained"
            disableElevation
            color="primary"
            primary="true"
          >
            Save
          </Button>
        </div>
      </Box>
    </Dialog>
  );
}

AddLibrary.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
