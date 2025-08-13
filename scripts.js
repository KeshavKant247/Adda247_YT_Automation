document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('live-broadcast-form');
    const responseMessageDiv = document.getElementById('response-message');
    const submitButton = document.getElementById('submit-btn');

    const channelSelect = document.getElementById('channel');
    const playlistSelect = document.getElementById('playlist');

    // ⚠️ IMPORTANT: Replace this with the URL for your n8n webhook that gets playlists.
    // const playlistApiUrl = 'https://keshavkant.app.n8n.cloud/webhook-test/0ef4a506-8d8e-46a4-93a1-279cf339f2f7';
    const playlistApiUrl = 'https://keshavkant.app.n8n.cloud/webhook/0ef4a506-8d8e-46a4-93a1-279cf339f2f7';

    // Fetch playlists dynamically when a channel is selected
    channelSelect.addEventListener('change', async (event) => {
        const channelId = event.target.value;
        if (!channelId) {
            return;
        }

        playlistSelect.innerHTML = '<option value="" disabled selected>Loading Playlists...</option>';
        playlistSelect.disabled = true;

        try {
            const response = await fetch(`${playlistApiUrl}?channelId=${channelId}`);
            if (response.ok) {
                const playlists = await response.json();
                
                playlistSelect.innerHTML = '<option value="" disabled selected>Select a Playlist</option>';

                if (playlists.length > 0) {
                    playlists.forEach(playlist => {
                        const option = document.createElement('option');
                        option.value = playlist.id;
                        option.textContent = playlist.snippet.title; // Correctly access the title
                        playlistSelect.appendChild(option);
                    });
                    playlistSelect.disabled = false;
                } else {
                    playlistSelect.innerHTML = '<option value="" disabled selected>No playlists found</option>';
                }
            } else {
                console.error('Failed to fetch playlists:', response.status);
                playlistSelect.innerHTML = '<option value="" disabled selected>Error loading playlists</option>';
            }
        } catch (error) {
            console.error('An error occurred while fetching playlists:', error);
            playlistSelect.innerHTML = '<option value="" disabled selected>Error loading playlists</option>';
        }
    });

    // Form submission logic
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // ⚠️ IMPORTANT: This is the URL for your MAIN n8n workflow that handles the live stream creation (a POST request).
        const webhookUrl = 'https://keshavkant.app.n8n.cloud/webhook/31dc98d7-0876-40a9-8bda-a5753713963a';

        submitButton.disabled = true;
        submitButton.textContent = 'Scheduling...';
        responseMessageDiv.style.display = 'none';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                responseMessageDiv.textContent = '✅ Live broadcast scheduled successfully!';
                responseMessageDiv.className = 'success';
                responseMessageDiv.style.display = 'block';
                form.reset();
            } else {
                const errorText = await response.text();
                responseMessageDiv.textContent = `❌ Error: ${response.status} - ${errorText}`;
                responseMessageDiv.className = 'error';
                responseMessageDiv.style.display = 'block';
            }

        } catch (error) {
            responseMessageDiv.textContent = `❌ An unexpected error occurred: ${error.message}`;
            responseMessageDiv.className = 'error';
            responseMessageDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Schedule Live';
        }
    });
});