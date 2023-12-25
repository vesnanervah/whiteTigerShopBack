import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PendingEmails } from './types/pending-emails';

const PORT = 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const pendingEmails: PendingEmails = {};

app.get('/', (req, res) => {
    res.send({hello: 'welcome to the api'});
});

app.listen(PORT, () => {
    console.log('The server is online on port: ' + PORT);
});