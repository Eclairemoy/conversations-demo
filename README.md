# Minicom
This application will automatically export of all conversations tagged as “Churn Risk” on a regular basis using the [Intercom Node SDK](https://github.com/intercom/intercom-node#search-for-conversations).

Optionally it can also send the exported JSON file as an attachment to a specified email.


## Requirements

- [Nodejs 20+](https://nodejs.org/en)
- A [SendGrid account](https://signup.sendgrid.com/) (optional)


## Setup

1. Clone this repository
2. Rename the `.env.example` file to `.env`
3. Add the example Intercom token to the `.env` file
4. To test out the email functionality:
   1. Add your SendGrid API key to the `.env` file
   2. Add the `from` email you set up in your SendGrid account to the `.env` file
5. Run `npm install` 
6. Run `node index.js` to execute the script
7. To change the cron job time see [the node-cron](https://www.npmjs.com/package/cron) documentation on how to format the time 