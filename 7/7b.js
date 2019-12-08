"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
--- Part Two ---
It's no good - in this configuration, the amplifiers can't generate a large enough output signal to produce the thrust you'll need. The Elves quickly talk you through rewiring the amplifiers into a feedback loop:

      O-------O  O-------O  O-------O  O-------O  O-------O
0 -+->| Amp A |->| Amp B |->| Amp C |->| Amp D |->| Amp E |-.
   |  O-------O  O-------O  O-------O  O-------O  O-------O |
   |                                                        |
   '--------------------------------------------------------+
                                                            |
                                                            v
                                                     (to thrusters)
Most of the amplifiers are connected as they were before; amplifier A's output is connected to amplifier B's input, and so on. However, the output from amplifier E is now connected into amplifier A's input. This creates the feedback loop: the signal will be sent through the amplifiers many times.

In feedback loop mode, the amplifiers need totally different phase settings: integers from 5 to 9, again each used exactly once. These settings will cause the Amplifier Controller Software to repeatedly take input and produce output many times before halting. Provide each amplifier its phase setting at its first input instruction; all further input/output instructions are for signals.

Don't restart the Amplifier Controller Software on any amplifier during this process. Each one should continue receiving and sending signals until it halts.

All signals sent or received in this process will be between pairs of amplifiers except the very first signal and the very last signal. To start the process, a 0 signal is sent to amplifier A's input exactly once.

Eventually, the software on the amplifiers will halt after they have processed the final loop. When this happens, the last output signal from amplifier E is sent to the thrusters. Your job is to find the largest output signal that can be sent to the thrusters using the new phase settings and feedback loop arrangement.

Here are some example programs:

Max thruster signal 139629729 (from phase setting sequence 9,8,7,6,5):

3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,
27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5
Max thruster signal 18216 (from phase setting sequence 9,7,8,5,6):

3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,
-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,
53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10
Try every combination of the new phase settings on the amplifier feedback loop. What is the highest signal that can be sent to the thrusters?
*/
const data = require("./data.js");
const permutations_1 = require("./permutations");
const testData = [3, 21, 1008, 21, 8, 20, 1005, 20, 22, 107, 8, 21, 20, 1006, 20, 31,
    1106, 0, 36, 98, 0, 0, 1002, 21, 125, 20, 4, 20, 1105, 1, 46, 104,
    999, 1105, 1, 46, 1101, 1000, 1, 20, 4, 20, 1105, 1, 46, 98, 99];
const testData2 = [3, 23, 3, 24, 1002, 24, 10, 24, 1002, 23, -1, 23,
    101, 5, 23, 23, 1, 24, 23, 23, 4, 23, 99, 0, 0];
const testData3 = [3, 31, 3, 32, 1002, 32, 10, 32, 1001, 31, -2, 31, 1007, 31, 0, 33,
    1002, 33, 7, 33, 1, 33, 31, 31, 1, 32, 31, 31, 4, 31, 99, 0, 0, 0];
