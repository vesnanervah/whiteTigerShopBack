import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PendingEmails } from './types/pending-emails';
import nodemailer from 'nodemailer';
import { EmailConfirmByCodeBody, EmailConfirmInitBody } from './types/email-confirm';
import { BaseResponse } from './types/base-response';
import 'dotenv/config'
import crypto from 'crypto';
import { SavedTokens } from './types/saved-tokens';
import { LoginByTokenReqBody } from './types/login-by-token';

const PORT = 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const pendingEmails: PendingEmails = {};
const savedTokens: SavedTokens = {};

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
                data: `Code is already generated. Check your email.`
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
        const token = createToken();
        savedTokens[email] = token;
        const response: BaseResponse<String> = {
            meta: {
                success: true,
                error: ''
            },
            data: token
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

app.post('/login-by-token', (req, resp) => {
    const {email, token} = req.body as LoginByTokenReqBody;
    if (savedTokens[email] && savedTokens[email] === token) {
        const response: BaseResponse<string> = {
            meta: {
                success: true,
                error: ''
            }, 
            data: 'Successful loged in'
        }
        resp.send(response);
    } else {
        const response: BaseResponse<undefined> = {
            meta: {
                success: false,
                error: 'Token expired or undefined'
            }
        }
        resp.send(response);
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

function createToken() {
    return crypto.randomBytes(30).toString('hex');
}

