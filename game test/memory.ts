
const cardAmount: number = 12; // breaks if not divisable by 2. should scale like 2x2, 2x3, 3x4, 4x4, 4x5, 5x6 etc
let matchesMade: number = cardAmount / 2;

//setup the array of number for the game
function fillArray(amount: number) : number[] {
	let arr: number[] = [];

	//fill array with 2 instances of every number from 0 to amount / 2
	for (let i = 0; i < amount; i++)
	{
		arr[i] = Math.floor(i / 2);
	}

	//shuffle the positions so the game can be played
	for (var i = arr.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}

	return arr;
}


let numbersArray = fillArray(cardAmount);
console.log(numbersArray);


while (matchesMade > 0) {
	//get user input here twice and check whether they are the same 'picture'. if so, remove from array and machteMade++
}