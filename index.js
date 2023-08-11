const intercom = require('intercom-client')
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
var CronJob = require('cron').CronJob;

require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new intercom.Client({ tokenAuth: { token: process.env.INTERCOM_TOKEN } });

// Automate the export of all conversations tagged as “Churn Risk” on a regular basis.
async function getAllConversations() {
  // find all of the convos by churn risk value = 6948447
  const response = await client.conversations.search({
    data: {
      query: {
            field: 'tag_ids',
            operator: '=',
            value: '6948447'
      }
    }
  });
  
  // get all of the conversations with their attributes
  const conversations = await Promise.all(response.conversations.map((conversation) => getIndividualConversation(conversation.id))).then(convos => {
      return convos;
    }).catch(error => {
      console.log(error);
  });

  console.log(conversations);
  return conversations;
}

async function packageConversations(conversations) {
  // get all of the conversations
  const allConversations = await getAllConversations();
  // create an object that will be used to store the authors and bodies of the conversation parts
  let convoObj = {};

  // list out all the conversation bodies with their authors associated with them, as a list of objects
  // { convoId : [{'author': authorId, 'body': convopartBody},]}
  const conversationParts = allConversations.map(conversation => { return convoObj[conversation.id] = conversation.conversation_parts.conversation_parts.map(part => { return { 'author': part.author.id, 'body': part.body }} ) });
  
  // convert to a JSON object
  let data = JSON.stringify(convoObj);

  // write to a file
  const timestamp = Date.now();
  const filename = 'conversations_' + timestamp + '.json';
  fs.writeFileSync(filename, data);

  // send the file as an email attachment
  sendEmail(filename);
  return convoObj;
}


// helper function for getAllConversations
async function getIndividualConversation(conversationId) {
  const response = await client.conversations.find({
    id: conversationId,
    inPlainText: true,
  });
  
  return response;
}

function sendEmail(filename) {
  // send the file as an email attachment
  pathToAttachment = `${__dirname}/${filename}`;
  attachment = fs.readFileSync(pathToAttachment).toString("base64");
  const msg = {
    to: 'liz@lizmoy.com',
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Weekly flagged conversations',
    text: 'See attached',
    attachments: [
      {
        content: attachment,
        filename: filename,
        type: "application/json",
        disposition: "attachment"
      }
    ]
  };
  sgMail.send(msg).catch(err => {
    console.log(err);
  });
}

// schedule the job to run every Friday at 15:30 London Time
var job = new CronJob(
    '* 30 15 * * 5',
    packageConversations(),
    null,
    true,
    'Europe/London'
);
