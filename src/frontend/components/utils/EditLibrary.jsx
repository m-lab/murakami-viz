// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icon imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: "#fff",
    borderBottom: "1px solid rgba(0, 0, 0, 0.54)",
    boxShadow: "none",
  },
  cancelButton: {
  },
  closeButton: {
    marginTop: "15px",
    position: "absolute",
    right: "0",
    top: "0"
  },
  dialog: {
    position: "relative"
  },
  dialogTitleRoot: {
    // marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: "2.25rem",
    textAlign: "center"
  },
  form: {
    padding: "50px",
  },
  formField: {
    marginBottom: "30px",
  },
  grid: {
    // marginLeft: "",
    marginTop: "50px",
  },
  gridItem: {
    marginLeft: "30px",
  },
  saveButton: {
    marginBottom: "0",
  }
}))

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

export default function EditLibrary(props) {
  const classes = useStyles();

  //handle tabs
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // handle close
  const { onClose, selectedValue, open, rowsBasic, rowsNetwork, rowsDevices, rowsUsers } = props;

  console.log(rowsBasic);

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="add-library-title" fullWidth={ true } maxWidth={"lg"} className={classes.dialog}>
      <Button label="Close" primary={true} onClick={handleClose} className={classes.closeButton}>
        <ClearIcon />
      </Button>
      <Grid container alignItems="center" justify="flex-start" className={classes.grid}>
        <Grid item className={classes.gridItem}>
          <DialogTitle id="add-library-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>Edit Library</div>
          </DialogTitle>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button type="submit" label="Save" className={classes.cancelButton} variant="contained" disableElevation color="primary"
            primary={true}>
            Save
          </Button>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
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
            aria-label="edit library tabs">
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
          <TextField
            className={classes.formField}
            id="library-physical-address"
            label="Physical Address"
            fullWidth
            variant="outlined"
            value={props.rowsBasic['Physical Address']}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
        <TabPanel value={value} index={3}>
          Item Four
        </TabPanel>
      </Box>
    </Dialog>
  );
}

EditLibrary.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
  rowsBasic: PropTypes.object.isRequired,
  rowsNetwork: PropTypes.object.isRequired,
  rowsDevices: PropTypes.object.isRequired,
  rowsUsers: PropTypes.object.isRequired,
};
