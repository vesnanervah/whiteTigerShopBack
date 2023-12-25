import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PendingEmails } from './types/pending-emails';
import nodemailer from 'nodemailer';
import { EmailConfirmByCodeBody, EmailConfirmInitBody } from './types/email-confirm';
import { BaseResponse } from './types/base-response';
import 'dotenv/config'

const PORT = 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const pendingEmails: PendingEmails = {};

app.get('/', (req, res) => {
    res.send({hello: 'welcome to the api'});
});

app.post('/init-email-confirm', async (req, res) => {
    if ((req.body as EmailConfirmInitBody).email) {
        const email = (req.body as EmailConfirmInitBody).email;
        if (pendingEmails[email]) {
            const response: BaseResponse<String> = {
                meta: {
                    success: true,
                    error: ''
                },
                data: `Code is already generated. Check your email.`//  Only in debug sense. Delete later.
            } 
            res.send(response);
        } else {
            const code = '123' // TODO: make randome generation
            await sendCodeToEmail(code, email);
            pendingEmails[email] = code;
            const response: BaseResponse<String> = {
                meta: {
                    success: true,
                    error: ''
                },
                data: `The newly genereted code is '${code}' .`//  Only in debug sense. Delete later.
            } 
            res.send(response);
        }
    } else {
        res.send('Email not found in the request body');
    }

});

app.post('/confirm-email-by-code', (req, res) => {
    // TODO: required fields check
    const {code, email} = (req.body as EmailConfirmByCodeBody);
    if (code === pendingEmails[email]) {
        const response: BaseResponse<String> = {
            meta: {
                success: true,
                error: ''
            },
            data: 'You have successfuly loged in'
        } 
        res.send(response);
    } else {
        // TODO: more complex handle
        const response: BaseResponse<undefined> = {
            meta: {
                success: false,
                error: 'code is not right'
            }
        }
        res.send(response);
    }

});


app.listen(PORT, () => {
    console.log('The server is online on port: ' + PORT);
});


function sendCodeToEmail(code: string, reciever: string) {
    const user = process.env.SENDER;
    const pass = process.env.APP_KEY;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user, pass
            }
        });
    const mailOptions = {
        from: 'vesnanervah',
        to: reciever,
        subject: 'Email confirm',
        text: `Your code is ${code}`
        };
    return transporter.sendMail(mailOptions);
}
