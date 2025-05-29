// let cards = document.getElementById('card')
let toggledCards: HTMLElement[] = [];

//have pointsplayers be an array so i can % the moves made to store the point on index
let pointsPlayers: [number, number] = [0,0];
let movesMade = 0;

// Wait for the DOM to fully load before selecting elements
document.addEventListener('DOMContentLoaded', () => {
    // Select all dynamically created .card elements
    const cards = document.querySelectorAll('.card');

    // Attach click event listeners to each card
    cards.forEach((card) => {
        card.addEventListener('click', async () => {
			// add card to is-toggled list,
            card.classList.toggle('is-flipped'); // Toggle the 'is-flipped' class
			toggledCards.push(card as HTMLElement);
			console.log(card);
			// if another card is also selected. compare
			if (toggledCards.length == 2)
			{
				const img1 = toggledCards[0].querySelector('img') as HTMLImageElement;
				const img2 = toggledCards[1].querySelector('img') as HTMLImageElement;
				// if correct, add point, switch player, somehow remove card from available deck
				if (img1 && img2 && img1.src === img2.src)
				{
					console.log("ITS A MATCCHHHHH");
					pointsPlayers[movesMade % 2]++;
					//remove eventlistener
				}
				else
				{
					await delay(2000);
					toggledCards.forEach((card) => card.classList.toggle('is-flipped'));
				}
				toggledCards = [];
				movesMade++;
				console.log('P1 = ' + pointsPlayers[0] + " - p2 = " + pointsPlayers[1]);
			}
		});
	});
});

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}