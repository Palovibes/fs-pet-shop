import http from "node:http";
import fs from "node:fs";

const port = 8001;

const petRegExp = /^\/pets\/(.*)$/;

const server = http.createServer(function (req, res) {

    const method = req.method;
    const url = req.url;

    console.log(`${method} Request to ${url}`);

    // get all the pets
    if (method === "GET" && url === "/pets") {
        console.log("Getting all pets");
        fs.readFile("../pets.json", "utf-8", (err, text) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end();
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
        });

        // get a single pet
    } else if (method === "GET" && url.match(petRegExp)) {
        const index = Number.parseInt(url.match(petRegExp)[1]);
        console.log("Getting pet at index: ", index);

        fs.readFile("../pets.json", "utf-8", (err, text) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end();
                return;
            }
            const pets = JSON.parse(text);
            // make sure index is an integer between 0 and pets.legnth - 1
            if (!Number.isInteger(index) || index < 0 || index >= pets.length) {
                res.statusCode = 404;
                res.setHeader('Content-Type', "text/plain");
                res.end("Not Found");
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(pets[index]));
        });

    } else {
        res.statusCode = 404;
        res.end("Not found");
    }
});

server.listen(port, function () {
    console.log('Listening on port', port);
});