/*
--- Part Two ---
An Elf just remembered one more important detail: the two adjacent matching digits are not part of a larger group of matching digits.

Given this additional criterion, but still ignoring the range rule, the following are now true:

112233 meets these criteria because the digits never decrease and all repeated digits are exactly two digits long.
123444 no longer meets the criteria (the repeated 44 is part of a larger group of 444).
111122 meets the criteria (even though 1 is repeated more than twice, it still contains a double 22).
How many different passwords within the range given in your puzzle input meet all of the criteria?
*/

const findInRangeNaive = (from, to) => {
    let count = 0;
    let hasSame;
    let isIncreasing;
    for (i = from; i <= to; i++){
        hasSame = false;
        isIncreasing = true;
        strI = '' + i;
        for (j = 1; j <= 5; j++){
            if (strI[j-1] > strI[j]){
                isIncreasing = false;
                break;
            }
            if (
                (strI[j-1] === strI[j]) &&
                ( (strI[j-2] === undefined) || (strI[j-2] !== strI[j]) ) && 
                ( (strI[j+1] === undefined) || (strI[j+1] !== strI[j]) )
                ) {
                hasSame = true;
            }
        }
        if (hasSame && isIncreasing){
            count++;
        }
    }
    return count;
}

console.log(findInRangeNaive(168630,718098));