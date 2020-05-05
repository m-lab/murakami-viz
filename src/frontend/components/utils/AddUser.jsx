import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
  cancelButton: {
    marginTop: "30px",
  },
  dialogTitleRoot: {
    marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: "2.25rem",
    textAlign: "right"
  },
  form: {
    marginBottom: theme.spacing(1),
    padding: "50px",
  },
  formField: {
    marginBottom: "30px",
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))

export default function AddUser(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  // set library system
  const [librarySystem, setLibrarySystem] = React.useState('');

  const handleLibrarySystemChange = (event) => {
    setLibrarySystem(event.target.value);
  };

  // set library
  const [library, setLibrary] = React.useState('');

  const handleLibraryChange = (event) => {
    setLibrary(event.target.value);
  };

  // set role
  const [role, setRole] = React.useState('');

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="add-note-title" fullWidth={ true } maxWidth={"lg"}>
      <Grid container spacing={2} alignItems="center" justify="center">
        <Grid item xs={12} sm={7}>
          <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>Add a New User</div>
          </DialogTitle>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </Grid>
      </Grid>
      <form action="/" method="POST" className={classes.form} onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <TextField
          className={classes.formField}
          id="first-name"
          label="First Name"
          fullWidth
          variant="outlined"
        />
        <TextField
          className={classes.formField}
          id="last-name"
          label="Last Name"
          fullWidth
          variant="outlined"
        />
        <FormControl className={classes.formControl} fullWidth>
          <InputLabel id="library-system-label">Library System</InputLabel>
          <Select
            labelId="library-system-label"
            id="library-system"
            value={librarySystem}
            onChange={handleLibrarySystemChange}
          >
            <MenuItem value={10}>Library System A</MenuItem>
            <MenuItem value={20}>Library System B</MenuItem>
            <MenuItem value={30}>Library System C</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl} fullWidth>
          <InputLabel id="library-label">Library</InputLabel>
          <Select
            labelId="library-label"
            id="library"
            value={library}
            onChange={handleLibraryChange}
          >
            <MenuItem value={10}>Library A</MenuItem>
            <MenuItem value={20}>Library B</MenuItem>
            <MenuItem value={30}>Library C</MenuItem>
          </Select>
        </FormControl>
        <TextField
          className={classes.formField}
          id="email"
          label="Email Address"
          fullWidth
          variant="outlined"
        />
        <div>
          <TextField
            className={classes.formField}
            id="phone"
            label="Phone Number"
            variant="outlined"
          />
          <TextField
            className={classes.formField}
            id="phone-ext"
            label="Ext."
            variant="outlined"
          />
        </div>
        <FormControl className={classes.formControl}>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            value={role}
            onChange={handleRoleChange}
            fullWidth
          >
            <MenuItem value={10}>Role A</MenuItem>
            <MenuItem value={20}>Role B</MenuItem>
            <MenuItem value={30}>Role C</MenuItem>
          </Select>
        </FormControl>
        <div>
          <Button type="submit" label="Save" className={classes.formField}  variant="contained" primary={true}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

AddUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
