"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
--- Day 8: Space Image Format ---
The Elves' spirits are lifted when they realize you have an opportunity to reboot one of their Mars rovers, and so they are curious if you would spend a brief sojourn on Mars. You land your ship near the rover.

When you reach the rover, you discover that it's already in the process of rebooting! It's just waiting for someone to enter a BIOS password. The Elf responsible for the rover takes a picture of the password (your puzzle input) and sends it to you via the Digital Sending Network.

Unfortunately, images sent via the Digital Sending Network aren't encoded with any normal encoding; instead, they're encoded in a special Space Image Format. None of the Elves seem to remember why this is the case. They send you the instructions to decode it.

Images are sent as a series of digits that each represent the color of a single pixel. The digits fill each row of the image left-to-right, then move downward to the next row, filling rows top-to-bottom until every pixel of the image is filled.

Each image actually consists of a series of identically-sized layers that are filled in this way. So, the first digit corresponds to the top-left pixel of the first layer, the second digit corresponds to the pixel to the right of that on the same layer, and so on until the last digit, which corresponds to the bottom-right pixel of the last layer.

For example, given an image 3 pixels wide and 2 pixels tall, the image data 123456789012 corresponds to the following image layers:

Layer 1: 123
         456

Layer 2: 789
         012
The image you received is 25 pixels wide and 6 pixels tall.

To make sure the image wasn't corrupted during transmission, the Elves would like you to find the layer that contains the fewest 0 digits. On that layer, what is the number of 1 digits multiplied by the number of 2 digits?
*/
const data = require("./data.js");
class SIFImage {
    constructor(width, height) {
        this.m_layers = [];
        this.add = (prev, next, index, arr) => {
            return prev + next;
        };
        this.m_width = width;
        this.m_height = height;
    }
    ConstructFromInput(input) {
        let layerNumber = 0;
        let currentInput;
        let index = 0;
        while (input[index]) {
            this.m_layers[layerNumber] = [];
            for (let i = 0; i < this.m_height; i++) {
                this.m_layers[layerNumber][i] = [];
                for (let j = 0; j < this.m_width; j++) {
                    currentInput = +input[index];
                    if (isNaN(currentInput)) {
                        currentInput = 0;
                    }
                    ;
                    this.m_layers[layerNumber][i][j] = currentInput;
                    index++;
                }
            }
            layerNumber++;
        }
    }
    PrintLayers() {
        let layerNumber = 1;
        let stringToReturn = "";
        this.m_layers.forEach((layer) => {
            stringToReturn += `Layer ${layerNumber}:\n`;
            for (let i = 0; i < this.m_height; i++) {
                for (let j = 0; j < this.m_width; j++) {
                    stringToReturn += layer[i][j];
                }
                stringToReturn += "\n";
            }
            layerNumber++;
        });
        console.log(stringToReturn);
    }
    /**
     * @param input Digit to search for
     * @param layerIndex Number of the layer where to search for digit (starting at 1)
     */
    GetCountOfDigitsInLayerByIndex(input, layerIndex) {
        const layer = this.m_layers[layerIndex - 1];
        return this.GetCountOfDigitsInLayer(input, layer);
    }
    GetCountsOfDigitsInLayers(input) {
        return this.m_layers.map((layer) => {
            return this.GetCountOfDigitsInLayer(input, layer);
        });
    }
    /**
     * @returns Number of layer with the most digits (starting at 1)
     * @param input Digit to search for
     */
    GetLayerWithMostDigits(input) {
        const countsInLayers = this.GetCountsOfDigitsInLayers(input);
        const max = Math.max(...countsInLayers);
        return 1 + countsInLayers.indexOf(max);
    }
    /**
     * @returns Number of layer with the least digits (starting at 1)
     * @param input Digit to search for
     */
    GetLayerWithLeastDigits(input) {
        const countsInLayers = this.GetCountsOfDigitsInLayers(input);
        const min = Math.min(...countsInLayers);
        return 1 + countsInLayers.indexOf(min);
    }
    GetCountOfDigitsInLayer(input, layer) {
        return layer.map((row) => {
            return row.map((digit) => {
                return digit === input ? 1 : 0;
            }).reduce(this.add);
        }).reduce(this.add);
    }
}
let image = new SIFImage(25, 6);
image.ConstructFromInput(data);
const layerWithLeastDigits = image.GetLayerWithLeastDigits(0);
const countOfOnes = image.GetCountOfDigitsInLayerByIndex(1, layerWithLeastDigits);
const countOfTwos = image.GetCountOfDigitsInLayerByIndex(2, layerWithLeastDigits);
console.log(countOfOnes * countOfTwos);
