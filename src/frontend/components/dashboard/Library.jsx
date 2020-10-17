// base imports
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// modules imports
import EditLibrary from '../utils/EditLibrary.jsx';
import AddEditDevice from '../utils/AddEditDevice.jsx';
import AddEditNetwork from '../utils/AddEditNetwork.jsx';

const TableCell = withStyles({
  root: {
    borderBottom: 'none',
  },
})(MuiTableCell);

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  editButton: {
    margin: '0 15px',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  table: {
    maxWidth: '50%',
  },
  tableCell: {
    minWidth: '250px',
    // textTransform: 'capitalize',
  },
  tableCellButtons: {
    minWidth: '350px',
  },
  tableKey: {
    fontWeight: 'bold',
  },
}));

export default function Library(props) {
  const classes = useStyles();
  const { onCloseDelete, user } = props;
  const [library, setLibrary] = React.useState(props.library);

  // handle edit library
  const [open, setOpen] = React.useState(false);

  const updateLibrary = library => {
    console.log('***updateLibrary:', library);
    setLibrary(library);
    console.log('***updateLibrary (after):', library);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = library => {
    if (library) {
      updateLibrary(library);
    }
    setOpen(false);
  };

  const isAdmin = user => {
    if (user.role_name != 'admins') {
      return null;
    } else {
      return (
        <Grid container item xs={12} sm={4} justify="flex-start">
          <Grid item>
            <Button
              variant="contained"
              disableElevation
              color="primary"
              onClick={handleClickOpen}
            >
              Edit
            </Button>
            <EditLibrary
              open={open}
              onLibraryUpdate={updateLibrary}
              onClose={handleClose}
              row={library}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disableElevation
              color="primary"
              onClick={() => handleDelete(library)}
              className={classes.editButton}
            >
              <DeleteIcon />
            </Button>
          </Grid>
        </Grid>
      );
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this library? This action CANNOT be undone.',
      )
    ) {
      fetch(`api/v1/libraries/${library.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.status === 204) {
            return onCloseDelete();
          } else {
            const error = processError(response.json());
            throw new Error(error);
          }
        })
        .catch(error => {
          console.error(error.name + ': ' + error.message);
          alert(
            'An error occurred. Please try again or contact an administrator.',
          );
        });
    } else {
      return;
    }
  };

  // handle devices
  const [devices, setDevices] = React.useState([]);
  const [openDevice, setOpenDevice] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [deviceToEdit, setDeviceToEdit] = React.useState({});

  const showAddEditDevice = () => {
    setOpenDevice(true);
  };

  const closeDevice = () => {
    setOpenDevice(false);
    setEdit(false);
    setDeviceToEdit({});
  };

  const openEdit = device => {
    setOpenDevice(true);
    setEdit(true);
    setDeviceToEdit(device);
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

  React.useEffect(() => {
    fetch(`/api/v1/libraries/${library.id}/devices`)
      .then(response => {
        status = response.status;
        if (response.status === 200) {
          return response.json();
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .then(devices => {
        setDevices(devices.data);
        return;
      })
      .catch(error => {
        console.error(error.name + ': ' + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  }, []);

  const handleDeviceDelete = deviceToDelete => {
    fetch(`api/v1/devices/${deviceToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 204) {
          let updatedDevices = devices.filter(
            device => device.id !== deviceToDelete.id,
          );
          setDevices(updatedDevices);
          return;
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .catch(error => {
        console.error(error.name + ': ' + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  };

  // handle networks
  const [networks, setNetworks] = React.useState([]);
  const [openNetwork, setOpenNetwork] = React.useState(false);
  const [editNetwork, setEditNetwork] = React.useState(false);
  const [networkToEdit, setNetworkToEdit] = React.useState({});

  const showAddEditNetwork = () => {
    setOpenNetwork(true);
  };

  const closeNetwork = () => {
    setOpenNetwork(false);
    setEditNetwork(false);
    setNetworkToEdit({});
  };

  const openNetworkEdit = network => {
    setOpenNetwork(true);
    setEditNetwork(true);
    setNetworkToEdit(network);
  };

  // fetch networks data
  React.useEffect(() => {
    fetch(`/api/v1/libraries/${library.id}/networks`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .then(networks => {
        setNetworks(networks.data);
        return;
      })
      .catch(error => {
        alert(
          `An error occurred. ${error.name}: ${
            error.message
          }. Please try again or contact an administrator.`,
        );
      });
  }, []);

  const handleNetworkDelete = networkToDelete => {
    fetch(`api/v1/networks/${networkToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 204) {
          let updatedNetworks = networks.filter(
            network => network.id !== networkToDelete.id,
          );
          setNetworks(updatedNetworks);
          return;
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .catch(error => {
        console.error(error.name + ': ' + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  };

  // handle existing whitelisted IPs
  const [libraryIPs, setLibraryIPs] = React.useState([]);

  // fetch existing whitelisted IPs
  React.useEffect(() => {
    fetch(`/api/v1/libraries/${library.id}/ip`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Failed to get library IPs');
        }
      })
      .then(libraryIPs => {
        if (libraryIPs.data.length > 0) {
          setLibraryIPs(
            libraryIPs.data.map(libraryIP => libraryIP.ip), // get just the IP addresses
          );
          return;
        } else {
          setLibraryIPs([]);
          return;
        }
      })
      .catch(err => {
        console.error(err.name + ': ' + err.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  }, []);

  // handling IP whitelist add
  const [show, setShow] = React.useState(false);
  const [ipValue, setIpValue] = React.useState(null);

  // next two functions toggle showing/hiding the TextField to whitelist an IP address
  const showTextfield = () => {
    setShow(true);
  };

  const closeTextfield = () => {
    setShow(false);
  };

  // handles value change
  const handleIpInput = event => {
    setIpValue(event.target.value);
  };

  // submits an IP address to the library_ips table
  const handleSubmit = event => {
    event.preventDefault();

    if (ipValue && ipValue !== '') {
      const data = {
        id: library.id,
        ip: ipValue,
      };

      fetch(`api/v1/libraries/${library.id}/ip/${ipValue}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (response.status === 201) {
            let updatedIPs = libraryIPs.concat(ipValue);
            setLibraryIPs(updatedIPs);
            closeTextfield();
            setIpValue(null);
            return;
          } else {
            const error = processError(response.json());
            throw new Error(error);
          }
        })
        .catch(error => {
          console.error(error.name + ': ' + error.message);
          alert(
            'An error occurred. Please try again or contact an administrator.',
          );
        });
    } else {
      alert("IP address can't be blank.");
    }
  };

  const handleIpDelete = ipToDelete => {
    fetch(`api/v1/libraries/${library.id}/ip/${ipToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 204) {
          let updatedIPs = libraryIPs.filter(ip => ip !== ipToDelete);
          setLibraryIPs(updatedIPs);
          return;
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .catch(error => {
        console.error(error.name + ': ' + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  };

  if (!library) {
    return (
      <Suspense>
        <Box mb={9}>
          <Typography component="p" variant="body1">
            No libraries to display.
          </Typography>
        </Box>
      </Suspense>
    );
  } else {
    return (
      <Suspense>
        <Box mb={9} mt={9}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h1" variant="h3">
                {library.name}
              </Typography>
            </Grid>
            {isAdmin(user)}
          </Grid>
        </Box>
        <Box mb={9}>
          <Typography variant="overline" display="block" gutterbottom>
            Basic Information
          </Typography>
          <TableContainer>
            <Table
              className={classes.table}
              aria-label="basic information table"
            >
              <TableBody>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Physical Address
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {library.physical_address}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Shipping Address
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {library.shipping_address}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Timezone
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {library.timezone}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Coordinates
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {library.coordinates}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Library Contact for MLBN Devices
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {library.primary_contact_name}
                    <br />
                    {library.primary_contact_email}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${classes.tableCell} ${classes.tableKey}`}
                  >
                    Opening Hours
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    Sunday: {library.sunday_open} - {library.sunday_close}{' '}
                    <br />
                    Monday: {library.monday_open} - {library.monday_close}{' '}
                    <br />
                    Tuesday: {library.tuesday_open} - {library.tuesday_close}{' '}
                    <br />
                    Wednesday: {library.wednesday_open} -{' '}
                    {library.wednesday_close} <br />
                    Thursday: {library.thursday_open} - {library.thursday_close}{' '}
                    <br />
                    Friday: {library.friday_open} - {library.friday_close}{' '}
                    <br />
                    Saturday: {library.saturday_open} - {library.saturday_close}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box mb={9}>
          <Typography variant="overline" display="block" gutterbottom>
            ISP &amp; Library Network Information
          </Typography>
          <TableContainer>
            <Table
              className={classes.table}
              aria-label="basic information table"
            >
              <TableBody>
                <TableRow>
                  <TableCell>
                    {networks && networks.length > 0
                      ? networks.map((network, index) => {
                          return (
                            <Accordion key={index}>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <Typography
                                  variant="overline"
                                  display="block"
                                  gutterbottom
                                >
                                  {network.name}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Table
                                  className={classes.table}
                                  aria-label="basic information table"
                                >
                                  <TableBody>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Network Name
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {network.name}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        ISP
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {network.isp}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Contracted Speeds
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {network.contracted_speed_download}{' '}
                                        Mbit/s Download
                                        <br />
                                        {network.contracted_speed_upload} Mbit/s
                                        Upload
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        IP Addresses of Custom DNS Servers
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {Array.isArray(network.ips)
                                          ? network.ips.join(', ')
                                          : network.ips}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Per Device Bandwidth Caps
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {network.bandwidth_cap_download} GB/mo
                                        Download
                                        <br />
                                        {network.bandwidth_cap_upload}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={classes.tableCellButtons}
                                      >
                                        <Button
                                          type="submit"
                                          label="Submit"
                                          variant="contained"
                                          disableElevation
                                          color="primary"
                                          onClick={() =>
                                            openNetworkEdit(network)
                                          }
                                        >
                                          Edit network
                                        </Button>{' '}
                                        <Button
                                          variant="contained"
                                          disableElevation
                                          color="primary"
                                          onClick={() =>
                                            handleNetworkDelete(network)
                                          }
                                        >
                                          Delete network
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })
                      : null}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <Button
                      variant="contained"
                      disableElevation
                      color="primary"
                      onClick={showAddEditNetwork}
                    >
                      Add a network
                    </Button>
                    <AddEditNetwork
                      open={openNetwork}
                      onClose={closeNetwork}
                      row={library}
                      editMode={editNetwork}
                      network={networkToEdit}
                      networks={networks}
                      setNetworks={setNetworks}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box mb={9}>
          <Typography variant="overline" display="block" gutterbottom>
            Measurement Devices
          </Typography>
          <TableContainer>
            <Table
              className={classes.table}
              aria-label="basic information table"
            >
              <TableBody>
                <TableRow>
                  <TableCell>
                    {devices && devices.length > 0
                      ? devices.map((device, index) => {
                          return (
                            <Accordion key={index}>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <Typography
                                  variant="overline"
                                  display="block"
                                  gutterbottom
                                >
                                  {device.name}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Table
                                  className={classes.table}
                                  aria-label="basic information table"
                                >
                                  <TableBody>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Name
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.name}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        DeviceID
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.deviceid}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Location
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {library.name}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Network type
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.network_type}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Connection Type
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.connection_type}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        DNS server
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.dns_server}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        IP address
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.ip}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        Gateway
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.gateway}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={`${classes.tableCell} ${
                                          classes.tableKey
                                        }`}
                                      >
                                        MAC address
                                      </TableCell>
                                      <TableCell className={classes.tableCell}>
                                        {device.mac}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        className={classes.tableCellButtons}
                                      >
                                        <Button
                                          type="submit"
                                          label="Submit"
                                          variant="contained"
                                          disableElevation
                                          color="primary"
                                          onClick={() => openEdit(device)}
                                        >
                                          Edit device
                                        </Button>{' '}
                                        <Button
                                          variant="contained"
                                          disableElevation
                                          color="primary"
                                          onClick={() =>
                                            handleDeviceDelete(device)
                                          }
                                        >
                                          Delete device
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })
                      : null}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <Button
                      variant="contained"
                      disableElevation
                      color="primary"
                      onClick={showAddEditDevice}
                    >
                      Add a device
                    </Button>
                    <AddEditDevice
                      open={openDevice}
                      onClose={closeDevice}
                      row={library}
                      editMode={edit}
                      device={deviceToEdit}
                      devices={devices}
                      setDevices={setDevices}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box mb={9}>
          <Typography variant="overline" display="block" gutterbottom>
            Whitelisted IP Addresses
          </Typography>
          <TableContainer>
            <Table
              className={classes.table}
              aria-label="basic information table"
            >
              <TableBody>
                {libraryIPs && libraryIPs.length > 0
                  ? libraryIPs.map((ipAddress, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell
                            className={`${classes.tableCell} ${
                              classes.tableKey
                            }`}
                          >
                            {ipAddress}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleIpDelete(ipAddress)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
                {show ? (
                  <TableRow>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        className={classes.formField}
                        id="library-ip"
                        label="New IP address"
                        name="ip"
                        fullWidth
                        variant="outlined"
                        onChange={handleIpInput}
                        value={ipValue}
                      />
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <Button
                        type="submit"
                        label="Submit"
                        variant="contained"
                        disableElevation
                        color="primary"
                        onClick={handleSubmit}
                      >
                        Submit
                      </Button>{' '}
                      <Button
                        variant="contained"
                        disableElevation
                        color="primary"
                        onClick={closeTextfield}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell className={classes.tableCell}>
                      <Button
                        variant="contained"
                        disableElevation
                        color="primary"
                        onClick={showTextfield}
                      >
                        Whitelist a new IP address
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Suspense>
    );
  }
}

Library.propTypes = {
  onCloseDelete: PropTypes.func.isRequired,
  library: PropTypes.shape({
    name: PropTypes.string,
    physical_address: PropTypes.string,
    shipping_address: PropTypes.string,
    timezone: PropTypes.string,
    coordinates: PropTypes.string,
    primary_contact_name: PropTypes.string,
    primary_contact_email: PropTypes.string,
    opening_hours: PropTypes.string,
    network_name: PropTypes.string,
    contracted_speed_download: PropTypes.string,
    contracted_speed_upload: PropTypes.string,
    isp: PropTypes.string,
    bandwidth_cap_download: PropTypes.string,
    bandwidth_cap_upload: PropTypes.string,
  }).isRequired,
};
