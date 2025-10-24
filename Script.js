document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('startButton');
    const scrambleImage = document.getElementById('scrambleImage'); // New element for image
    const scrambleText = document.getElementById('scrambleText');   // New element for text scramble
    const timesList = document.getElementById('timesList');
    const clearButton = document.getElementById('clearButton');

    let timer;
    let startTime;
    let running = false;
    // Load times from local storage, or start with an empty array
    let times = JSON.parse(localStorage.getItem('cubingTimes')) || [];

    // --- Scramble Generation (using cubejs-scramble library) ---
    // The cubejs-scramble library is loaded via CDN in index.html
    function generateScramble() {
        // Use the library to get a 3x3 scramble string
        // 'window.Scramble' is used because the library adds itself to the global window object
        const scrambleAlg = new window.Scramble().get(3);
        scrambleText.textContent = scrambleAlg; // Display the text scramble

        // --- Scramble Image Display (using VisualCube online service) ---
        // This constructs a URL to an external service that generates an image
        // of the cube in the scrambled state.
        // Parameters:
        //   fmt=svg: Format as SVG (scalable vector graphics)
        //   size=150: Image size
        //   bg=transparent: Transparent background
        //   stage=full: Show the entire cube
        //   view=plan: Top-down view
        //   flag=showall: Show all visible faces
        //   case=${encodeURIComponent(scrambleAlg)}: The actual scramble string, URL-encoded
        const imageUrl = `https://visualcube.online/visualcube.php?fmt=svg&size=150&bg=transparent&stage=full&view=plan&flag=showall&case=${encodeURIComponent(scrambleAlg)}`;
        scrambleImage.src = imageUrl; // Set the image source
        scrambleImage.alt = "Scramble: " + scrambleAlg; // Add alt text for accessibility
    }

    // --- Timer Functions ---
    function startTimer() {
        startTime = Date.now(); // Record the start time
        // Update the timer display every 10 milliseconds
        timer = setInterval(updateTimer, 10);
        running = true; // Timer is now running
        startButton.textContent = 'Stop (Spacebar)';
    }

    function stopTimer() {
        clearInterval(timer); // Stop the interval updates
        running = false; // Timer is no longer running
        const endTime = Date.now(); // Record the end time
        const timeElapsed = (endTime - startTime) / 1000; // Calculate time in seconds
        const formattedTime = timeElapsed.toFixed(2); // Format to 2 decimal places
        timerDisplay.textContent = formattedTime; // Display final time
        recordTime(formattedTime); // Save the time
        startButton.textContent = 'Start (Spacebar)'; // Reset button text
        generateScramble(); // Generate a new scramble for the next solve
    }

    function updateTimer() {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - startTime) / 1000;
        timerDisplay.textContent = timeElapsed.toFixed(2); // Update display
    }

    function recordTime(time) {
        times.push(time); // Add new time to the array
        // Save the updated array to local storage
        localStorage.setItem('cubingTimes', JSON.stringify(times));
        renderTimes(); // Re-render the list of times
    }

    function renderTimes() {
        timesList.innerHTML = ''; // Clear the current list display
        times.forEach((time, index) => {
            const li = document.createElement('li');
            // Display time and a delete button
            li.innerHTML = `<span>${index + 1}. ${time}s</span>
                            <button onclick="deleteTime(${index})">X</button>`;
            timesList.appendChild(li);
        });
    }

    // Function to delete a specific time from the list
    // Made global (window.deleteTime) so it can be called directly from the HTML onclick attribute
    window.deleteTime = function(index) {
        times.splice(index, 1); // Remove 1 element at the given index
        localStorage.setItem('cubingTimes', JSON.stringify(times)); // Update local storage
        renderTimes(); // Re-render the list
    };

    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
        if (running) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    document.addEventListener('keydown', (e) => {
        // Only trigger on Spacebar press
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent default browser action (like scrolling)
            if (running) {
                stopTimer();
            } else {
                startTimer();
            }
        }
    });

    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all recorded times?')) {
            times = []; // Clear the times array
            localStorage.removeItem('cubingTimes'); // Remove from local storage
            renderTimes(); // Update the display (should now be empty)
        }
    });

    // --- Initial Setup ---
    generateScramble(); // Generate the first scramble when the page loads
    renderTimes();      // Display any previously recorded times
});