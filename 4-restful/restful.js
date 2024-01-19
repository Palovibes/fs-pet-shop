// Import the necessary modules
import express from "express"; // Import the Express.js framework
import fs from "fs"; // Import the Node.js file system module
const fsPromise = fs.promises; // Promisify the fs module for asynchronous file operations

const PORT = 8001; // Define the port on which the server will listen

const app = express(); // Create an Express application

// Middleware to accept JSON as the request body
app.use(express.json());

// Define a route for GET requests to "/pets"
app.get("/pets", (req, res, next) => {
    // Read the contents of the "../pets.json" file
    fsPromise.readFile("../pets.json", "utf-8")
        .then((text) => {
            // Parse the JSON data and send it as a JSON response
            res.json(JSON.parse(text));
        })
        .catch((err) => {
            // If there's an error reading the file, pass it to the error handling middleware
            next(err);
        });
});

// Define a route for GET requests to "/pets/:indexNum"
app.get("/pets/:indexNum", (req, res, next) => {
    const index = Number(req.params.indexNum); // Extract the "indexNum" parameter from the URL

    console.log("Using pet index: ", index);

    // Read the contents of the "../pets.json" file (consistent with the /pets route)
    fsPromise.readFile("../pets.json", "utf-8")
        .then((text) => {
            const pets = JSON.parse(text); // Parse the JSON data

            // Check if the index is a valid integer and within the range of the "pets" array
            if (!Number.isInteger(index) || index < 0 || index >= pets.length) {
                res.sendStatus(404); // Send a 404 Not Found status code
                return;
            }

            // Respond with the pet data at the specified index
            res.json(pets[index]);
        })
        .catch((err) => next(err)); // Pass any error to the error handling middleware
});

// Define a route for POST requests to "/pets"
app.post("/pets", (req, res, next) => {
    const age = Number(req.body.age); // Extract the "age" from the request body
    const { name, kind } = req.body; // Extract "name" and "kind" from the request body

    // Check if "name," "kind," and "age" exist and "age" is a number
    if (!name || !kind || Number.isNaN(age)) {
        // If validation fails, send a 400 Bad Request status code
        res.sendStatus(400);
        return;
    }

    // Log the creation of a new pet
    console.log(`Creating pet with - Name: ${name}, Age: ${age}, Kind: ${kind}`);

    // Create a pet object
    const pet = { name: name, age: age, kind: kind };

    // Read the contents of the "../pets.json" file
    fsPromise.readFile("../pets.json", "utf-8")
        .then((text) => { // Read the existing pets data
            const pets = JSON.parse(text); // Parse the JSON data
            pets.push(pet); // Add the new pet to the array
            return pets; // Return the updated pets array
        })
        .then((pets) => { // Write the updated pets data back to the file
            return fsPromise.writeFile("../pets.json", JSON.stringify(pets));
        })
        .then(() => {
            // If the file write is successful, send a JSON response with the new pet data
            console.log("Added new pet to pets.json");
            res.json(pet);
        })
        .catch((err) => {
            next(err); // Pass any error to the error handling middleware
        });
});

// Define a route for PATCH requests to "/pets/:indexNum"
app.patch('/pets/:indexNum', function (req, res, next) {
    const index = Number(req.params.indexNum); // Extract the "indexNum" parameter from the URL
    const name = req.body.name; // Extract the "name" from the request body

    // Check if there is an actual index and a name, but not checking the range
    if (!Number.isInteger(index) || index < 0 || !name) {
        res.sendStatus(400); // Send a 400 Bad Request status code
        return;
    }

    // Read the contents of the "../pets.json" file
    fsPromise.readFile("../pets.json", "utf-8")
        .then((text) => {
            const pets = JSON.parse(text); // Parse the JSON data

            // Check if the index is within the bounds of the "pets" array
            if (index < 0 || index >= pets.length) {
                res.sendStatus(404); // Send a 404 Not Found status code
                return;
            }

            // Update the pet's name at the specified index
            pets[index].name = name;

            // Write the updated pets data back to the file
            return fsPromise.writeFile("../pets.json", JSON.stringify(pets));
        })
        .then(() => {
            // If the file write is successful, send a JSON response indicating success
            console.log(`Updated pet at index ${index} with new name: ${name}`);
            res.json({ message: 'Pet updated successfully' });
        })
        .catch((err) => {
            next(err); // Pass any error to the error handling middleware
        });
});

// Define an internal server error catching middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error to the console
    res.sendStatus(500); // Send a 500 Internal Server Error status code
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
