# MessagingHub - Email & WhatsApp Messaging App

A modern, interactive messaging application UI built with pure HTML, Tailwind CSS, and vanilla JavaScript.

## Features

### 🔐 Login System
- Simple username/password authentication
- Session management with local storage
- Remember me functionality

### 📊 Dashboard
- Beautiful gradient design
- Choose between Email or WhatsApp channels
- Real-time statistics display
- Activity counters

### 📧 Message Sending
- **Recipient Table View** - See all recipient details at a glance
  - Name, Email/Phone, Company, HR Name, Template
  - Click any row to load their template
- **Template System** - Personalized messages with placeholders
  - Use {name}, {company}, {hrName} for auto-replacement
  - Templates auto-populate when clicking recipients
- Select multiple recipients with checkboxes
- Real-time sending logs with color-coded status
- Progress tracking with percentage bar
- Simulated message delivery with configurable delays

### 👥 Recipients Management
- Interactive data table with sorting
- Search and filter functionality
- Add, edit, and delete contacts
- Comprehensive contact details (company, HR name)
- Custom templates per recipient
- Email title and content templates with placeholders
- Status management (Active/Inactive)
- Bulk selection
- Beautiful modal for adding new recipients with all fields

### ⚙️ Settings Panel
- **Email Configuration**
  - Sender email address
  - Sender name
  - Reply-to email
  - Email tracking toggle

- **WhatsApp Configuration**
  - Business phone number
  - Business name
  - API key management
  - Read receipts toggle

- **General Settings**
  - Message delay configuration
  - Auto-save drafts
  - Browser notifications

## How to Use

1. **Login**
   - Enter any username and password
   - Click "Sign In"

2. **Select Channel**
   - Choose between Email or WhatsApp on the dashboard

3. **Manage Recipients**
   - Click "Manage Recipients" to view/add/edit contacts
   - Add detailed recipient information including company, HR name, and templates
   - Create custom email templates with placeholders ({name}, {company}, {hrName})
   - Use the search bar to find specific recipients
   - Filter by status (Active/Inactive)
   - Sort columns by clicking headers

4. **Send Messages**
   - View recipients in a detailed table with company, HR name, and template info
   - Click any row to load that recipient's template into the message fields
   - Templates automatically personalize with recipient data
   - Select multiple recipients with checkboxes
   - Click "Send Messages" to start
   - Watch real-time logs as messages are sent

5. **Configure Settings**
   - Click the Settings button
   - Configure email and WhatsApp settings
   - Adjust message delay and preferences
   - Save your settings

## Technical Details

### Built With
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)** - Vanilla JavaScript for all functionality
- **Font Awesome** - Icons
- **Local Storage API** - Data persistence
- **Professional Theme** - Simple blue and gray color scheme for business use

### File Structure
```
├── index.html           # Login page
├── dashboard.html       # Main dashboard
├── send.html           # Message sending interface
├── recipients.html     # Recipients management
├── settings.html       # Settings panel
├── js/
│   ├── login.js        # Login functionality
│   ├── dashboard.js    # Dashboard logic
│   ├── send.js         # Message sending with logs
│   ├── recipients.js   # Table management
│   └── settings.js     # Settings management
└── README.md
```

### Data Storage
All data is stored in browser's `localStorage`:
- `isLoggedIn` - Login status
- `username` - Current user
- `selectedChannel` - Email or WhatsApp
- `recipients` - Contact list
- `settings` - User preferences (excluding sensitive API keys)

**Security Note:** API keys and sensitive credentials are NOT stored in localStorage for security reasons. The application displays a warning when users attempt to save API keys. In a production environment, such credentials would be managed securely on the server side.

### Features Showcase

#### Real-time Logging
- Messages appear as they're being sent
- Color-coded status (info, success, error)
- Timestamps for each action
- Progress bar showing completion percentage

#### Interactive Table
- Sort by name, email, or phone
- Real-time search filtering
- Status filtering
- Row selection with checkboxes
- Edit and delete actions

#### Responsive Design
- Works on desktop, tablet, and mobile
- Smooth animations and transitions
- Clean, professional design with blue accents
- Subtle hover effects and interactive elements
- Business-appropriate color scheme

## Future Enhancements
- Real API integration for email sending (EmailJS, SendGrid, etc.)
- WhatsApp Business API integration
- Backend database for multi-device sync
- Message templates library
- Scheduled message sending
- Analytics and reporting
- Export recipient lists
- Import contacts from CSV

## Notes
- This is a UI prototype - no actual emails or WhatsApp messages are sent
- All functionality is simulated for demonstration purposes
- Data persists only in browser's local storage
- **Security:** Sensitive API keys are not stored client-side for security reasons
- Perfect for testing UI/UX before backend integration

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with JavaScript enabled

---

**Created with ❤️ using HTML, Tailwind CSS, and JavaScript**
