import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => ({
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
    marginTop: "30px",
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
  saveButton: {
    marginBottom: "0",
  }
}))

export default function EditUser(props) {
  const classes = useStyles();
  const { onClose, row, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="edit-user-title" fullWidth={ true } maxWidth={"lg"} className={classes.dialog}>
      <Button label="Close" primary={true} onClick={handleClose} className={classes.closeButton}>
        <ClearIcon />
      </Button>
      <DialogTitle id="edit-user-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Edit User</div>
      </DialogTitle>
      <form action="/" method="POST" className={classes.form} onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <TextField
          className={classes.formField}
          id="user-name"
          label="Name"
          fullWidth
          variant="outlined"
          value={props.row.name}
        />
        <TextField
          className={classes.formField}
          id="user-location"
          label="Location"
          fullWidth
          variant="outlined"
          value={props.row.location}
        />
        <TextField
          className={classes.formField}
          id="user-email"
          label="Email"
          fullWidth
          variant="outlined"
          value={props.row.email}
        />
        <TextField
          className={classes.formField}
          id="user-role"
          label="Role"
          fullWidth
          variant="outlined"
          value={props.row.role}
        />
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button type="submit" label="Save" className={classes.cancelButton} variant="contained" disableElevation color="primary"
              primary={true}>
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
    </Dialog>
  );
}

EditUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
};
