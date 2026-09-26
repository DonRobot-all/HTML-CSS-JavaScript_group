const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Как тебя зовут? ", function (name) {
    console.log("Привет, " + name);
    rl.close();
});