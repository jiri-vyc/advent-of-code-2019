"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
--- Part Two ---
Now you're ready to decode the image. The image is rendered by stacking the layers and aligning the pixels with the same positions in each layer. The digits indicate the color of the corresponding pixel: 0 is black, 1 is white, and 2 is transparent.

The layers are rendered with the first layer in front and the last layer in back. So, if a given position has a transparent pixel in the first and second layers, a black pixel in the third layer, and a white pixel in the fourth layer, the final image would have a black pixel at that position.

For example, given an image 2 pixels wide and 2 pixels tall, the image data 0222112222120000 corresponds to the following image layers:

Layer 1: 02
         22

Layer 2: 11
         22

Layer 3: 22
         12

Layer 4: 00
         00
Then, the full image can be found by determining the top visible pixel in each position:

The top-left pixel is black because the top layer is 0.
The top-right pixel is white because the top layer is 2 (transparent), but the second layer is 1.
The bottom-left pixel is white because the top two layers are 2, but the third layer is 1.
The bottom-right pixel is black because the only visible pixel in that position is 0 (from layer 4).
So, the final image looks like this:

01
10
What message is produced after decoding your image?
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
        this.PrintSuppliedLayers(this.m_layers);
    }
    PrintSuppliedLayers(layers) {
        let layerNumber = 1;
        let stringToReturn = "";
        layers.forEach((layer) => {
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
    IsTransparent(colorCode) {
        return (colorCode === 2);
    }
    UpdatePixelColor(from, to) {
        if (from === undefined || this.IsTransparent(from)) {
            return to;
        }
        else {
            return from;
        }
    }
    Print() {
        let toReturn = [];
        this.m_layers.forEach((layer) => {
            for (let i = 0; i < this.m_height; i++) {
                if (!toReturn[i]) {
                    toReturn[i] = [];
                }
                for (let j = 0; j < this.m_width; j++) {
                    toReturn[i][j] = this.UpdatePixelColor(toReturn[i][j], layer[i][j]);
                }
            }
        });
        this.PrintSuppliedLayers([toReturn]);
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
image.Print();
