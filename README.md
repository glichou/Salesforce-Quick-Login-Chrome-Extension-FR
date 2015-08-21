# Overview

The Salesforce Quick Login As chrome extension makes it easy to login as another user and maintains the page currently being viewed.

Main Points
- Gives a popup of the users listed on the user listing page so you can select to login as a different user on any page.
- When a user is selected, it logs you in as that user and keeps you on the page you were viewing.
- When you log out, it will take you back to the page you were originally on when you logged in as the other user.

Additional Points
- Above the user list in the popup, the "View" dropdown is available so you can change to another view from the user listing page.
- Only the first 4 columns from the user listing table are shown by default (including the login column) since the popup has a limited width.  An "All Columns" button is available if you can't identify the user you need by the default columns shown.

## How it Works

When a user clicks the extension icon, it opens the extension popup and requests the users from the Manage Users page within the Salesforce organization.  It displays the View dropdown from the page and the Users table from the page.  The extension updates the Login links to have a "retURL" parameter pointing at the current page and a "targetURL" parameter pointing at the current page.
 
## Getting the Extension
### To install released version

Install from the [chrome web store](https://chrome.google.com/webstore/detail/salesforcecom-quick-login/dccccilgophpadpomgajjlkkioipoojh)

This version will automatically update and is the preferred way to install unless you plan to make modifications to the source.

### To install from source

1. Download to a folder
2. Go to chrome://extensions
3. Check developer mode, then load unpacked extension

