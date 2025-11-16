# MessagingHub - Email & WhatsApp Messaging App

## Overview
A modern, interactive UI prototype for sending email and WhatsApp messages. Built with pure HTML, Tailwind CSS, and vanilla JavaScript with no backend dependencies.

## Features
- **Login System**: Simple authentication with local storage
- **Dashboard**: Channel selection for Email or WhatsApp
- **Recipients Management**: Interactive table with search, filter, and sort capabilities
- **Message Sending**: Compose and send messages with real-time log simulation
- **Settings Panel**: Configure email and WhatsApp settings
- **Real-time Logs**: Visual feedback during message sending process
- **Responsive Design**: Modern UI with smooth animations

## Tech Stack
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Local Storage for data persistence

## File Structure
- `index.html` - Login page
- `dashboard.html` - Main dashboard with channel selection
- `send.html` - Message composition and sending interface
- `recipients.html` - Contact management table
- `settings.html` - Configuration panel
- `js/` - JavaScript files for each page

## Current State
UI prototype complete with all interactive features. Data is stored locally in browser storage. Ready for API integration in future phases.

## Recent Changes
- **Latest Update** (October 27, 2025): Professional theme redesign
  - Changed from purple gradient theme to simple, professional blue and gray
  - Removed colorful gradients in favor of clean, solid colors
  - Updated navigation bars with minimal white design
  - Changed all accent colors to professional blue (#2563EB)
  - Simplified buttons and cards with subtle borders and shadows
  - Created business-appropriate, modern look
- Enhanced recipient table with template system (October 27, 2025)
  - Replaced checkbox list with comprehensive table view
  - Added columns: Name, Email/Phone, Company, HR Name, Template
  - Click row to load template into message fields
  - Template personalization with {name}, {company}, {hrName} placeholders
  - Updated add/edit forms to include all new fields
- Initial project setup (October 27, 2025)
- Created all HTML pages with modern design
- Implemented JavaScript functionality for all features
- Added local storage for data persistence
- Security fix: API keys not stored in localStorage
