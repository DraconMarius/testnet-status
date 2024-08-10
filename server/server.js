const path = require("path");
const express = require("express");
const session = require("express-session");

const SequalizeStore = require("connect-session-sequlize")(session.Store);

const routes = require("./controllers");
const sequelize = require('./db/config/connection');

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

const sess = {
    secret: "Abracadabra",
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

sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () =>
        console.log(`now listening at http://localhost:${PORT}/`)
    );
});