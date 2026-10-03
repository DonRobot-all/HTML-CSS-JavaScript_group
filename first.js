// let greeting = "Привет, " + "Аня" + "!";
// console.log(greeting);

// for i in range(10):
//     print(i)

// создание переменной, условие, действия при итерации
for (let i = 0; i < 5; i++){
    console.log(i);
}

// count = 0
// while count < 3:
//     print(count)
//     count += 1

let count = 0;
while (count < 3){
    console.log(count);
    count++;
}

// fruits = ['яблоко', "банан", "груша"]
// for fruit in fruits:
//     print(fruit)

let fruits = ['яблоко', "банан", "груша"]
for (let fruit of fruits){
    console.log(fruit);
}

// def greet(name):
//     return "привет " + name
// greet("Аня")

function greet(name){
    return "привет " + name
}

console.log(greet("Аня"))


console.log(5 == "5")
console.log(5 === "5")

console.log(0 == false)
console.log(0 === false)

// and  &&
// or    ||
// not   !