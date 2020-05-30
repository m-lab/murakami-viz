import React from "react";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    border: "1px solid #929598",
    background: "transparent",
    padding: "8px",
    fontSize: "12px"
  }
}));

export default function NavButton({ children, onClick }) {
  const classes = useStyles();

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes.button}
    >
      {children}
    </button>
  );
}
