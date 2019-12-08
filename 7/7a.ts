/*
--- Day 7: Amplification Circuit ---
Based on the navigational maps, you're going to need to send more power to your ship's thrusters to reach Santa in time. To do this, you'll need to configure a series of amplifiers already installed on the ship.

There are five amplifiers connected in series; each one receives an input signal and produces an output signal. They are connected such that the first amplifier's output leads to the second amplifier's input, the second amplifier's output leads to the third amplifier's input, and so on. The first amplifier's input value is 0, and the last amplifier's output leads to your ship's thrusters.

    O-------O  O-------O  O-------O  O-------O  O-------O
0 ->| Amp A |->| Amp B |->| Amp C |->| Amp D |->| Amp E |-> (to thrusters)
    O-------O  O-------O  O-------O  O-------O  O-------O
The Elves have sent you some Amplifier Controller Software (your puzzle input), a program that should run on your existing Intcode computer. Each amplifier will need to run a copy of the program.

When a copy of the program starts running on an amplifier, it will first use an input instruction to ask the amplifier for its current phase setting (an integer from 0 to 4). Each phase setting is used exactly once, but the Elves can't remember which amplifier needs which phase setting.

The program will then call another input instruction to get the amplifier's input signal, compute the correct output signal, and supply it back to the amplifier with an output instruction. (If the amplifier has not yet received an input signal, it waits until one arrives.)

Your job is to find the largest output signal that can be sent to the thrusters by trying every possible combination of phase settings on the amplifiers. Make sure that memory is not shared or reused between copies of the program.

For example, suppose you want to try the phase setting sequence 3,1,2,4,0, which would mean setting amplifier A to phase setting 3, amplifier B to setting 1, C to 2, D to 4, and E to 0. Then, you could determine the output signal that gets sent from amplifier E to the thrusters with the following steps:

Start the copy of the amplifier controller software that will run on amplifier A. At its first input instruction, provide it the amplifier's phase setting, 3. At its second input instruction, provide it the input signal, 0. After some calculations, it will use an output instruction to indicate the amplifier's output signal.
Start the software for amplifier B. Provide it the phase setting (1) and then whatever output signal was produced from amplifier A. It will then produce a new output signal destined for amplifier C.
Start the software for amplifier C, provide the phase setting (2) and the value from amplifier B, then collect its output signal.
Run amplifier D's software, provide the phase setting (4) and input value, and collect its output signal.
Run amplifier E's software, provide the phase setting (0) and input value, and collect its output signal.
The final output signal from amplifier E would be sent to the thrusters. However, this phase setting sequence may not have been the best one; another sequence might have sent a higher signal to the thrusters.

Here are some example programs:

Max thruster signal 43210 (from phase setting sequence 4,3,2,1,0):

3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0
Max thruster signal 54321 (from phase setting sequence 0,1,2,3,4):

3,23,3,24,1002,24,10,24,1002,23,-1,23,
101,5,23,23,1,24,23,23,4,23,99,0,0
Max thruster signal 65210 (from phase setting sequence 1,0,4,3,2):

3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,
1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0
Try every combination of phase settings on the amplifiers. What is the highest signal that can be sent to the thrusters?
*/
import * as data from "./data.js";
import { getPermutations } from "./permutations";
const testData = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99];
const testData2 = [3,23,3,24,1002,24,10,24,1002,23,-1,23,
    101,5,23,23,1,24,23,23,4,23,99,0,0];
const testData3 = [3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,
    1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0];

class OpCodeInstruction {
    public static PARAM_MODE_POSITION = 0;
    public static PARAM_MODE_IMMEDIATE = 1;
    m_paramsCount;
    process;
    m_data;
    name = this.constructor.name;
    moveToNextInstruction = (positionFrom) => {
        return positionFrom + 1 + this.m_paramsCount;
    }
    getParamType (paramTypes, index) {
        if (index >= paramTypes.length){
            return 0;
        } else {
            return +paramTypes[index];
        }
    }
    getValueFromData = (paramPosition, data, positionFrom, paramTypes) => {
        return this.getParamType(paramTypes, paramPosition) === OpCodeInstruction.PARAM_MODE_POSITION ? data[data[positionFrom + paramPosition + 1]] : data[positionFrom + paramPosition + 1];
    }
}

class Add extends OpCodeInstruction {
    m_paramsCount = 3;
    add = (val1, val2, val3) => {
        this.m_data[val3] = val1 + val2;
    }
    process = (data, positionFrom, paramTypes) => {
        this.m_data = data;
        const value1 = this.getValueFromData(0, data, positionFrom, paramTypes);
        const value2 = this.getValueFromData(1, data, positionFrom, paramTypes);
        this.add(value1, value2, data[positionFrom + 3]);
    }
}
class Multiply extends OpCodeInstruction {
    m_paramsCount = 3;
    multiply = (val1, val2, val3) => {
        this.m_data[val3] = val1 * val2;
    }
    process = (data, positionFrom, paramTypes) => {
        this.m_data = data;
        const value1 = this.getValueFromData(0, data, positionFrom, paramTypes);
        const value2 = this.getValueFromData(1, data, positionFrom, paramTypes);
        this.multiply(value1, value2, data[positionFrom + 3]);
    }
}

