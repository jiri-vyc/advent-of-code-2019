/*
--- Day 3: Crossed Wires ---
The gravity assist was successful, and you're well on your way to the Venus refuelling station. During the rush back on Earth, the fuel management system wasn't completely installed, so that's next on the priority list.

Opening the front panel reveals a jumble of wires. Specifically, two wires are connected to a central port and extend outward on a grid. You trace the path each wire takes as it leaves the central port, one wire per line of text (your puzzle input).

The wires twist and turn, but the two wires occasionally cross paths. To fix the circuit, you need to find the intersection point closest to the central port. Because the wires are on a grid, use the Manhattan distance for this measurement. While the wires do technically cross right at the central port where they both start, this point does not count, nor does a wire count as crossing with itself.

For example, if the first wire's path is R8,U5,L5,D3, then starting from the central port (o), it goes right 8, up 5, left 5, and finally down 3:

...........
...........
...........
....+----+.
....|....|.
....|....|.
....|....|.
.........|.
.o-------+.
...........
Then, if the second wire's path is U7,R6,D4,L4, it goes up 7, right 6, down 4, and left 4:

...........
.+-----+...
.|.....|...
.|..+--X-+.
.|..|..|.|.
.|.-X--+.|.
.|..|....|.
.|.......|.
.o-------+.
...........
These wires cross at two locations (marked X), but the lower-left one is closer to the central port: its distance is 3 + 3 = 6.

Here are a few more examples:

R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83 = distance 159
R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7 = distance 135
What is the Manhattan distance from the central port to the closest intersection?
*/

const wire1 = require("./data.js").wire1;
const wire2 = require("./data.js").wire2;
const UP = "u";
const DOWN = "d";
const LEFT = "l";
const RIGHT = "r";

class Wire {
    m_wireSequentialPathInStrings;
    m_visitedArray = [];

    constructor(stringCoords) {
        this.m_wireSequentialPathInStrings = stringCoords;
    }
    
    getLastCoordinate(coordinatesArray) {
        if (coordinatesArray.length === 0){
            return {
                x: 0,
                y: 0,
            }
        } else {
            return JSON.parse(coordinatesArray[coordinatesArray.length - 1]);
        }
    }
    
    getNextPointCoordinate(startingPoint, instruction) {
        let resultCoordinate = {
            x: startingPoint.x,
            y: startingPoint.y,
        };
        let parsedInctruction = this.parseInstruction(instruction);
        resultCoordinate.x += parsedInctruction.x;
        resultCoordinate.y += parsedInctruction.y;
        return resultCoordinate;
    }
    
    parseInstruction(inputString) {
        let resultCoordinate = { x: 0, y: 0 };
        const direction = inputString.toLowerCase()[0];
        const length = +inputString.substring(1);
        switch (direction) {
            case UP: resultCoordinate.y += length; break;
            case DOWN: resultCoordinate.y -= length; break;
            case LEFT: resultCoordinate.x -= length; break;
            case RIGHT: resultCoordinate.x += length; break;
        }
        return resultCoordinate;
    }
    
    markAsVisited(coordinate) {
        const serializedCoordinate = JSON.stringify(coordinate);
        this.m_visitedArray.push(serializedCoordinate);
    }
    
    markAllBetweenAsVisited(startCoordinate, nextCoordinate) {
        for (let i = 1; i < Math.abs(nextCoordinate.x - startCoordinate.x); i++) {
            this.markAsVisited({x: startCoordinate.x + i * Math.sign(nextCoordinate.x - startCoordinate.x), y: startCoordinate.y});
        }
        for (let j = 1; j < Math.abs(nextCoordinate.y - startCoordinate.y); j++) {
            this.markAsVisited({x: startCoordinate.x, y: startCoordinate.y + j * Math.sign(nextCoordinate.y - startCoordinate.y)});
        }
    }
    
    calculateWirePathRecursive(currentInstructionPosition) {
        if (currentInstructionPosition === this.m_wireSequentialPathInStrings.length) {
            return;
        }
        const startCoordinate = this.getLastCoordinate(this.m_visitedArray);
        const nextCoordinate = this.getNextPointCoordinate(startCoordinate, this.m_wireSequentialPathInStrings[currentInstructionPosition]);
        this.markAllBetweenAsVisited(startCoordinate, nextCoordinate);
        this.markAsVisited(nextCoordinate);
        return this.calculateWirePathRecursive(currentInstructionPosition + 1);
    }

    calculatePath(){
        this.calculateWirePathRecursive(0);
        return this.m_visitedArray;
    }
}

class OverlappingWire extends Wire {
    m_overlaps = [];
    m_wireToOverlap;

    constructor(stringCoords, wireToOverlap) {
        super(stringCoords);
        this.m_wireToOverlap = wireToOverlap;
    }

    markAsVisited(coordinate) {
        const serializedCoordinate = JSON.stringify(coordinate);
        this.m_visitedArray.push(serializedCoordinate);
        if (this.m_wireToOverlap.m_visitedArray.includes(serializedCoordinate)){
            this.m_overlaps.push(coordinate);
        }
    }
}

const calculateManhattanDistance = (fromCoordinate, toCoordinate) => {
    return (Math.abs(toCoordinate.x - fromCoordinate.x) + Math.abs(toCoordinate.y -fromCoordinate.y));
}


const naive = (input1, input2) => {

    const wireOne = new Wire(input1);
    wireOne.calculatePath();
    
    const wireTwo = new Wire(input2);
    wireTwo.calculatePath();

    let result = wireOne.m_visitedArray.filter((one) => {
        return wireTwo.m_visitedArray.indexOf(one) != -1;
    }).filter((one, currentIndex, array) => {
        return array.indexOf(one) === currentIndex;
    }).map((one) => {
        return JSON.parse(one);
    });
    
    const distances = result.map((one) => {
        return calculateManhattanDistance(one, {x: 0, y: 0});
    }).filter((one) => {
        return one !== 0;
    });

    console.log(Math.min(...distances));
}

const compareOverlapsImmediately = (input1, input2) => {

    const wireOne = new Wire(input1);
    wireOne.calculatePath();
    
    const wireTwo = new OverlappingWire(input2, wireOne);
    wireTwo.calculatePath();

    const distances = wireTwo.m_overlaps.map((one) => {
        return calculateManhattanDistance(one, {x: 0, y: 0});
    }).filter((one) => {
        return one !== 0;
    });

    console.log(Math.min(...distances));
}

var start = new Date().getTime();

naive(wire1, wire2);

console.log(`Elapsed time: ${new Date().getTime() - start}`);