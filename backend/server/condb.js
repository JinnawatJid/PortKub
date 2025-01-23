import pg from "pg";

const db = new pg.Client({
    user: "",
    host: "",
    database: "",
    password: "",
    port: "",
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database successfully!");
    }
});

export default db;