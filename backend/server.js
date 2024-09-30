const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const axios = require('axios');
const env = require('dotenv').config();
const app = express();
const port = 3001;

app.use(cors({
  origin: 'https://4a7b-49-36-121-63.ngrok-free.app',
}));

app.use(express.json());
const token = process.env.TELEGRAM_BOT_TOKEN; 

const checkMembership = async (token, channelUsername, userId) => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getChatMember?chat_id=@${channelUsername}&user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking membership:', error.response ? error.response.data : error.message);
    throw new Error('Failed to check membership');
  }
};

app.post('/telegram-auth/callback', async (req, res) => {
  try {
    console.log(req.body);
    
    const { id, first_name, username } = req.body;

    if (!id || !first_name || !username) {
      return res.status(400).send('Missing required parameters');
    }

    const channelUsername = 'testchannelmemberwx';

    // Check if the user is a member of the channel
    const membershipResponse = await checkMembership(token, channelUsername, id);

    if (membershipResponse.ok && ['member', 'administrator', 'creator'].includes(membershipResponse.result.status)) {
      // User is a member, redirect to the channel
      const redirectUrl = `https://t.me/${channelUsername}`;
      console.log(`User ${username} is a member. Redirecting to: ${redirectUrl}`);
      res.json({ redirectUrl });
    } else {
      // User is not a member, handle accordingly
      console.log(`User ${username} is not a member of the channel.`);
      res.json({ redirectUrl: `https://t.me/${channelUsername}`, message: `User ${username} is not a member of the channel.` });
    }
  } catch (error) {
    console.error('Error in /telegram-auth/callback:', error);
    res.status(500).send('Error processing Telegram authentication');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});