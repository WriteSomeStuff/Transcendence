
// Function to dynamically create and append images to a container
function createImageContainer(imageSources: string[]) {
    // Create a container div
    const container = document.createElement('div');
    container.className = 'image-container';

    // Loop through the image sources and create image elements
    imageSources.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'card'; // Add a wrapper for front and back

        const front = document.createElement('img');
        front.src = src;
        front.className = 'front'; // Front face
		front.height = 150;
		front.width = 150;


        const back = document.createElement('img');
		back.src = 'assets/Default.png'
        back.className = 'back'; // Back face
		back.height = 150;
		back.width = 150;
        // back.textContent = 'Back'; // Example back content

        card.appendChild(front);
        card.appendChild(back);
        container.appendChild(card);
		container.appendChild(card.cloneNode(true));
    });

    // Append the container to the body or any other element
    document.body.appendChild(container);
}

// Example usage
const imageSources = ['assets/cherries.png',
					  'assets/chili.png', 
					  'assets/grapes.png',
					'assets/lemon.png',
				'assets/oli.jpeg',
				'assets/chey.jpeg',
				'assets/milana.jpeg',
				'assets/Michelle.jpeg',
			];

createImageContainer(imageSources);