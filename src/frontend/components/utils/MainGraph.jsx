// base imports
import React from 'react';
import Plot from 'react-plotly.js';

export default function MainGraph(props) {
  const { runs } = props;

  if (runs) {
    return <div>No data to display. Is a device running?</div>;
  } else {
    return (
      <Plot
        data={[
          {
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            y: [2, 6, 3, 1, 10, 4, 9, 7, 12, 4, 5, 11],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
        ]}
        layout={{
          width: 820,
          height: 440,
          title: '',
          xaxis: {
            showgrid: false,
          },
          yaxis: {
            showgrid: false,
          },
        }}
      />
    );
  }
}
