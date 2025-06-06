# CereFlow - Global Stroke Resource Website

A modern, AI-powered global stroke resource website that helps users worldwide find stroke rehabilitation facilities, hospitals, exercises, and resources based on their location and needs.

## Features

- **Global Search Interface**: Intelligent search supporting international addresses
- **AI-Powered Processing**: LLM integration for location parsing and resource matching
- **International Coverage**: Real stroke facilities and resources worldwide
- **Emergency Information**: Country-specific emergency numbers and protocols
- **Responsive Design**: Mobile-first design with modern healthcare aesthetics
- **Accessibility**: WCAG AA compliant with high contrast and screen reader support

## Project Structure

```
cereflow/
├── index.html          # Main landing page
├── css/
│   └── styles.css      # All styling with medical theme
├── js/
│   ├── app.js          # Main application logic
│   ├── search.js       # Search form handling
│   └── data.js         # Real global facility data
├── assets/
│   └── images/         # Icons and images
└── README.md           # This file
```

## Design Theme

- **Color Palette**: Medical blues (#2563eb), soft purples (#8b5cf6), teal accents (#06b6d4)
- **Style**: Modern glassmorphism with clean healthcare aesthetics
- **Typography**: Accessible, scalable fonts
- **Layout**: CSS Grid and Flexbox for responsive design

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Styling**: Modern CSS with custom properties and animations
- **Data**: Real global stroke facility information
- **API Integration**: Placeholder points for LLM integration

## Setup Instructions

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. For development with live reload, use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```
4. Navigate to `http://localhost:8000`

## Real Data Sources

The website includes actual, researched stroke facilities:
- US: Mayo Clinic, Johns Hopkins, Cleveland Clinic, Mass General, UCSF
- UK: National Hospital for Neurology, Royal London Hospital
- Canada: Toronto Western, Vancouver General, Montreal Neurological
- Australia: Royal Melbourne, Royal Prince Alfred Hospital
- International telemedicine providers and stroke organizations

## Emergency Numbers by Country

- US: 911, Stroke Hotline: 1-888-4STROKE
- UK: 999, NHS 111
- Canada: 911, Heart & Stroke: 1-888-473-4636
- Australia: 000, StrokeLine: 1800 787 653
- Germany: 112
- France: 15 (SAMU)
- Japan: 119
- India: 102/108

## Deployment

Ready for deployment to:
- Netlify (drag and drop the project folder)
- GitHub Pages (upload to repository)
- Vercel (import from GitHub)
- Any static hosting service

## Important Disclaimers

- For informational purposes only - not medical advice
- Call emergency services immediately for medical emergencies
- Verify facility information before visiting
- Healthcare coverage and accessibility may vary by location

## Future LLM Integration

The codebase includes placeholder integration points for:
- Location parsing and understanding
- Intelligent resource matching
- Fallback recommendations for unsupported regions
- Multi-language query processing

## Accessibility Features

- High contrast color ratios (WCAG AA)
- Semantic HTML5 markup
- Keyboard navigation support
- Screen reader optimization
- Proper heading hierarchy
- Focus indicators

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When adding new facilities or updating information:
1. Verify all contact information is current
2. Include proper international phone formatting
3. Add appropriate country/region context
4. Test accessibility features
5. Maintain design consistency

---

**Emergency Notice**: If you are experiencing a medical emergency, call your local emergency number immediately. This website is for informational purposes only.# cereflow-frontend
