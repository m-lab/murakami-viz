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

export default function AddUser(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="add-user-title" fullWidth={ true } maxWidth={"lg"} className={classes.dialog}>
      <Button label="Close" primary={true} onClick={handleClose} className={classes.closeButton}>
        <ClearIcon />
      </Button>
      <DialogTitle id="add-user-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Add a new user</div>
      </DialogTitle>
      <form action="/" method="POST" className={classes.form} onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <TextField
          className={classes.formField}
          id="user-subject"
          label="Subject"
          fullWidth
          variant="outlined"
        />
        <div className={classes.formField}>
          <TextField
            id="user-datetime"
            label="Date"
            type="datetime-local"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <TextField
          className={classes.formField}
          id="user-description"
          label="Description"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
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

AddUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};