// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';
//import Plotly from 'plotly.js';
// import createPlotlyComponent from 'react-plotly.js/factory';
// const Plot = createPlotlyComponent(Plotly);

// material ui imports

// icons imports

// modules imports


const useStyles = makeStyles(theme => ({
  root: {
  },
}))

export default function Graph(props) {
  const classes = useStyles();

  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [6, 3, 9],
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'rgb(52, 235, 107)' },
        },
      ]}
      revision={1}
      layout={{
        width: 250,
        height: 250,
        margin: {
          l: 20,
          r: 20,
          b: 20,
          t: 20,
          pad: 5
        },
        title: false
       }}
    />
  )
}
