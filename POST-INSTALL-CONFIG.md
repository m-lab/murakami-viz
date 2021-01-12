# Configuring Murakami Viz After Installation

Once installed on your server, open the server’s IP address or domain name in your web browser. You should see the login page for Murakami Visualizations. Login using the default admin account that was set up in your environment variables.

The Murakami Viz service allows an administrator to coordinate data collection from multiple locations, and assign user accounts to each location separately. Those users can then login and interact with the data collected by measurement devices in their location, but not the data from other locations.

## Administrator Setup Tasks

Your primary setup tasks as an administrator of Murakami Viz will be:

* Add About, Contact, FAQ, or Glossary content if desired
* Add Locations and Measurement Devices
* Add Users for each Location if desired

### Add About, Contact, FAQ, or Glossary content if desired

When logged in as an administrator, you can add content that other users of the system can see, such as the content on the About & Contact, FAQ, and Glossary pages.

Clicking the buttons on each page labelled: **EDIT**, **ADD AN FAQ**, or **ADD A TERM TO THE GLOSSARY** will open an overlay window allowing you to edit and save content. HTML is supported in these fields.

The intention of these content pages is to support staff at the locations where you are measuring, if they are to login and see the data collected for their location.

### Add Locations and Measurement Devices

Clicking on **LOCATIONS** provides a list of libraries that have been added to Murakami Viz. Click **ADD** to add a new location. Required fields are marked with an asterisk (*). There are two tabs- **BASIC INFO** and **NETWORK**. Complete the fields over both tabs and click save. The location should then appear in the list of locations.

Next, click on a Partner Library Location name to view it’s Home page. This view is what users assigned to the location will see.

From the location’s home page, click on the **LIBRARY** menu item. You will see the information about that location that you entered before.

Scroll down to the Measurement Devices section and click **ADD A DEVICE**. Add a Device name and DeviceID. **You must use the UUID assigned to your device in your Balena Cloud project for DeviceID.**

Select the appropriate value for Network Type and Connection Type. The values for these two fields are currently hard-coded, and reflect the types of networks and connections of interest to the original IMLS funded research program:

| **Network Type**  | Public | Identifies devices connected to a network serving library patrons |
| | Private | Identifies devices connected to a network serving library staff |
| **Connection Type** | Wired | Identifies devices connected to ethernet |
| | Wireless | Identifies devices connected via WiFi, or devices connected with ethernet on a VLAN serving WiFi access points |

Remaining values are helpful for logging complete information about each device in Murakami Viz, but only **DeviceID** is used to associate Murakami device results coming in with the appropriate Location defined in Murakami-Viz.

### Whitelist IP Address(es) for the Location

To receive test results from Measurement Devices, your instance of Murakami Viz service needs to know which devices are assigned to each location. You did this in the previous step. The service also needs to know the IP addresses from which Measurement Devices will send results.

When editing a location in Murakami-Viz, add the public IP address(es) of each location. If your location’s IP address is static, adding it here will be a one time task. If your location’s IP address is dynamic, you will need to add additional IP addresses as new ones are assigned to your on-premise egress device, such a cable or DSL modem.

Once you’re done, return to the Admin Home page by clicking on the **ADMIN** button in the top right.

### Add Users for each location if desired

If you are setting up the Murakami Viz service and wish to provide access to staff or others so they can view and interact with test data being collected by measurement devices in their library, an administrator can add users and assign them to a previously added library location.

The basic user management features of the Murakami Viz allow you to provide people in your measurement program to login and see their location’s measurement data. From the Admin Home page, click on Users.

Required fields are labelled with an asterisk (*). Some items to note about users:

* Username is not editable once initially saved, but users can change their passwords
* The system does not send emails to users (password reminders, notifications, etc.)
* A user may only be assigned to one Location
* There are three Roles: Admin, Editor, and Viewer.
  * The Admin role gives the user full administrative permissions to see and edit all information from all locations
  * The Editor and Viewer roles currently provide the same permissions, and were separated during the software development process to plan for future, separated roles.

Currently Editors and Viewers can:

* Change details about their user account
* View and interact with the data from their assigned library location
* Add Notes
* Edit or remove a defined Network or Device for the location
* Add or Remove Whitelisted IP Addresses for the location
