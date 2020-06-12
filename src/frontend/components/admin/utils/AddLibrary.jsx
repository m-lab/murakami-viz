// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
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
  formField: {
    marginBottom: '30px',
  },
  grid: {
    // marginLeft: "",
    marginTop: '50px',
  },
  gridItem: {
    marginLeft: '30px',
  },
  inline: {
    marginLeft: '20px',
  },
  saveButton: {
    marginBottom: '0',
  },
  saveButtonContainer: {
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
          <Typography>{children}</Typography>
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

const useForm = callback => {
  const [inputs, setInputs] = useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    callback();
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

  // handle api data errors
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [libraries, setLibraries] = React.useState([]);
  const [groups, setGroups] = React.useState([]);

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
      });

    onClose();
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(submitData);

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="add-library-title"
      fullWidth={true}
      maxWidth={'lg'}
      className={classes.dialog}
    >
      <Button
        label="Close"
        primary={true}
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
            primary={true}
          >
            Save
          </Button>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            size="small"
            label="Cancel"
            primary={true}
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
              // onChange={handleInputChange}
              value={0}
              disabled
            >
              <MenuItem value='' selected>
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            className={classes.formField}
            id="library-name"
            label="Library Name"
            name="name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.name}
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
            Primary Library Contact
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
            className={classes.formField}
            id="library-primary-contact-email"
            label="Email"
            name="primary_contact_email"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.primary_contact_email}
          />
          <Typography variant="overline" display="block" gutterBottom>
            Library Hours
          </Typography>
          <TextField
            className={classes.formField}
            id="library-opening-hours"
            label="Opening hours"
            name="opening_hours"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.opening_hours}
          />
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
            primary={true}
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
