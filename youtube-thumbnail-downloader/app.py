import logging
import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, send_file, make_response
from urllib.parse import urlparse, parse_qs
import requests
from io import BytesIO
import re
from zipfile import ZipFile, ZIP_DEFLATED
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Log API key status
logging.info(f"YouTube API Key loaded: {os.environ.get('YOUTUBE_API_KEY') is not None}")

app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

def extract_video_id(url):
    """Extract the video ID from various forms of YouTube URLs."""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_thumbnail_url(video_id):
    """Get the highest resolution thumbnail URL for a video ID."""
    resolutions = [
        'maxresdefault',
        'sddefault',
        'hqdefault',
        'mqdefault',
        'default'
    ]

    for resolution in resolutions:
        url = f'https://img.youtube.com/vi/{video_id}/{resolution}.jpg'
        response = requests.head(url)
        if response.status_code == 200:
            return url
    return None

def get_video_info(video_id):
    """Get video metadata using YouTube Data API."""
    url = f'https://www.googleapis.com/youtube/v3/videos'
    params = {
        'part': 'snippet',
        'id': video_id,
        'key': os.environ.get('YOUTUBE_API_KEY')
    }

    try:
        logging.info(f"Fetching video info for ID: {video_id}")
        api_key = os.environ.get('YOUTUBE_API_KEY')
        if not api_key:
            logging.error("YouTube API key is missing!")
            return None
            
        response = requests.get(url, params=params)
        
        # Print the full URL being called (for debugging)
        logging.info(f"API URL: {response.url}")
        
        response.raise_for_status()
        data = response.json()
        
        if 'error' in data:
            logging.error(f"YouTube API Error: {data['error']}")
            return None

        if 'items' in data and len(data['items']) > 0:
            snippet = data['items'][0]['snippet']
            info = {
                'title': snippet['title'],
                'channel': snippet['channelTitle']
            }
            logging.info(f"Successfully got video info: {info}")
            return info
        else:
            logging.error("No items found in API response")
            logging.info(f"Full API response: {data}")
            
    except Exception as e:
        logging.error(f"Error fetching video info: {str(e)}")
    return None

@app.route('/', methods=['GET', 'OPTIONS'])
def home():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return render_template('index.html')

@app.route('/get-thumbnail', methods=['POST'])
def get_thumbnail():
    url = request.form.get('url', '')
    
    if not url:
        return jsonify({'error': 'Please enter a YouTube URL'}), 400
    
    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({'error': 'Invalid YouTube URL'}), 400
    
    thumbnail_url = get_thumbnail_url(video_id)
    if not thumbnail_url:
        return jsonify({'error': 'Could not fetch thumbnail'}), 400

    video_info = get_video_info(video_id)
    if not video_info:
        video_info = {'title': 'YouTube Video', 'channel': 'YouTube Channel'}
    
    return jsonify({
        'thumbnail_url': thumbnail_url,
        'video_title': video_info['title'],
        'channel_name': video_info['channel']
    })

@app.route('/bulk-download', methods=['POST'])
def bulk_download():
    try:
        urls = request.form.get('urls', '').strip().split('\n')
        urls = [url.strip() for url in urls if url.strip()]

        if not urls:
            return jsonify({'error': 'No valid URLs provided'}), 400

        memory_file = BytesIO()
        with ZipFile(memory_file, 'w', ZIP_DEFLATED) as zf:
            for i, url in enumerate(urls):
                video_id = extract_video_id(url)
                if not video_id:
                    continue

                thumbnail_url = get_thumbnail_url(video_id)
                if not thumbnail_url:
                    continue

                # Get video info for proper filename
                video_info = get_video_info(video_id)
                if not video_info:
                    video_info = {'title': f'Video_{i+1}', 'channel': 'YouTube'}

                try:
                    response = requests.get(thumbnail_url)
                    response.raise_for_status()
                    
                    # Clean filename by removing invalid characters
                    clean_title = re.sub(r'[<>:"/\\|?*]', '', video_info['title'])
                    clean_channel = re.sub(r'[<>:"/\\|?*]', '', video_info['channel'])
                    filename = f'{clean_channel} - {clean_title}.jpg'
                    
                    zf.writestr(filename, response.content)
                except Exception as e:
                    logging.error(f"Error downloading thumbnail for {url}: {e}")
                    continue

        memory_file.seek(0)
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name='youtube_thumbnails.zip'
        )

    except Exception as e:
        logging.error(f"Error in bulk download: {e}")
        return jsonify({'error': 'Error processing bulk download'}), 500

@app.route('/download-thumbnail', methods=['POST'])
def download_thumbnail():
    url = request.form.get('url')
    video_title = request.form.get('title', 'thumbnail')
    channel_name = request.form.get('channel', 'youtube')

    if not url:
        return 'No URL provided', 400

    try:
        response = requests.get(url)
        response.raise_for_status()

        # Clean filename by removing invalid characters
        clean_title = re.sub(r'[<>:"/\\|?*]', '', video_title)
        clean_channel = re.sub(r'[<>:"/\\|?*]', '', channel_name)
        filename = f'{clean_channel} - {clean_title}.jpg'

        return send_file(
            BytesIO(response.content),
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        logging.error(f"Error downloading thumbnail: {e}")
        return 'Error downloading thumbnail', 500

@app.route('/join-waitlist', methods=['POST'])
def join_waitlist():
    email = request.form.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Simple mockup response since we're ignoring Google Sheets integration
    try:
        # Just log the email instead of saving it
        logging.info(f"Would have added to waitlist: {email}")
        return jsonify({'message': 'Successfully joined waitlist'}), 200
    except Exception as e:
        logging.error(f"Error adding to waitlist: {e}")
        return jsonify({'error': 'Error joining waitlist'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 