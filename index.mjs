import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import routes from './routes.mjs';

const app = express();

app.use(cookieParser());

app.set('view engine', 'ejs');

// This is takes input from HTML forms and puts it in req.body
app.use(express.urlencoded({ extended: false }));

// This takes from what axios sends and puts into req.body
app.use(express.json());

app.use(express.static('public'));

app.use(methodOverride('_method'));

// set the routes
routes(app);

const PORT = process.env.PORT || 3004;

app.listen(PORT);
