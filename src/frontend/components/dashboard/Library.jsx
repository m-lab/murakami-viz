// base imports
import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Cookies from 'js-cookie'

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
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
  nested: {
    paddingLeft: theme.spacing(4),
  },
  table: {
    maxWidth: '50%',
  },
  tableCell: {
    minWidth: '300px',
    textTransform: 'capitalize',
  },
  tableKey: {
    fontWeight: 'bold',
  },
}));

export default function Library(props) {
  const classes = useStyles();
  const { library } = props;

  // console.log('library: ', library);
  // handle edit library
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle existing whitelisted IPs
  const [libraryIPs, setLibraryIPs] = React.useState([])

  // fetch existing whitelisted IPs
  React.useEffect(() => {
    let ipStatus;

    fetch(`/api/v1/libraries/${library.id}/ip`)
      .then(response => {
        ipStatus = response.status;
        return response.json();
      })
      .then(libraryIPs => {
        if (ipStatus === 200) {
          setLibraryIPs(
            libraryIPs.data.map(addresses => addresses.ip) // get just the IP addresses 
          );
          return;
        } else {
          throw new Error(error);
        }
      })
    }, []);

  // handling IP whitelist add
  const [show, setShow] = React.useState(false);
  const [ipValue, setIpValue] = React.useState(null)


  // next two functions toggle showing/hiding the TextField to whitelist an IP address
  const showTextfield = () => {
    setShow(true);
  }

  const closeTextfield = () => {
    setShow(false);
  }

  // handles value change
  const handleIpInput = (event) => {
    setIpValue(event.target.value)
  }

  // submits an IP address to the library_ips table
  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      id: library.id,
      ip: ipValue
    };

    fetch(`api/v1/libraries/${library.id}/ip/${ipValue}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(results => {
        console.log("results: ", results)
        if (results.statusCode === 201) {
          let updatedIPs = libraryIPs.concat(ipValue);
          setLibraryIPs(updatedIPs)
        }
      })
      .catch(error => {
        console.log("error :", error); //TODO: figure out if this is gonna be graceful enough
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });

    closeTextfield();
    setIpValue(null);
  };

  const handleIpDelete = (ipToDelete) => {
    fetch(`api/v1/libraries/${library.id}/ip/${ipToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }})
      .then(response => response.json())
      .then(results => {
        if (results.statusCode === 200) {
          let updatedIPs = libraryIPs.filter(ip => ip !== ipToDelete);
          setLibraryIPs(updatedIPs);
        }
      })
      .catch(error => {
        console.log("error :", error); //TODO: figure out if this is gonna be graceful enough
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
      });
  }

  return (
    <Suspense>
      <Box mb={9} mt={9}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography component="h1" variant="h3">
              {library.name}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disableElevation
              color="primary"
              onClick={handleClickOpen}
            >
              Edit
            </Button>
            <EditLibrary open={open} onClose={handleClose} row={library} />
          </Grid>
        </Grid>
      </Box>
      <Box mb={9}>
        <Typography variant="overline" display="block" gutterBottom>
          Basic Information
        </Typography>
        <TableContainer>
          <Table className={classes.table} aria-label="basic information table">
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
                  {library.timezones}
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
                  Primary Library Contact
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
                  {library.opening_hours}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={9}>
        <Typography variant="overline" display="block" gutterBottom>
          ISP &amp; Library Network Information
        </Typography>
        <TableContainer>
          <Table className={classes.table} aria-label="basic information table">
            <TableBody>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Network Name
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.network_name}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  ISP
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.isp}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Contracted Speeds
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.contracted_speed_download} download
                  <br />
                  {library.contracted_speed_upload} upload
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  IP address of custom DNS severs
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.ip}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Per device bandwidth caps
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.bandwidth_cap_download} download
                  <br />
                  {library.bandwidth_cap_upload} upload
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={9}>
        <Typography variant="overline" display="block" gutterBottom>
          Devices
        </Typography>
        <TableContainer>
          <Table className={classes.table} aria-label="basic information table">
            <TableBody>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Name
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_name}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Location
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_location}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Network type
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_network_type}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Connection Type
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_connection_type}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  DNS server
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_dns}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  IP address
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.ip}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Gateway
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_gateway}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  MAC address
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.device_mac_address}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={9}>
        <Typography variant="overline" display="block" gutterBottom>
          Whitelisted IP Addresses
        </Typography>
        <TableContainer>
          <Table className={classes.table} aria-label="basic information table">
            <TableBody> 
              { libraryIPs && libraryIPs.length > 0 ?
                libraryIPs.map(ipAddress => {
                   return <TableRow>
                            <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>
                              {ipAddress}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                aria-label="delete"
                                onClick={()=>handleIpDelete(ipAddress)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                })
              :
                null
              }
              { show ?
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
                  </Button> <Button
                      variant="contained"
                      disableElevation
                      color="primary"
                      onClick={closeTextfield}
                    >
                      Cancel
                </Button>
                </TableCell>
              </TableRow>
              : 
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
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Suspense>
  );
}

Library.propTypes = {
  library: PropTypes.shape({
    name: PropTypes.string,
    physical_address: PropTypes.string,
    shipping_address: PropTypes.string,
    timezones: PropTypes.string,
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
  }),
};
