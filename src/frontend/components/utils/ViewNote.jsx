// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Moment from 'react-moment';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MobileStepper from '@material-ui/core/MobileStepper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons imports
import ClearIcon from '@material-ui/icons/Clear';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

// modules imports
import EditNote from '../utils/EditNote.jsx';

const useStyles = makeStyles(theme => ({
  root: {
  },
  box: {
    padding: "50px",
  },
  closeButton: {
    marginBottom: "50px",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "130px",
  },
  closeX: {
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
    textAlign: "right"
  },
  editButton: {
    marginTop: "30px"
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

export default function ViewNote(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { onClose, open, rows, index } = props;

  const handleClose = (row) => {
    onClose(row);
  };

  const [row, setRow] = React.useState(props.rows[props.index]);

  const updateRow = (row) => {
    setRow(row);
  }

  // handle edit note
  const [openEdit, setOpenEdit] = React.useState(false);

  const handleClickOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = (note) => {
    if ( note ) {
      updateRow(note);
    }
    setOpenEdit(false);
  };

  // handle prev next
  const [activeStep, setActiveStep] = React.useState(props.index);
  const maxSteps = props.rows.length;

  React.useEffect(() => {
    setRow(props.rows[props.index])
      setActiveStep(props.index);
  }, [props.index])

  const handleNext = () => {
    setActiveStep((activeStep) => activeStep + 1);
    setRow(props.rows[activeStep + 1])
  };

  const handleBack = () => {
    setActiveStep((activeStep) => activeStep - 1);
    setRow(props.rows[activeStep - 1])
  };

  return (
    <Dialog onClose={() => handleClose(row)} modal={true} open={open} aria-labelledby="view-note-title" fullWidth={ true } maxWidth={"md"} className={classes.dialog}>
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="text"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      />
      <Grid container justify="center" alignItems="center">
        <Grid item xs={12} sm={7}>
          <DialogTitle id="view-note-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>View Note</div>
          </DialogTitle>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button variant="contained" disableElevation color="primary" onClick={handleClickOpenEdit} className={classes.editButton}>
            Edit
          </Button>
          <EditNote
            row={row}
            open={openEdit}
            onClose={handleCloseEdit} />
        </Grid>
      </Grid>
      <Box className={classes.box}>
        <Typography component="p" variant="subtitle2" gutterBottom>
          {row.subject}
        </Typography>
        <Typography component="p" variant="subtitle2" gutterBottom>
          <Moment date={row.updated_at} format="MM/DD/YYYY, h:ma" />
        </Typography>
        <Typography component="p" variant="body2" gutterBottom>
          {row.description}
        </Typography>
      </Box>
      <Button
        variant="contained"
        disableElevation
        label="Close"
        color="primary"
        primary={true}
        onClick={() => handleClose(row)}
        className={classes.closeButton}
        gutterBottom>
        Close
      </Button>
    </Dialog>
  );
}

ViewNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  rows: PropTypes.object.isRequired,
};
