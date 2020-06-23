// base imports
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Tooltip from '@material-ui/core/Tooltip';

// icon imports
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles(() => ({
  iconButton: {
    padding: '0',
    position: 'absolute',
    right: '-35px',
  },
}));

export default function GlossaryTooltip(props) {
  const classes = useStyles();
  const { term } = props;

  if (!term) {
    return null;
  } else {
    return (
      <Tooltip title={term.definition}>
        <InfoIcon aria-label="ndt-test-tip" className={classes.iconButton}  />
      </Tooltip>
    );
  }
}
