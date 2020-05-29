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
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
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

function formatKey(key) {
  return key.replace(/_/g, ' ');
}

const EditButton = props => {
  const { userRole, row } = props;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = value => {
    setOpen(false);
  };

  if ( userRole === "Admin" || userRole === "Editor" ) {
    return (
      <Grid item>
        <Button
          variant="contained"
          disableElevation
          color="primary"
          onClick={handleClickOpen}
        >
          Edit
        </Button>
        <EditLibrary open={open} onClose={handleClose} row={row} />
      </Grid>
    )
  } else { return null; }
}

export default function Library(props) {
  const classes = useStyles();
  const { user, library } = props;

  return (
    <Box>
      <Box mb={9} mt={9}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography component="h1" variant="h3">
              {library.name}
            </Typography>
          </Grid>
          <EditButton row={library} userRole={user.role} />
        </Grid>
      </Box>
      <Box mb={9}>
        <Typography variant="overline" display="block" gutterBottom>
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
          <Table
            className={classes.table}
            aria-label="basic information table"
          >
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
                <TableCell className={classes.tableCell}>{library.isp}</TableCell>
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
                <TableCell className={classes.tableCell}>{library.ip}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  Per device bandwidth caps
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.bandwith_cap_download} download
                  <br />
                  {library.bandwith_cap_upload} upload
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
          <Table
            className={classes.table}
            aria-label="basic information table"
          >
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
                <TableCell className={classes.tableCell}>{library.ip}</TableCell>
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
          Users
        </Typography>
        <TableContainer>
          <Table
            className={classes.table}
            aria-label="basic information table"
          >
            <TableBody>
              <TableRow key={library.id}>
                <TableCell
                  className={`${classes.tableCell} ${classes.tableKey}`}
                >
                  {library.key}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {library.value}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
