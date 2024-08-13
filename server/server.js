const path = require("path");
require("dotenv").config;
const express = require("express");
const session = require("express-session");

const SequalizeStore = require("connect-session-sequelize")(session.Store);

const routes = require("./controllers/index.js");
const sequelize = require('./db/config/connection');

const app = express();

const PORT = process.env.PORT || 3001;

const Net = require("./db/models/net");
const Avg = require("./db/models/avg");
const Tx = require("./db/models/tx");

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

const sess = {
    secret: process.env.SECRET,
    cookies: {},
    resave: false,
    saveUnintialized: true,
    store: new SequalizeStore({
        db: sequelize,
    })
};

app.use(session(sess));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(routes)

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

sequelize.sync({ force: false })
    .then(() => Net.sync())
    .then(() => Avg.sync())
    .then(() => Tx.sync())
    .then(() => {
        app.listen(PORT, () => {
            console.log(`now listening at http://localhost:${PORT}/`);
        });
    });