class Input extends OpCodeInstruction {
    m_paramsCount = 1;
    m_inputFunction;
    constructor(inputFunction){
        super();
        this.m_inputFunction = inputFunction;
    }
    getInput = () => {
        // Read input here
        return this.m_inputFunction();
    }
    saveInput = (val1, val2) => {
        this.m_data[val1] = val2;
    }
    process = (data, positionFrom, paramTypes) => {
        const input = this.getInput();
        this.m_data = data;
        this.saveInput(data[positionFrom + 1], input)
    }
}
class Output extends OpCodeInstruction {
    m_paramsCount = 1;
    m_outputFunction;
    constructor(outputFunction){
        super();
        this.m_outputFunction = outputFunction;
    }
    output = (value) => {
        this.m_outputFunction(value);
    }
    process = (data, positionFrom, paramTypes) => {
        this.output(this.getValueFromData(0, data, positionFrom, paramTypes));
    }
}
class Halt extends OpCodeInstruction {
    m_paramsCount = 0;
    process = (data, positionFrom, paramTypes) => {
        return;
    }
}
class JumpIfTrue extends OpCodeInstruction {
    m_paramsCount = 2;
    m_next_location;
    process = (data, positionFrom, paramTypes) => {
        const valueToCheck = this.getValueFromData(0, data, positionFrom, paramTypes);
        if (valueToCheck !== 0){
            this.m_next_location = this.getValueFromData(1, data, positionFrom, paramTypes);
        }
    }
    moveToNextInstruction = (positionFrom) => {
        if (this.m_next_location === undefined){
            return positionFrom + 1 + this.m_paramsCount;
        } else {
            return this.m_next_location;
        }
    }
}
class JumpIfFalse extends OpCodeInstruction {
    m_paramsCount = 2;
    m_next_location;
    process = (data, positionFrom, paramTypes) => {
        const valueToCheck = this.getValueFromData(0, data, positionFrom, paramTypes);
        if (valueToCheck === 0){
            this.m_next_location = this.getValueFromData(1, data, positionFrom, paramTypes);
        }
    }
    moveToNextInstruction = (positionFrom) => {
        if (this.m_next_location === undefined){
            return positionFrom + 1 + this.m_paramsCount;
        } else {
            return this.m_next_location;
        }
    }
}
class LessThan extends OpCodeInstruction {
    m_paramsCount = 3;
    saveInput = (val1, val2) => {
        this.m_data[val1] = val2;
    }
    process = (data, positionFrom, paramTypes) => {
        this.m_data = data;
        const valueToCheck1 = this.getValueFromData(0, data, positionFrom, paramTypes);
        const valueToCheck2 = this.getValueFromData(1, data, positionFrom, paramTypes);
        if (valueToCheck1 < valueToCheck2){
            this.saveInput(data[positionFrom + 3], 1);
        } else {
            this.saveInput(data[positionFrom + 3], 0);
        }

    }
}
class Equals extends OpCodeInstruction {
    m_paramsCount = 3;
    saveInput = (val1, val2) => {
        this.m_data[val1] = val2;
    }
    process = (data, positionFrom, paramTypes) => {
        this.m_data = data;
        const valueToCheck1 = this.getValueFromData(0, data, positionFrom, paramTypes);
        const valueToCheck2 = this.getValueFromData(1, data, positionFrom, paramTypes);
        if (valueToCheck1 === valueToCheck2){
            this.saveInput(data[positionFrom + 3], 1);
        } else {
            this.saveInput(data[positionFrom + 3], 0);
        }

    }
}

class IntcodeComputer {
    private m_inputFunction;
    private m_outputFunction;

    constructor(input, output) {
        this.m_inputFunction = input;
        this.m_outputFunction = output;
    }

    handleOpCode(opCode) {
        switch(opCode){
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
        return +strOpCode.substring(strOpCode.length-2);
    }

    handleParamTypes(opCode) {
        const strOpCode = '' + opCode;
        let paramTypes = [];
        let j = 0;
        for (let i = strOpCode.length - 3; i >= 0; i--){
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
        if (op.name === "Halt"){
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
    if (phase.length > 0){
        return phase.pop();
    } else {
        return outputData.pop();
    }
}

const comp = new IntcodeComputer(getNextInput, (val) => { outputData.push(val) });

let resultsArray = [];
const permutations = getPermutations([0,1,2,3,4]);

permutations.forEach((permutation) => {
    outputData = [0];
    phase = [];
    for (let i = 0; i < 5; i++){
        phase.push(permutation[i]);
        comp.process(data, 0);
    }
    resultsArray.push(outputData.pop());
});

console.log(Math.max(...resultsArray));

