/*
--- Part Two ---
The air conditioner comes online! Its cold air feels good for a while, but then the TEST alarms start to go off. Since the air conditioner can't vent its heat anywhere but back into the spacecraft, it's actually making the air inside the ship warmer.

Instead, you'll need to use the TEST to extend the thermal radiators. Fortunately, the diagnostic program (your puzzle input) is already equipped for this. Unfortunately, your Intcode computer is not.

Your computer is only missing a few opcodes:

Opcode 5 is jump-if-true: if the first parameter is non-zero, it sets the instruction pointer to the value from the second parameter. Otherwise, it does nothing.
Opcode 6 is jump-if-false: if the first parameter is zero, it sets the instruction pointer to the value from the second parameter. Otherwise, it does nothing.
Opcode 7 is less than: if the first parameter is less than the second parameter, it stores 1 in the position given by the third parameter. Otherwise, it stores 0.
Opcode 8 is equals: if the first parameter is equal to the second parameter, it stores 1 in the position given by the third parameter. Otherwise, it stores 0.
Like all instructions, these instructions need to support parameter modes as described above.

Normally, after an instruction is finished, the instruction pointer increases by the number of values in that instruction. However, if the instruction modifies the instruction pointer, that value is used and the instruction pointer is not automatically increased.

For example, here are several programs that take one input, compare it to the value 8, and then produce one output:

3,9,8,9,10,9,4,9,99,-1,8 - Using position mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
3,9,7,9,10,9,4,9,99,-1,8 - Using position mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).
3,3,1108,-1,8,3,4,3,99 - Using immediate mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
3,3,1107,-1,8,3,4,3,99 - Using immediate mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).
Here are some jump tests that take an input, then output 0 if the input was zero or 1 if the input was non-zero:

3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9 (using position mode)
3,3,1105,-1,9,1101,0,0,12,4,12,99,1 (using immediate mode)
Here's a larger example:

3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99
The above example program uses an input instruction to ask for a single number. The program will then output 999 if the input value is below 8, output 1000 if the input value is equal to 8, or output 1001 if the input value is greater than 8.

This time, when the TEST diagnostic program runs its input instruction to get the ID of the system to test, provide it 5, the ID for the ship's thermal radiator controller. This diagnostic test suite only outputs one number, the diagnostic code.

What is the diagnostic code for system ID 5?
*/

const data = require("./data.js");
const testData = [1005,4,3,99,33];
const testData2 = [3,3,1107,-1,8,3,4,3,99];
const testData3 = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99];

const PARAM_MODE_POSITION = 0;
const PARAM_MODE_IMMEDIATE = 1;

class OpCodeInstruction {
    m_paramsCount;
    process;
    m_data;
    name = this.constructor.name;
    moveToNextInstruction = (positionFrom) => {
        return positionFrom + 1 + this.m_paramsCount;
    }
    getValueFromData = (paramPosition, data, positionFrom, paramTypes) => {
        return getParamType(paramTypes, paramPosition) === PARAM_MODE_POSITION ? data[data[positionFrom + paramPosition + 1]] : data[positionFrom + paramPosition + 1];
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
    getInput = () => {
        // Read input here
        return 5;
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
    output = (value) => {
        console.log(value);
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

const handleOpCode = (opCode) => {
    switch(opCode){
        case 1: return new Add();
        case 2: return new Multiply();
        case 3: return new Input();
        case 4: return new Output();
        case 5: return new JumpIfTrue();
        case 6: return new JumpIfFalse();
        case 7: return new LessThan();
        case 8: return new Equals();
        case 99: return new Halt();
    }
}

const getOpCode = (opCodeValue) => {
    const strOpCode = '' + opCodeValue;
    return +strOpCode.substring(strOpCode.length-2);
}

const handleParamTypes = (opCode) => {
    const strOpCode = '' + opCode;
    let paramTypes = [];
    let j = 0;
    for (i = strOpCode.length - 3; i >= 0; i--){
        paramTypes[j] = strOpCode[i];
        j++;
    }
    return paramTypes;
}

const getParamType = (paramTypes, index) => {
    if (index >= paramTypes.length){
        return 0;
    } else {
        return +paramTypes[index];
    }
}

const process = (data, positionFrom) => {
    const dataValue = data[positionFrom];
    const opCode = getOpCode(dataValue);
    const op = handleOpCode(opCode);
    if (op.name === "Halt"){
        return;
    }
    const paramTypes = handleParamTypes(dataValue);
    op.process(data, positionFrom, paramTypes);
    return process(data, op.moveToNextInstruction(positionFrom));
}

process(data, 0);
