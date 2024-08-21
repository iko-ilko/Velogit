const fs = require("fs");
const path = requre("path");
const post = require("./post");
const sync = require("./sync");

const command = process.argv[2];
const filepath = process.argv[3];

async function main() {
    try {
        if (command === "post" && filepath) {
            await post(filepath);
        }
        else if (command === "sync")
            await sync();
        }
        else {
        console.error("Invalid command or missing file path");
        process.exit(1);
        }
    catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}