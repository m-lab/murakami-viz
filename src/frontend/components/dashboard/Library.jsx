// base imports
import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
import MuiTableCell from "@material-ui/core/TableCell";
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

// modules imports
import EditLibrary from '../utils/EditLibrary.jsx';

const TableCell = withStyles({
  root: {
    borderBottom: "none"
  }
})(MuiTableCell);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  table: {
    maxWidth: "50%",
  },
  tableCell: {
    minWidth: "300px",
    textTransform: "capitalize",
  },
  tableKey: {
    fontWeight: "bold",
  },
}));

function formatKey(key) {
  return key.replace(/_/g, " ");
}

export default function Library() {
  const classes = useStyles();

  // handle edit library
  const [open, setOpen] = React.useState(false);
  const [row, setRow] = React.useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/v1/libraries/1")
      .then(res => res.json())
      .then(
        (results) => {
          // const data = results.data[0]
          setRow(results.data[0]);
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <React.Fragment>
        <Box mb={9} mt={9}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h1" variant="h3">
                {row.name}
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" disableElevation color="primary" onClick={handleClickOpen}>
                Edit
              </Button>
              <EditLibrary
                open={open}
                onClose={handleClose}
                row={row} />
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
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Physical Address</TableCell>
                    <TableCell className={classes.tableCell}>{row.physical_address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Shipping Address</TableCell>
                    <TableCell className={classes.tableCell}>{row.shipping_address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Timezone</TableCell>
                    <TableCell className={classes.tableCell}>{row.timezones}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Coordinates</TableCell>
                    <TableCell className={classes.tableCell}>{row.coordinates}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Primary Library Contact</TableCell>
                    <TableCell className={classes.tableCell}>
                      {row.primary_contact_name}
                      <br />
                      {row.primary_contact_email}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Opening Hours</TableCell>
                    <TableCell className={classes.tableCell}>{row.opening_hours}</TableCell>
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
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Network Name</TableCell>
                  <TableCell className={classes.tableCell}>{row.network_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>ISP</TableCell>
                  <TableCell className={classes.tableCell}>{row.isp}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Contracted Speeds</TableCell>
                  <TableCell className={classes.tableCell}>
                    {row.contracted_speed_download} download
                    <br />
                    {row.contracted_speed_upload} upload
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>IP address of custom DNS severs</TableCell>
                  <TableCell className={classes.tableCell}>{row.ip}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Per device bandwidth caps</TableCell>
                  <TableCell className={classes.tableCell}>
                    {row.bandwith_cap_download} download
                    <br />
                    {row.bandwith_cap_upload} upload
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
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Name</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Location</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_location}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Network type</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_network_type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Connection Type</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_connection_type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>DNS server</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_dns}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>IP address</TableCell>
                  <TableCell className={classes.tableCell}>{row.ip}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>Gateway</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_gateway}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>MAC address</TableCell>
                  <TableCell className={classes.tableCell}>{row.device_mac_address}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box mb={9}>
          <Typography variant="overline" display="block" gutterBottom>
            Users
          </Typography>
          <TableContainer>
            <Table className={classes.table} aria-label="basic information table">
              <TableBody>
                <TableRow key={row.id}>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>{row.key}</TableCell>
                  <TableCell className={classes.tableCell}>{row.value}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </React.Fragment>
    )
  }
}
