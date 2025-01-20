import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan());
app.use(helmet({}));

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Ok');
});

app.listen(PORT, () => console.log('Server is running at port', PORT));
