import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
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
    padding: "50px",
  },
  formField: {
    marginBottom: "30px",
  }
}))

export default function EditNote(props) {
  const classes = useStyles();
  const { onEditClose, selectedEditValue, openEdit } = props;

  const handleEditClose = () => {
    onEditClose(selectedEditValue);
  }

  return (
    <Dialog onClose={handleEditClose} modal={true} open={openEdit} aria-labelledby="add-note-title" fullWidth={ true } maxWidth={"lg"}>
      <Grid container spacing={2} alignItems="center" justify="center">
        <Grid item xs={12} sm={7}>
          <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>Edit Note</div>
          </DialogTitle>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button size="small" label="Cancel" primary={true} onClick={handleEditClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </Grid>
      </Grid>
      <form action="/" method="POST" className={classes.form} onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleEditClose(); } }>
        <TextField
          className={classes.formField}
          id="note-subject"
          label="Subject"
          defaultValue="Printer connection issue"
          fullWidth
          variant="outlined"
        />
        <div className={classes.formField}>
          <TextField
            id="note-date"
            label="Date"
            defaultValue="2020-04-24"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            id="time"
            label="Time"
            defaultValue="2020-04-24T09:32"
            type="time"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <TextField
          className={classes.formField}
          id="note-description"
          label="Description"
          defaultValue="Morbi odio eros, volutpat ut pharetra vitae, lobortis sed nibh."
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
        />
        <Button type="submit" label="Save" className={classes.formField}  variant="contained" primary={true}>
          Save
        </Button>
      </form>
    </Dialog>
  );
}

EditNote.propTypes = {
  onEditClose: PropTypes.func.isRequired,
  openEdit: PropTypes.bool.isRequired,
  selectedEditValue: PropTypes.string.isRequired,
};