class OpCodeInstruction {
    constructor() {
        this.name = this.constructor.name;
        this.moveToNextInstruction = (positionFrom) => {
            return positionFrom + 1 + this.m_paramsCount;
        };
        this.getValueFromData = (paramPosition, data, positionFrom, paramTypes) => {
            return this.getParamType(paramTypes, paramPosition) === OpCodeInstruction.PARAM_MODE_POSITION ? data[data[positionFrom + paramPosition + 1]] : data[positionFrom + paramPosition + 1];
        };
    }
    getParamType(paramTypes, index) {
        if (index >= paramTypes.length) {
            return 0;
        }
        else {
            return +paramTypes[index];
        }
    }
}
OpCodeInstruction.PARAM_MODE_POSITION = 0;
OpCodeInstruction.PARAM_MODE_IMMEDIATE = 1;
class Add extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 3;
        this.add = (val1, val2, val3) => {
            this.m_data[val3] = val1 + val2;
        };
        this.process = (data, positionFrom, paramTypes) => {
            this.m_data = data;
            const value1 = this.getValueFromData(0, data, positionFrom, paramTypes);
            const value2 = this.getValueFromData(1, data, positionFrom, paramTypes);
            this.add(value1, value2, data[positionFrom + 3]);
        };
    }
}
class Multiply extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 3;
        this.multiply = (val1, val2, val3) => {
            this.m_data[val3] = val1 * val2;
        };
        this.process = (data, positionFrom, paramTypes) => {
            this.m_data = data;
            const value1 = this.getValueFromData(0, data, positionFrom, paramTypes);
            const value2 = this.getValueFromData(1, data, positionFrom, paramTypes);
            this.multiply(value1, value2, data[positionFrom + 3]);
        };
    }
}
class Input extends OpCodeInstruction {
    constructor(inputFunction) {
        super();
        this.m_paramsCount = 1;
        this.getInput = () => {
            // Read input here
            return this.m_inputFunction();
        };
        this.saveInput = (val1, val2) => {
            this.m_data[val1] = val2;
        };
        this.process = (data, positionFrom, paramTypes) => {
            const input = this.getInput();
            this.m_data = data;
            this.saveInput(data[positionFrom + 1], input);
        };
        this.m_inputFunction = inputFunction;
    }
}
class Output extends OpCodeInstruction {
    constructor(outputFunction) {
        super();
        this.m_paramsCount = 1;
        this.output = (value) => {
            this.m_outputFunction(value);
        };
        this.process = (data, positionFrom, paramTypes) => {
            this.output(this.getValueFromData(0, data, positionFrom, paramTypes));
        };
        this.m_outputFunction = outputFunction;
    }
}
class Halt extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 0;
        this.process = (data, positionFrom, paramTypes) => {
            return;
        };
    }
}
class JumpIfTrue extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 2;
        this.process = (data, positionFrom, paramTypes) => {
            const valueToCheck = this.getValueFromData(0, data, positionFrom, paramTypes);
            if (valueToCheck !== 0) {
                this.m_next_location = this.getValueFromData(1, data, positionFrom, paramTypes);
            }
        };
        this.moveToNextInstruction = (positionFrom) => {
            if (this.m_next_location === undefined) {
                return positionFrom + 1 + this.m_paramsCount;
            }
            else {
                return this.m_next_location;
            }
        };
    }
}
class JumpIfFalse extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 2;
        this.process = (data, positionFrom, paramTypes) => {
            const valueToCheck = this.getValueFromData(0, data, positionFrom, paramTypes);
            if (valueToCheck === 0) {
                this.m_next_location = this.getValueFromData(1, data, positionFrom, paramTypes);
            }
        };
        this.moveToNextInstruction = (positionFrom) => {
            if (this.m_next_location === undefined) {
                return positionFrom + 1 + this.m_paramsCount;
            }
            else {
                return this.m_next_location;
            }
        };
    }
}
class LessThan extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 3;
        this.saveInput = (val1, val2) => {
            this.m_data[val1] = val2;
        };
        this.process = (data, positionFrom, paramTypes) => {
            this.m_data = data;
            const valueToCheck1 = this.getValueFromData(0, data, positionFrom, paramTypes);
            const valueToCheck2 = this.getValueFromData(1, data, positionFrom, paramTypes);
            if (valueToCheck1 < valueToCheck2) {
                this.saveInput(data[positionFrom + 3], 1);
            }
            else {
                this.saveInput(data[positionFrom + 3], 0);
            }
        };
    }
}
class Equals extends OpCodeInstruction {
    constructor() {
        super(...arguments);
        this.m_paramsCount = 3;
        this.saveInput = (val1, val2) => {
            this.m_data[val1] = val2;
        };
        this.process = (data, positionFrom, paramTypes) => {
            this.m_data = data;
            const valueToCheck1 = this.getValueFromData(0, data, positionFrom, paramTypes);
            const valueToCheck2 = this.getValueFromData(1, data, positionFrom, paramTypes);
            if (valueToCheck1 === valueToCheck2) {
                this.saveInput(data[positionFrom + 3], 1);
            }
            else {
                this.saveInput(data[positionFrom + 3], 0);
            }
        };
    }
}
class IntcodeComputer {
    constructor(input, output) {
        this.m_inputFunction = input;
        this.m_outputFunction = output;
    }
    handleOpCode(opCode) {
        switch (opCode) {
            case 1: return new Add();
            case 2: return new Multiply();
            case 3: return new Input(this.m_inputFunction);
            case 4: return new Output(this.m_outputFunction);
            case 5: return new JumpIfTrue();
            case 6: return new JumpIfFalse();
            case 7: return new LessThan();
            case 8: return new Equals();
            case 99: return new Halt();
        }
    }
    getOpCode(opCodeValue) {
        const strOpCode = '' + opCodeValue;
        return +strOpCode.substring(strOpCode.length - 2);
    }
    handleParamTypes(opCode) {
        const strOpCode = '' + opCode;
        let paramTypes = [];
        let j = 0;
        for (let i = strOpCode.length - 3; i >= 0; i--) {
            paramTypes[j] = strOpCode[i];
            j++;
        }
        return paramTypes;
    }
    process(data, positionFrom) {
        const localData = Array.from(data);
        const dataValue = localData[positionFrom];
        const opCode = this.getOpCode(dataValue);
        const op = this.handleOpCode(opCode);
        if (op.name === "Halt") {
            return;
        }
        const paramTypes = this.handleParamTypes(dataValue);
        op.process(localData, positionFrom, paramTypes);
        return this.process(localData, op.moveToNextInstruction(positionFrom));
    }
}
let outputData = [0];
let phase = [];
// alternate between phase input and supplying last output as input
const getNextInput = () => {
    if (phase.length > 0) {
        return phase.pop();
    }
    else {
        return outputData.pop();
    }
};
const comp = new IntcodeComputer(getNextInput, (val) => { outputData.push(val); });
let resultsArray = [];
const permutations = permutations_1.getPermutations([0, 1, 2, 3, 4]);
permutations.forEach((permutation) => {
    outputData = [0];
    phase = [];
    while (1) {
        for (let i = 0; i < 5; i++) {
            phase.push(permutation[i]);
            comp.process(data, 0);
        }
        // resultsArray.push(outputData.pop());
    }
});
console.log(Math.max(...resultsArray));
