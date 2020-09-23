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
    id: `edit-library-tab-${index}`,
    'aria-controls': `edit-library-tabpanel-${index}`,
  };
}

const useForm = (callback, validated, library) => {
  const [inputs, setInputs] = useState(library);
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback(inputs);
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value.trim(),
    }));
  };
  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function EditLibrary(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    name: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      if (_.isEmpty(row)) {
        setErrors(errors => ({
          ...errors,
          name: true,
          primary_contact_email: true,
        }));
        setHelperText(helperText => ({
          ...helperText,
          name: 'This field is required.',
          primary_contact_email: 'This field is required.',
        }));
        return false;
      } else {
        alert('No changes have been made.');
        return false;
      }
    } else {
      if (!inputs.name || !inputs.primary_contact_email) {
        if ((!inputs.name || inputs.name.length < 1) && !row.name) {
          setErrors(errors => ({
            ...errors,
            name: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            name: 'This field is required.',
          }));
          return false;
        }
        if (
          (!validateEmail(inputs.primary_contact_email) || inputs.primary_contact_email.length < 1) &&
          !validateEmail(row.primary_contact_email)
        ) {
          setErrors(errors => ({
            ...errors,
            primary_contact_email: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            primary_contact_email: 'Please enter a valid email address.',
          }));
          return false;
        }
        return true;
      } else {
        return true;
      }
    }
  };

  const validateEmail = email => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // handle tabs
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // handle close
  const handleClose = () => {
    onClose();
  };

  const submitData = (inputs) => {
    for (let key in inputs) {
      if (inputs[key] === null || 
        inputs[key] === undefined ||
        key === 'id' ||
        key === 'created_at' ||
        key === 'updated_at')
      delete inputs[key]
    }

    let status;
    fetch(`api/v1/libraries/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: inputs }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(results => {
        if (status === 200 || status === 201 || status === 204) {
          alert(`Library edited successfully.`);
          onClose(results.data[0]);
          return;
        } else {
          processError(results);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        alert(
          `An error occurred. Please try again or contact an administrator. ${
            error.name
          }: ${error.message}`,
        );
      });

    onClose();
  };

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else if (res) {
      errorString = res;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
    row
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
            <div className={classes.dialogTitleText}>Edit Library</div>
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
            id="library-system-name"
            label="Library System Name (if applicable)"
            name="library_system_name"
            defaultValue=""
            // onChange={handleInputChange}
            value={0}
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
          defaultValue={row.name}
          onChange={handleInputChange}
        />
        <TextField
          className={classes.formField}
          id="library-physical-address"
          label="Physical Address"
          name="physical_address"
          fullWidth
          variant="outlined"
          defaultValue={row.physical_address}
          onChange={handleInputChange}
        />
        <TextField
          className={classes.formField}
          id="library-shipping-address"
          label="Shipping Address"
          name="shipping_address"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.shipping_address}
        />
        <TextField
          className={classes.formField}
          id="library-timezone"
          label="Timezone"
          name="timezone"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.timezone}
        />
        <TextField
          className={classes.formField}
          id="library-coordinates"
          label="Coordinates"
          name="coordinates"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.coordinates}
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
          defaultValue={row.primary_contact_name}
        />
        <TextField
          error={errors.primary_contact_email}
          helperText={helperText.primary_contact_email}
          className={classes.formField}
          id="library-primary-contact-email"
          label="Email"
          name="primary_contact_email"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.primary_contact_email}
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
          defaultValue={row.opening_hours}
        />

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

EditLibrary.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
