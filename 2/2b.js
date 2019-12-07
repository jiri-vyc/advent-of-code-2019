/*
--- Part Two ---
"Good, the new computer seems to be working correctly! Keep it nearby during this mission - you'll probably use it again. Real Intcode computers support many more features than your new one, but we'll let you know what they are as you need them."

"However, your current priority should be to complete your gravity assist around the Moon. For this mission to succeed, we should settle on some terminology for the parts you've already built."

Intcode programs are given as a list of integers; these values are used as the initial state for the computer's memory. When you run an Intcode program, make sure to start by initializing memory to the program's values. A position in memory is called an address (for example, the first value in memory is at "address 0").

Opcodes (like 1, 2, or 99) mark the beginning of an instruction. The values used immediately after an opcode, if any, are called the instruction's parameters. For example, in the instruction 1,2,3,4, 1 is the opcode; 2, 3, and 4 are the parameters. The instruction 99 contains only an opcode and has no parameters.

The address of the current instruction is called the instruction pointer; it starts at 0. After an instruction finishes, the instruction pointer increases by the number of values in the instruction; until you add more instructions to the computer, this is always 4 (1 opcode + 3 parameters) for the add and multiply instructions. (The halt instruction would increase the instruction pointer by 1, but it halts the program instead.)

"With terminology out of the way, we're ready to proceed. To complete the gravity assist, you need to determine what pair of inputs produces the output 19690720."

The inputs should still be provided to the program by replacing the values at addresses 1 and 2, just like before. In this program, the value placed in address 1 is called the noun, and the value placed in address 2 is called the verb. Each of the two input values will be between 0 and 99, inclusive.

Once the program has halted, its output is available at address 0, also just like before. Each time you try a pair of inputs, make sure you first reset the computer's memory to the values in the program (your puzzle input) - in other words, don't reuse memory from a previous attempt.

Find the input noun and verb that cause the program to produce the output 19690720. What is 100 * noun + verb? (For example, if noun=12 and verb=2, the answer would be 1202.)
*/

const data = require("./data.js");
let numOfCycles = 0;
const globalResult = 19690720;
const MAX_POSSIBLE_VALUE = 99;

const add = (data, operandPosition, operandPosition2, resultPosition) => {
  data[resultPosition] = data[operandPosition] + data[operandPosition2];
}

const multiply = (data, operandPosition, operandPosition2, resultPosition) => {
  data[resultPosition] = data[operandPosition] * data[operandPosition2];
}

const process = (data, positionFrom) => {
  if (data.length < 4) {
    throw new Error("Invalid input data - invalid or not terminated array");
  }
  const op = data[positionFrom + 0];
  if (op === 1) {
    add(data, data[positionFrom + 1], data[positionFrom + 2], data[positionFrom + 3]);
    return process(data, positionFrom + 4);
  } else if (op === 2) {
    multiply(data, data[positionFrom + 1], data[positionFrom + 2], data[positionFrom + 3]);
    return process(data, positionFrom + 4);
  } else if (op === 99) {
    return data[0];
  } else {
    throw new Error("Invalid input data - invalid operation type");
  }
}

const start = (noun, verb) => {
  let dataCopy = Array.from(data);
  dataCopy[1] = noun;
  dataCopy[2] = verb;
  numOfCycles++;
  process(dataCopy, 0);
  return dataCopy[0];
}

// @returns correct/found result or result for upper bound of the tested range
const testRange = (rangeStart, rangeSize, targetResult) => {
    // console.log(`testing range ${rangeStart}, size ${rangeSize}`);
    let currentResult;
    for (i = rangeStart; i < rangeStart+rangeSize; i++){
        for (j = 0; j < 100; j++){
            currentResult = start(i,j);
            if (currentResult === targetResult){
                console.log(`Result noun: ${i}, result verb: ${j}`);
                return currentResult;
            }
        }
    }
    return currentResult;
}

// m . n . log(n)
const binarySearch = (inRangeSize, targetResult) => {
    try {
        let rangeStart = 0;
        let minRangeStart = 0;
        const rangeSize = inRangeSize;
        let maxRangeStart = MAX_POSSIBLE_VALUE - inRangeSize + 1;
        let currentResult;
        // Binary search
        while (1) {
            // Always storing either the final result, or the maximum result from the testing range
            currentResult = testRange(rangeStart, rangeSize, targetResult);
            // If result is what we searched for, we're done
            if (currentResult === targetResult){
                break;
            }
            // If maximum result is larger, all of the tested values were also larger (they were all tested and not === to result)
            if (currentResult > targetResult){
                // If results were larger despite searching in lowest possible range, it's an error
                if (rangeStart <= 0) {
                    throw new Error(`Result not found, input too low`);
                }
                maxRangeStart = rangeStart;
                rangeStart = Math.round((minRangeStart + rangeStart) / 2);
            // If maximum result is lower, all of the tested values were also lower (obviously)
            } else if (currentResult < targetResult) {
                // If results were lower despite searching in maximum possible range, it's an error
                if (rangeStart === maxRangeStart) {
                    throw new Error(`Result not found, input too large`);
                }
                minRangeStart = rangeStart;
                rangeStart = Math.round((rangeStart + maxRangeStart) / 2);
            }
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

// m . n^2
const naive = () => {
    try {
        for (i = 0; i < 100; i++){
            for (j = 0; j < 100; j++){
                if (start(i,j) === globalResult){
                    console.log(`Result noun: ${i}, result verb: ${j}`);
                    break;
                }
            }
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

binarySearch(5, globalResult);

console.log(`Number of performed cycles/computations: ${numOfCycles}`);