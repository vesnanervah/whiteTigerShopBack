import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import { EmailConfirmByCodeBody, EmailConfirmInitBody } from './types/email-confirm';
import { BaseResponse } from './types/base-response';
import 'dotenv/config'
import crypto from 'crypto';
import { LoginByTokenReqBody } from './types/login-by-token';

const PORT = 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const pendingEmails = new Map<string, string>();
const savedTokens = new Map<string, string>();

app.get('/', (req, res) => {
    res.send({hello: 'welcome to the api'});
});


app.post('/init-email-confirm', async (req, res) => {
    if ((req.body as EmailConfirmInitBody).email) {
        const email = (req.body as EmailConfirmInitBody).email;
        if (pendingEmails.has(email)) {
            const response: BaseResponse<String> = {
                meta: {
                    success: true,
                    error: ''
                },
                data: `Code is already generated. Check your email.`
            } 
            res.send(response);
        } else {
            const code = generateRandomCode();
            await sendCodeToEmail(code, email);
            pendingEmails.set(email, code);
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
    if (code === pendingEmails.get(email)) {
        const token = createToken();
        savedTokens.set(email, token);
        pendingEmails.delete(email);
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
    if (savedTokens.has(email) && savedTokens.get(email) === token) {
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

function generateRandomCode() {
    return (Math.random() * 1000).toPrecision(3);
}

