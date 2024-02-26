import express from "express"
import fs from "fs"

const PORT = 8001;

const app = express();
// middleware to accept json as request body
app.use(express.json());

app.get("/pets", (req, res) => {
    // res.json({pets: "All the pets"});
    fs.readFile("../pets.json", "utf-8", (err, text) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.json(JSON.parse(text));
    });
});


app.get("/pets/:indexNum", (req, res) => {

    const index = Number(req.params.indexNum);

    console.log("Using pet index: ", index);

    fs.readFile("../pets.json", "utf-8", (err, text) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        const pets = JSON.parse(text);
        if (!Number.isInteger(index) || index < 0 || index >= pets.length) {
            res.sendStatus(404);
            return;
        }
        // respond with single pet at index
        res.json(pets[index]);

    });
});


app.post("/pets", (req, res) => {
    const name = req.body.name;
    const age = req.body.age;
    const kind = req.body.kind;
    console.log(`Creating pet with - Name: ${name}, Age: ${age}, Kind: ${kind}`);
    const pet = { name, age, kind }
    // TODO - alter pets.json to add the new pet
    res.json(pet);
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});







