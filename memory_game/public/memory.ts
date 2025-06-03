
const cards = document.querySelectorAll('.card');
shuffleCards();

const restartButton = document.getElementById('restart');

//holds the currently chosen cards to be compared. will hold max 2 cards at any stage
let toggledCards: HTMLElement[] = [];

//have pointsplayers be an array so i can % the moves made to store the point on index
let pointsPlayers: [number, number] = [0,0];
displayScore();

let movesMade = 0;

const MAX_TOGGLED_CARDS = 2;

function removeCardListeners()
{
	cards.forEach(card => {
		card.removeEventListener('click', gameLogic);
	});
}

function restoreCardListeners()
{
	cards.forEach(card => {
		//cards get set to hidden when they have been matched. this check makes sure already matched cards are not restored
		if (!card.classList.contains('hidden'))
			card.addEventListener('click', gameLogic);
	});
}

function selectCard(card: HTMLElement){
	card.classList.add('is-flipped');
	toggledCards.push(card as HTMLElement);
	card.removeEventListener('click', gameLogic);
}

async function compareCards(){

	//grab both cards as HTMLElement for comparison
	const img1 = toggledCards[0].querySelector('img') as HTMLImageElement;
	const img2 = toggledCards[1].querySelector('img') as HTMLImageElement;
	
	//delay for visual
	await delay(1000);

	if (img1 && img2 && img1.src === img2.src)
	{
		//hide cards if they are matched
		toggledCards.forEach(item => {
			item.classList.add('hidden');
		});
		//give player point
		pointsPlayers[movesMade % 2]++;
	}
	else
	{
		//return unmatched cards to default state
		toggledCards.forEach((card) => card.classList.remove('is-flipped'));
		movesMade++;
	}
	toggledCards = [];

}

const gameLogic = async function(event: Event)
{
	let card = event.currentTarget as HTMLElement;

	// add card to is-toggled list,
	selectCard(card);

	// if another card is also selected. compare
	if (toggledCards.length == MAX_TOGGLED_CARDS)
	{
		//remove Eventlisteners so user cant click more cards during wait
		removeCardListeners();

		await compareCards();

		//reset event listener
		restoreCardListeners();

		displayScore();
	}
}

function shuffleCards(){
	const elementsArray = Array.from(cards);

    // Shuffle the array
    elementsArray.sort(() => Math.random() - 0.5);

    // Get the parent element
    const parent = cards[0].parentNode;

    // Re-append the shuffled elements to the parent
    elementsArray.forEach(node => {
        if (parent) {
            parent.appendChild(node);
        }
    });
}

function displayScore()
{
	console.log ("score: " + pointsPlayers[0] + ' vs ' + pointsPlayers[1]);
	let board = document.getElementById('scoreboardLeft');
	if (board)
		board.textContent = 'P1: ' + pointsPlayers[0];
	board = document.getElementById('scoreboardRight');
	if (board)
		board.textContent = 'P2: ' + pointsPlayers[1];
		
}

// Wait for the DOM to fully load before selecting elements
document.addEventListener('DOMContentLoaded', () => {
    // Attach click event listeners to each card
    cards.forEach((card) => {
        card.addEventListener('click', gameLogic);
	});
	console.log ("Value of button is "+ restartButton);
	restartButton?.addEventListener('click', restart);
});

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const restart = function(){
	shuffleCards();
	cards.forEach(card =>{
		if (card.classList.contains('hidden'))
			card.classList.remove('hidden');
		if (card.classList.contains('is-flipped'))
			card.classList.remove('is-flipped');
			
	})
	toggledCards = [];
	movesMade = 0;
	pointsPlayers = [0,0];
	restoreCardListeners();
	displayScore();
}