document.addEventListener('DOMContentLoaded', () => {
    let summaries = []; // This will hold the full data from the server

    // --- DOM Elements ---
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const summaryContainer = document.getElementById('summary-container');

    // --- VIEW: Function to render summaries with "Read More" feature ---
    function renderSummaries(summariesToRender) {
        summaryContainer.innerHTML = ''; // Clear existing summaries

        if (summariesToRender.length === 0) {
            summaryContainer.innerHTML = '<div class="card"><p>No summaries found matching your criteria.</p></div>';
            return;
        }

        summariesToRender.forEach(summary => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const title = document.createElement('h3');
            title.textContent = summary.title;

            const date = document.createElement('p');
            date.innerHTML = `<strong>Date:</strong> ${new Date(summary.date).toLocaleDateString()}`;

            const topic = document.createElement('p');
            topic.innerHTML = `<strong>Topic:</strong> ${summary.topic}`;
            
            const content = document.createElement('p');
            content.className = 'summary-content';

            const readMoreLink = document.createElement('a');
            readMoreLink.href = '#';
            readMoreLink.className = 'read-more';
            readMoreLink.textContent = 'Read More';

            // Check if the summary is long enough to need a "Read More" link
            if (summary.content.length > 200) {
                content.textContent = summary.content.substring(0, 200) + '...';
                readMoreLink.style.display = 'block'; // Make it visible
            } else {
                content.textContent = summary.content;
                readMoreLink.style.display = 'none'; // Hide if not needed
            }

            // Event listener to expand the text
            readMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                content.textContent = summary.content; // Show full content
                e.target.style.display = 'none'; // Hide the "Read More" link
            });

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(topic);
            card.appendChild(content);
            card.appendChild(readMoreLink);

            summaryContainer.appendChild(card);
        });
    }

    // --- CONTROLLER: Function to filter, sort, and update the display ---
    function updateDisplay() {
        let filteredSummaries = [...summaries];

        // Apply Search Filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredSummaries = filteredSummaries.filter(s =>
                s.title.toLowerCase().includes(searchTerm) ||
                s.topic.toLowerCase().includes(searchTerm) ||
                s.content.toLowerCase().includes(searchTerm)
            );
        }

        // Apply Sort
        const sortValue = sortSelect.value;
        filteredSummaries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortValue === 'asc' ? dateA - dateB : dateB - dateA;
        });

        renderSummaries(filteredSummaries);
    }
    
    // --- Event Listeners ---
    searchInput.addEventListener('input', updateDisplay);
    sortSelect.addEventListener('change', updateDisplay);

    // --- Initial Data Fetch ---
    function fetchAndRenderSummaries() {
        summaryContainer.innerHTML = '<div class="card"><p>Loading summaries...</p></div>';
        fetch('/api/summaries')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                summaries = data;
                updateDisplay();
            })
            .catch(err => {
                console.error("Failed to fetch summaries:", err);
                summaryContainer.innerHTML = '<div class="card"><p style="color: #f87171;">Could not load summaries. Please check the server.</p></div>';
            });
    }

    // Hide date fields by default as they are not fully implemented in this version
    document.querySelectorAll('#dateField').forEach(el => el.classList.add('hidden'));

    fetchAndRenderSummaries();
});