// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash/core';

// material ui imports
// import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
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

const useForm = (callback, validated, network) => {
  let fullInputs;
  const [inputs, setInputs] = React.useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    delete fullInputs.created_at;
    delete fullInputs.updated_at;
    delete fullInputs.lid;
    delete fullInputs.nid;
    delete fullInputs.id;
    if (validated(fullInputs)) {
      callback(fullInputs);
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    
    if (event.target.name === 'ips') {
      setInputs(inputs => ({
        ...inputs,
        ips: event.target.value.replace(/\s/g, "").split(','),
      }));
    } else {
      setInputs(inputs => ({
        ...inputs,
        [event.target.name]: event.target.value.trim(),
      }));
    }
  };

  React.useEffect(() => {
    if (network && inputs) {
      fullInputs = Object.assign({}, network, inputs);
    }
  }, [inputs, fullInputs]);

  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function AddEditNetwork(props) {
  const classes = useStyles();
  const {
    onClose,
    open,
    row,
    editMode,
    network,
    networks,
    setNetworks,
  } = props;
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
        name: 'Please enter a network name.',
      }));
      return false;
    } else {
      if (!inputs.name || inputs.name === '') {
        setErrors(errors => ({
          ...errors,
          name: true,
        }));
        setHelperText(helperText => ({
          ...helperText,
          name: 'Please enter a network name.',
        }));
        return false;
      } else {
        return true;
      }
    }
  };

  const handleClose = () => {
    onClose();
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

  // submit network to api
  const submitData = inputs => {

    for (let key in inputs) {
      if (
        inputs[key] === null ||
        inputs[key] === undefined ||
        key === 'id' ||
        key === 'created_at' ||
        key === 'updated_at'
      )
        delete inputs[key];
    }

    let status;

    if (editMode) {
      fetch(`api/v1/networks/${network.id}`, {
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
        .then(result => {
          if (status === 200) {
            let updatedNetworks;
            if (networks) {
              updatedNetworks = networks.map(network =>
                network.id === result.data[0].id ? result.data[0] : network,
              );
            } else {
              updatedNetworks = [result.data[0]];
            }
            setNetworks(updatedNetworks);
            alert('Network updated successfully.');
            onClose();
            return;
          } else {
            const error = processError(result);
            throw new Error(`Error in response from server: ${error}`);
          }
        })
        .catch(error => {
          alert(
            `An error occurred. Please try again or contact an administrator. ${
              error.name
            }: ${error.message}`,
          );
        });
    } else {
      fetch(`/api/v1/libraries/${row.id}/networks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({data: inputs}),
      })
        .then(response => {
          status = response.status;
          return response.json();
        })
        .then(result => {
          if (status === 201) {
            let newNetwork = {
              ...inputs,
              id: result.data[0],
            };
            let updatedNetworks = networks
              ? networks.concat(newNetwork)
              : [newNetwork];
            setNetworks(updatedNetworks);
            alert('New network successfully added.')
            onClose();
            return;
          } else {
            const error = processError(result);
            throw new Error(` in response from server: ${error}`);
          }
        })
        .catch(error => {
          alert(
            'An error occurred. Please try again or contact an administrator.',
          );
          console.error(error.name + error.message);
          onClose();
        });
    }
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
    network,
  );

  React.useEffect(() => {}, [network, errors, helperText]);

  return (
    <Dialog onClose={handleClose} modal="true" open={open}>
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
            <div className={classes.dialogTitleText}>
              {editMode ? `Edit network` : `Add a new network`}{' '}
            </div>
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
            Submit
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
        <Box m={4}>
          <TextField
            error={errors && errors.name}
            helperText={helperText.name}
            className={classes.formField}
            id="network-name"
            label="Network name"
            name="name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={network ? network.name : inputs.name}
            required
          />
          <TextField
            className={classes.formField}
            id="network-isp"
            label="ISP (Company)"
            name="isp"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={network ? network.isp : inputs.isp}
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
                id="network-contracted-speed-download"
                label="Download"
                name="contracted_speed_download"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={
                  network
                    ? network.contracted_speed_download
                    : inputs.contracted_speed_download
                }
              />
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="network-contracted-speed-upload"
                label="Upload"
                name="contracted_speed_upload"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={
                  network
                    ? network.contracted_speed_upload
                    : inputs.contracted_speed_upload
                }
              />
            </Grid>
          </Grid>
          <TextField
            className={classes.formField}
            id="library-ips"
            label="IP addresses of custom DNS server (if applicable; in a comma-separated list if multiple)"
            name="ips"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={
              network
                ? Array.isArray(network.ips)
                  ? network.ips.join(', ')
                  : network.ips
                : inputs.ips
            }
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
                id="network-bandwidth-cap-download"
                label="Download"
                name="bandwidth_cap_download"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={
                  network
                    ? network.bandwidth_cap_download
                    : inputs.bandwidth_cap_download
                }
              />
            </Grid>
            <Grid item>
              <TextField
                className={`${classes.formField} ${classes.inline}`}
                id="network-bandwidth-cap-upload"
                label="Upload"
                name="bandwidth_cap_upload"
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={
                  network
                    ? network.bandwidth_cap_upload
                    : inputs.bandwidth_cap_upload
                }
              />
            </Grid>
          </Grid>
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
            Submit
          </Button>
        </Box>
      </Grid>
    </Dialog>
  );
}

AddEditNetwork.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  editMode: PropTypes.bool,
  network: PropTypes.object,
  networks: PropTypes.array,
  row: PropTypes.object,
  setNetworks: PropTypes.func,
};
