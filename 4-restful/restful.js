import express, { query } from "express";
// import fs from "fs"; no need to use this 
import pg from "pg";

// const fsPromise = fs.promises; no need to use this 

const PORT = 8001;

const pool = new pg.Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "petshop"
});

const app = express();
// middleware to accept json as request body
app.use(express.json());

// Read all pets
app.get("/pets", (req, res, next) => {
    pool.query('SELECT * FROM pets')
        .then((data) => {
            console.log(`All pets: \n, ${data.rows}`);
            res.json(data.rows);
        })
        .catch((err) => {
            console.error("error querying from pets db", err);
            res.sendStatus(500);
        });
});

// Get single pet
app.get("/pets/:petId", (req, res, next) => {

    const petId = Number.parseInt(req.params.petId);
    console.log("Using pet id ", petId);
    pool.query(`SELECT name, age, kind FROM pets WHERE id = $1`, [petId])
        .then((data) => {
            if (data.rows.length == 0) {
                res.sendStatus(404);
                return;
            }
            console.log(data.rows[0]);
            res.json(data.rows[0]);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
});



// create a new pet
app.post("/pets", (req, res, next) => {
    const age = Number(req.body.age);
    const name = req.body.name;
    const kind = req.body.kind;
    console.log(`Name: ${name}, Age: ${age}, Kind: ${kind}`)
    // return 400 if name or kind is absent, or age is not a number
    if (!name || !kind || Number.isNaN(age)) {
        res.sendStatus(400);
        return;
    }
    console.log(`Creating pet with - Name: ${name}, Age: ${age}, Kind: ${kind}`);
    pool.query(`INSERT INTO pets (name, kind, age) VALUES ($1, $2, $3) RETURNING *`,
        [name, kind, age])
        .then((data) => {
            console.log("Newly created pet: ", data.rows[0]);
            const newPet = data.rows[0];
            delete newPet.id;
            res.json(newPet);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        })
})



// UPDATE ONE route with partial data (patch)
app.patch('/pets/:id', (req, res) => {
    // destruct the id off of the request parameters
    const { id } = req.params;

    // destruct name, kind, age off of the request body
    const { name, age, kind } = req.body;

    // if age exists AND it's not an integer, kick back the request
    if (age !== undefined && isNaN(parseInt(age))) {
        res.status(400).send(`Bad Request -- age must be an integer, if it exists`); return;
    }

    // if the id isn't an integer, kick back the request
    if (isNaN(parseInt(id))) {
        res.status(400).send(`Bad Request -- id must be an integer`); return;
    }

    // query our pool
    pool.query(`UPDATE pets SET name = coalesce($1, name), age = coalesce($2, age), kind = coalesce($3, kind) WHERE id = $4 RETURNING *`,
        [name, age, kind, id])
        .then((results) => {
            try {
                // if we don't get any results back, then send a 404
                if (results.rowCount < 1) {
                    res.status(404).send(`Not found -- pet at index ${id} was not found`); return;
                }
                // if we do get data back
                else {
                    res.status(200).json(results.rows[0]); return;
                }
            }
            catch (err) {
                console.error(err.message);
                res.status(500).send(`Internal Server Error -- failed while trying to 'update pets'`); return;
            }
        });
});


app.delete('/pets/:indexNum', function (req, res, next) {
    const id = Number.parseInt(req.params.indexNum);
    console.log("id: ", id);
    if (Number.isNaN(id)) {
        res.sendStatus(400);
        return;
    }
    console.log("Deleting pet with id ", id)

    pool.query(`DELETE FROM pets WHERE id = $1 RETURNING *`, [id])
        .then((result) => {
            if (result.rows.length === 0) {
                console.log("No pet found with that id");
                res.sendStatus(404);
            } else {
                console.log("Deleted pet: \n", result.rows[0]);
                res.send(result.rows[0]);
            }
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(500);
        })
})


// internal server error catching middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.sendStatus(err.status || 500).send("Internal Server Error");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});