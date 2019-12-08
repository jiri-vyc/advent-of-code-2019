const swap = (a: number[], i: number, j: number) => {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

const computePermutationRecursive = (a: number[], n: number, results) => {
    if (n === 1){
        results.push(Array.from(a));
        return;
    }
    for (let i = 0; i < n; i++){
        swap(a, i, n-1);
        computePermutationRecursive(a, n-1, results);
        swap(a, i, n-1);
    }
}

export const getPermutations = (a: number[]): number[][] => {
    let results = [];
    computePermutationRecursive(a, a.length, results);
    return results;
}