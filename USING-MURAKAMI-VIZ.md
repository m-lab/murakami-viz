# Using Murakami Viz

If you have set up the Murakami Viz service as described in the previous section, the service provides a website where you and users you assign can login to access test data generated from measurement devices.

When a user logs into the Murakami Viz service, they will see the Home page for the location to which they’ve been assigned. This page provides several ways to view, filter, and download results collected by measurement devices at the location.

On the HOME landing page for each location, the location name and address is listed, with a button to "Add a Note". Notes are an experimental feature intended to allow annotation of test results or other information in this system.

At the top right, two widgets display the 7-day and 24-hour median speeds, along with the number of tests within those time periods. Above the widgets, users can toggle between results of the NDT and Ookla tests, and see the date and time of the last test.

Moving down the page, the larger chart and its filter controls on the left provide the primary place where users may filter, examine, and export selected data. A series of filters are provided along the left and bottom left of the chart.

* In the **DATE RANGE** filter, select the start and end dates of the test data you wish to view. The default is the current week.
* **CONNECTION** allows a user to filter the data by the type of connection assigned to measurement devices. The default selection is WIRED.
* **TEST** filters the type of test results to display (NDT or Ookla). The default selection is NDT. Both values can be selected at the same time, or individually.
* **METRIC** toggles between download speed, upload speed, and latency. The default selection is DOWNLOAD.

At the bottom left, users may display test results using the **GROUP BY** filter.

* The default selection is ALL TESTS, which displays all individual test results given the selections in the previous filters.
* Selecting BY HOUR provides a view of tests by hour of the day, over the date range selected. For example if I selected November 1, 2020 - November 20, 2020, and clicked BY HOUR, the X axis of the chart will display hours of the day from 0 - 23 and display individual tests over that date range that occurred in each hour time block.
* BY DAY is intended to be a future feature to display selected test results by day of the week. This will be added in a future release, and will display results by weekday, i.e. Sunday, Monday,  Tuesday, etc.

When viewing the selected data in the main chart, additional information and interactive chart controls are available. Placing your mouse over a test result displays a small window showing the test date, time, and measurement. When your mouse is over any part of the chart, a set of controls appears at the top right of the chart area.

From left to right, these controls are:

* Download plot as a PNG image file
* Zoom in by clicking-dragging
* Pan left or right - views previous or next days or hours, depending on your filter selections
* Box select - draws a box outline around a specific area of the chart to highlight it
* Lasso select - draws a freehand outline around an area of the chart to highlight it
* Zoom in button
* Zoom out button
* Autoscale - shows all data in the system for the location for all days
* Reset axes - resets the chart view to its defaults
* Toggle Spike Lines - displays lines from a point that your mouse touches to the X and Y axes
* Show closest data on hover - when selected shows the data from the closest point to your mouse in the hover area.
* Compare data on hover - intended to show comparison between a data point and other items in the chart. _Note: this feature is not configured in our Murakami Viz charts_.
* Produced with Plot.ly - links to the open source charting library being used, Plotly.

Finally, once you have selected the data of interest to you, click the **EXPORT ALL** button at the bottom of the chart area to download the selected test results as a CSV file.
