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

function createData(id, key, value) {
  return { id, key, value };
}

const rowsBasic =  [
  createData(1, 'Physical Address', 'Craig, AK 99921'),
  createData(2, 'Shipping Address', 'Craig, AK 99921'),
  createData(3, 'Timezone', 'GMT-8'),
  createData(4, 'Coordinates', '55.4764° N, 133.1483° W'),
  createData(5, 'Primary Library Contact', 'Sam Smith'),
  createData(6, 'Primary IT Contact', 'Sue Brown'),
  createData(7, 'Opening Hours', 'Sunday')
]

const rowsNetwork = [
  createData(1, 'Network Name', 'Public Access'),
  createData(2, 'ISP', 'Comcast'),
  createData(3, 'Contracted Speeds', '100 Mbit/s dowload'),
  createData(4, 'IP addresses of custom DNS servers', '0.0.0.0'),
  createData(5, 'Per device bandwidth caps', '100 Mbit/s download'),
]

const rowsDevices = [
  createData(1, 'Name'),
]

const rowsUsers = [
  createData(1, 'Editor', 'Sue Brown'),
  createData(2, 'Viewer', 'Sam Smith'),
]

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
    minWidth: "150px",
  },
  tableKey: {
    fontWeight: "bold",
  },
}));

export default function Library() {
  const classes = useStyles();

  // handle edit library
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <React.Fragment>
      <Box mb={9} mt={9}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography component="h1" variant="h3">
              Holis Public Library
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" disableElevation color="primary" onClick={handleClickOpen}>
              Edit
            </Button>
            <EditLibrary
              selectedValue={selectedValue}
              open={open}
              onClose={handleClose}
              rowsBasic={rowsBasic}
              rowsNetwork={rowsNetwork}
              rowsDevices={rowsDevices}
              rowsUsers={rowsUsers} />
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
              {rowsBasic.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>{row.key}</TableCell>
                  <TableCell className={classes.tableCell}>{row.value}</TableCell>
                </TableRow>
              ))}
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
              {rowsNetwork.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>{row.key}</TableCell>
                  <TableCell className={classes.tableCell}>{row.value}</TableCell>
                </TableRow>
              ))}
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
              {rowsDevices.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>{row.key}</TableCell>
                  <TableCell className={classes.tableCell}>{row.value}</TableCell>
                </TableRow>
              ))}
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
              {rowsUsers.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${classes.tableCell} ${classes.tableKey}`}>{row.key}</TableCell>
                  <TableCell className={classes.tableCell}>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </React.Fragment>
  )
}
