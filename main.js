const { google } = require('googleapis');
const express = require("express");
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3000;

const CLIENT_ID =  process.env.CLIENT_ID
const CLEINT_SECRET = process.env.CLEINT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

console.log(REFRESH_TOKEN)

async function sendemail() {


    try {
        const accesstoken  = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'aymenfkir23@gmail.com', // Change to your Gmail address
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accesstoken,
        },
        });

        const mailOptions = {
        from: "aymenfkir23@gmail.com",
        to: 'aymenfkir@gmail.com',
        subject: "Registration",
        text: "your qr code",
        };

        // Use async/await here or handle the Promise returned by sendMail
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
        return info
    } catch (error) {
        return error
    }
}
app.get('/', async (req, res) => {
    try {
        const response = await sendemail();
        console.log(response)
        res.send(response);
    } catch (error) {
        res.send(error);
    }
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
