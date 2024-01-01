const { google } = require('googleapis');
const express = require("express");
const nodemailer = require('nodemailer');
const fs = require('fs');
const qr = require('qrcode');
const mysql = require('mysql');

const path = require("path")
const bodyParser = require('body-parser');

require('dotenv').config();



const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
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


async function add_to_db(data){
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "aymen147",
        database: "registration_db",
    });
    try{
        connection.connect();
    }catch(err){
        return err
    }
    try{
        const sql_querry = "INSERT INTO registration_tb (email, name, lastname, arrival, path_to_image) VALUES (?, ?, ?, ?, ?)";
        const values = [data.email, data.name, data.lastname, data.arrival, data.path_to_image];
        const response =  connection.query(sql_querry, values);
        connection.end()
        return response
    }catch(err){
        connection.end()
        return err
    }
}

async function generate_qrcode(data){


    qr.toFile(file,JSON.stringify({...data }),(err)=>{
        if(err){
            console.log(err)
            return err
        }
    })


}



async function sendemail(reeciver,file_path,file_name) {


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
        to: reeciver,
        subject: "Registration",
        attachments : [
            {
                filename: file_name,
                path: file_path,
            },
        
        ],
        };

        // Use async/await here or handle the Promise returned by sendMail
        const info = await transporter.sendMail(mailOptions);
        return info
    } catch (error) {
        return error
    }
}

app.post('/submit', async (req, res) => {
    

    const data = req.body;
    // change the email with id when you createa data base 
    const file_name = data.name +"_"+ data.lastname+"_"+data.email+".png"
    const file = path.join(__dirname,"qr_codes",file_name)
        
    try{
        await qr.toFile(file,JSON.stringify({...data }))

    }catch (err){
        console.log(err)
        res.status(500).send("Internal Server Error");
    }

    try{
        data["path_to_image"] = file
        await add_to_db(data)
    }catch(err){
        return res.status(500).send("data base error");
    }


    try {
        const response = await sendemail(data.email, file,file_name);
        res.send(response);
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error");
    }


});

app.get('/', async (req, res) => {
    res.sendFile("index.html")
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
