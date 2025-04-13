# PodFlare - Podcast Marketing Agency Website

A modern, dark-mode website for PodFlare, a podcast marketing agency. The website features a sleek, futuristic design with purple color palette, animated elements, and a responsive layout.

## Features

- Modern dark-mode design with purple & neon green color scheme
- Responsive layout that works on mobile, tablet, and desktop
- Interactive video carousel with custom player controls
- Animated service cards with hover effects
- Interactive "How It Works" section
- FAQ accordion with smooth animations
- Mobile-ready navigation with hamburger menu

## Project Structure

```
PodFlare Website/
├── index.html
├── app/
│   ├── components/
│   │   └── app.js
│   └── styles/
│       └── main.css
├── public/
│   ├── images/
│   │   └── grid.svg
│   └── videos/
└── README.md
```

## Setup Instructions

1. Clone this repository
2. No build tools or dependencies are required as this is a static website
3. Open `index.html` in a web browser to view the site

For development:

- The website uses vanilla JavaScript without any frameworks
- All styles are in `app/styles/main.css`
- Interactive functionality is in `app/components/app.js`

## Placeholder Videos

The website includes a video carousel that currently uses placeholder videos. For development purposes, the JavaScript will generate colored rectangles if no real videos are available. 

To add real videos:
1. Place your .mp4 video files in the `public/videos/` directory
2. Update the video sources in `index.html`

## Browser Compatibility

The website is compatible with modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

- Fonts: Inter from Google Fonts
- Icons: Custom SVG icons 