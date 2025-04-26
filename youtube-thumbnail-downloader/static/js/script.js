document.addEventListener('DOMContentLoaded', function() {
    // Single URL form elements
    const form = document.getElementById('thumbnail-form');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error-message');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const thumbnailUrlInput = document.getElementById('thumbnail-url');
    const downloadForm = document.getElementById('download-form');

    // Bulk upload form elements
    const bulkForm = document.getElementById('bulk-thumbnail-form');
    const bulkErrorDiv = document.getElementById('bulk-error-message');
    const bulkProgress = document.getElementById('bulk-progress');
    const progressBar = bulkProgress.querySelector('.progress-bar');

    // Extract YouTube video ID from URL
    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    // Get highest quality thumbnail URL
    async function getThumbnailUrl(videoId) {
        const resolutions = [
            'maxresdefault',
            'sddefault',
            'hqdefault',
            'mqdefault',
            'default'
        ];

        for (const resolution of resolutions) {
            const url = `https://img.youtube.com/vi/${videoId}/${resolution}.jpg`;
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) return url;
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    // Get video info from YouTube Data API
    async function getVideoInfo(videoId) {
        try {
            // Replace with your YouTube API key
            const apiKey = 'AIzaSyD9w18uWDa5gVrDWEp6pw8011pNHac3_nk';
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const snippet = data.items[0].snippet;
                return {
                    title: snippet.title,
                    channel: snippet.channelTitle
                };
            }
        } catch (e) {
            console.error('Error fetching video info:', e);
        }
        return { title: 'YouTube Video', channel: 'YouTube Channel' };
    }

    // Single URL form handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide previous results and errors
        resultDiv.classList.add('d-none');
        errorDiv.classList.add('d-none');

        const youtubeUrl = document.getElementById('youtube-url').value;

        try {
            const videoId = extractVideoId(youtubeUrl);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            const thumbnailUrl = await getThumbnailUrl(videoId);
            if (!thumbnailUrl) {
                throw new Error('Could not fetch thumbnail');
            }

            const videoInfo = await getVideoInfo(videoId);

            // Show thumbnail and update form values
            thumbnailPreview.src = thumbnailUrl;
            thumbnailUrlInput.value = thumbnailUrl;
            
            // Add hidden inputs for title and channel if they don't exist
            let titleInput = downloadForm.querySelector('input[name="title"]');
            let channelInput = downloadForm.querySelector('input[name="channel"]');
            
            if (!titleInput) {
                titleInput = document.createElement('input');
                titleInput.type = 'hidden';
                titleInput.name = 'title';
                downloadForm.appendChild(titleInput);
            }
            
            if (!channelInput) {
                channelInput = document.createElement('input');
                channelInput.type = 'hidden';
                channelInput.name = 'channel';
                downloadForm.appendChild(channelInput);
            }
            
            titleInput.value = videoInfo.title;
            channelInput.value = videoInfo.channel;
            
            // Set up download handler
            downloadForm.onsubmit = function(e) {
                e.preventDefault();
                downloadThumbnail(thumbnailUrl, videoInfo.title, videoInfo.channel);
            };
            
            resultDiv.classList.remove('d-none');
            
            // Show waitlist section
            document.getElementById('waitlist-section').classList.remove('d-none');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('d-none');
        }
    });

    // Download thumbnail with proper filename
    async function downloadThumbnail(url, title, channel) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const cleanTitle = title.replace(/[<>:"\/\\|?*]/g, '');
            const cleanChannel = channel.replace(/[<>:"\/\\|?*]/g, '');
            const filename = `${cleanChannel} - ${cleanTitle}.jpg`;
            
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } catch (e) {
            console.error('Error downloading thumbnail:', e);
            alert('Error downloading thumbnail');
        }
    }

    // Bulk upload form handler
    bulkForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide previous errors and show progress bar
        bulkErrorDiv.classList.add('d-none');
        bulkProgress.classList.remove('d-none');
        progressBar.style.width = '10%';
        progressBar.setAttribute('aria-valuenow', 10);

        const urls = document.getElementById('bulk-youtube-urls').value
            .split('\n')
            .map(url => url.trim())
            .filter(url => url);

        if (urls.length === 0) {
            bulkErrorDiv.textContent = 'No valid URLs provided';
            bulkErrorDiv.classList.remove('d-none');
            bulkProgress.classList.add('d-none');
            return;
        }

        try {
            // Create a JSZip instance
            const JSZip = window.JSZip;
            if (!JSZip) {
                throw new Error('JSZip library not loaded. Please include it in your HTML.');
            }
            
            const zip = new JSZip();
            
            // Download each thumbnail and add to zip
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const videoId = extractVideoId(url);
                if (!videoId) continue;
                
                const thumbnailUrl = await getThumbnailUrl(videoId);
                if (!thumbnailUrl) continue;
                
                const videoInfo = await getVideoInfo(videoId);
                
                // Update progress
                const progress = Math.round((i / urls.length) * 80) + 10;
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
                
                // Fetch image and add to zip
                const response = await fetch(thumbnailUrl);
                const blob = await response.blob();
                
                const cleanTitle = videoInfo.title.replace(/[<>:"\/\\|?*]/g, '');
                const cleanChannel = videoInfo.channel.replace(/[<>:"\/\\|?*]/g, '');
                const filename = `${cleanChannel} - ${cleanTitle}.jpg`;
                
                zip.file(filename, blob);
            }
            
            // Update progress
            progressBar.style.width = '90%';
            progressBar.setAttribute('aria-valuenow', 90);
            
            // Generate and download the zip
            const content = await zip.generateAsync({type: 'blob'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'youtube_thumbnails.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            // Complete progress
            progressBar.style.width = '100%';
            progressBar.setAttribute('aria-valuenow', 100);
            
            // Show waitlist section
            document.getElementById('waitlist-section').classList.remove('d-none');
            
            setTimeout(() => {
                bulkProgress.classList.add('d-none');
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', 0);
            }, 1000);
        } catch (error) {
            bulkErrorDiv.textContent = error.message;
            bulkErrorDiv.classList.remove('d-none');
            bulkProgress.classList.add('d-none');
        }
    });

    // Waitlist form handler
    const waitlistForm = document.getElementById('waitlist-form');
    waitlistForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]');
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Joining...';

            // For demo purposes, simulate a successful API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const success = true;

            if (!success) {
                throw new Error('Failed to join waitlist. Please try again.');
            }

            // Success feedback
            emailInput.value = '';
            submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Joined!';
            submitButton.classList.remove('btn-modern');
            submitButton.classList.add('btn-modern-success');

            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.classList.remove('btn-modern-success');
                submitButton.classList.add('btn-modern');
                submitButton.disabled = false;
            }, 3000);

        } catch (error) {
            submitButton.innerHTML = '<i class="bi bi-exclamation-circle"></i> Error';
            submitButton.classList.add('btn-modern-danger');

            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.classList.remove('btn-modern-danger');
                submitButton.disabled = false;
            }, 3000);
        }
    });
}); 