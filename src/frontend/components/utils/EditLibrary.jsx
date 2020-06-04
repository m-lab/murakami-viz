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
    id: `edit-library-tab-${index}`,
    'aria-controls': `edit-library-tabpanel-${index}`,
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

export default function EditLibrary(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;

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
    console.log(inputs);
    fetch(`api/v1/libraries/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: inputs }),
    })
      .then(response => response.json())
      .then(() => {
        // onRowUpdate(results.data[0]);
        alert('User edited successfully.');
        return;
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
            aria-label="edit library tabs"
          >
            <Tab label="Basic info" {...a11yProps(0)} />
            <Tab label="Network" {...a11yProps(1)} />
            <Tab label="Devices" {...a11yProps(2)} />
            <Tab label="Users" {...a11yProps(3)} />
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
              defaultValue={row.name}
              // onChange={handleInputChange}
              value={inputs.name}
              disabled
            >
              <MenuItem value={row.name} selected>
                {row.name}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            className={classes.formField}
            id="library-physical-address"
            label="Physical Address"
            name="physical_address"
            fullWidth
            variant="outlined"
            defaultValue={row.physical_address}
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
            defaultValue={row.shipping_address}
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
            defaultValue={row.timezone}
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
            defaultValue={row.coordinates}
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
            defaultValue={row.primary_contact_name}
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
            defaultValue={row.primary_contact_email}
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
            defaultValue={row.opening_hours}
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
            defaultValue={row.network_name}
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
            defaultValue={row.isp}
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
                defaultValue={row.contracted_speed_download}
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
                defaultValue={row.contracted_speed_upload}
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
            defaultValue={row.ip}
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
                name="bandwith_cap_download"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={row.bandwith_cap_download}
                value={inputs.bandwith_cap_download}
              />
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="library-bandwidth-cap-upload"
                label="Upload"
                name="bandwith_cap_upload"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={row.bandwith_cap_upload}
                value={inputs.bandwith_cap_upload}
              />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <TextField
            className={classes.formField}
            id="library-device-name"
            label="Device name"
            name="device_name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_name}
            value={inputs.device_name}
          />
          <TextField
            className={classes.formField}
            id="library-device-location"
            label="Location"
            name="device_location"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_location}
            value={inputs.device_location}
          />
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="library-network-type">Network type</InputLabel>
            <Select
              labelId="library-network-type"
              className={classes.formField}
              id="library-network-type"
              label="Network Type"
              name="device_network_type"
              defaultValue={row.device_network_type}
              onChange={handleInputChange}
              value={inputs.device_network_type}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="library-connection-type">
              Connection type
            </InputLabel>
            <Select
              labelId="library-connection-type"
              className={classes.formField}
              id="library-connection-type"
              label="Connection Type"
              name="device_connection_type"
              defaultValue={row.device_connection_type}
              onChange={handleInputChange}
              value={inputs.device_connection_type}
            >
              <MenuItem value="wired">Wired</MenuItem>
              <MenuItem value="wireless">Wireless</MenuItem>
            </Select>
          </FormControl>
          <TextField
            className={classes.formField}
            id="library-dns"
            label="DNS server"
            name="device_dns"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_dns}
            value={inputs.device_dns}
          />
          <TextField
            className={classes.formField}
            id="library-device-ip"
            label="Static IP"
            name="device_ip"
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_ip}
            value={inputs.device_ip}
          />
          <TextField
            className={classes.formField}
            id="library-gateway"
            label="Gateway"
            name="device_gateway"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_gateway}
            value={inputs.device_gateway}
          />
          <TextField
            className={classes.formField}
            id="library-dns"
            label="MAC address"
            name="device_mac_address"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row.device_mac_address}
            value={inputs.device_mac_address}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          Users
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

EditLibrary.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
