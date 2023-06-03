import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
// @ts-ignore
import nocache from 'nocache';
import cors from 'cors';
import path from 'path';

const publicDir = path.join(__dirname, 'public');

const app = express();

// Routes
import healthRoute from './routes/health';
import userRoute from './routes/user';
import planRoute from './routes/plan';

app.use(bodyParser.json({ limit: '50mb' }));
app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(nocache());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

app.use('/', healthRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/plan', planRoute);

//app.use('/schemas/v1', express.static('models/schemas'));

export default app;
