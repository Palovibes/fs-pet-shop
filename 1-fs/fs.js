import fs from "node:fs"; // ES6 modules

if (process.argv[2] === "read") {
    readPets();
} else if (process.argv[2] === "create") {
    createPet();
} else if (process.argv.length < 3) {
    console.error("Usage: node fs.js [read | create | update | destroy]");
}

function readPets() {
    // get data from pets.json
    fs.readFile("../pets.json", "utf-8", (err, text) => {
        if (err) {
            throw err;
        }

        const pets = JSON.parse(text);

        if (process.argv[3]) {
            // save 4th subcommand as index, converted to a Number
            const index = Number(process.argv[3]);
            // check index to see if its an integer, and within the bounds of pets.length
            if (!Number.isInteger(index) || index < 0 || index >= pets.length) {
                // if we don't have a proper index, log correct usage and exit with code 1
                console.error("Usage: node fs.js read INDEX");
                process.exit(1)
            }
            // otherwise, print the pet at that index 
            console.log(pets[index])
        } else {
            console.log(pets);
        }
    });
}

function createPet() {
    const age = Number(process.argv[3]);
    const kind = process.argv[4];
    const name = process.argv[5];

    if (!age || !kind || !name) {
        console.error("Usage: node fs.js create AGE KIND NAME");
        process.exit(1);
    }

    fs.readFile("../pets.json", "utf-8", (err, text) => {
        if (err) {
            throw err;
        }

        const pets = JSON.parse(text); // array of pets objects
        const newPet = { age, kind, name };
        pets.push(newPet);

        fs.writeFile("../pets.json", JSON.stringify(pets), (err) => {
            if (err) {
                throw err;
            }
            // write was successful, print newly added pet
            console.log(newPet);
        });
    });
}