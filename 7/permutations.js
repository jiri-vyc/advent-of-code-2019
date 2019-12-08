"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swap = (a, i, j) => {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
};
const computePermutationRecursive = (a, n, results) => {
    if (n === 1) {
        results.push(Array.from(a));
        return;
    }
    for (let i = 0; i < n; i++) {
        swap(a, i, n - 1);
        computePermutationRecursive(a, n - 1, results);
        swap(a, i, n - 1);
    }
};
exports.getPermutations = (a) => {
    let results = [];
    computePermutationRecursive(a, a.length, results);
    return results;
};
