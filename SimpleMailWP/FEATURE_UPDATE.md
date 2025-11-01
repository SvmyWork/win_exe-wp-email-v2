# New Feature: Enhanced Recipient Table with Template System

## What Changed

The "Select Recipients" section on the send page has been replaced with a comprehensive table that includes:

### Table Columns:
1. **Checkbox** - Select recipients for bulk sending
2. **Name** - Recipient's full name
3. **Email/Phone** - Contact information (switches based on channel)
4. **Company** - Company name
5. **HR Name** - HR contact person
6. **Template** - Template name badge

### Interactive Features:

#### 1. Click Row to Load Template
- Click on any row in the table to automatically load that recipient's template
- The email title and content fields will be populated with personalized content
- Placeholders ({name}, {company}, {hrName}) are automatically replaced

#### 2. Template Personalization
When you create a template, use these placeholders:
- `{name}` - Gets replaced with recipient's name
- `{company}` - Gets replaced with company name
- `{hrName}` - Gets replaced with HR contact name

**Example Template:**
```
Title: Welcome to {company}

Content:
Dear {name},

We are excited to have you join {company}. 
Please contact {hrName} for onboarding details.

Best regards
```

**After clicking the row:**
```
Title: Welcome to Tech Corp

Content:
Dear John Doe,

We are excited to have you join Tech Corp. 
Please contact Sarah Johnson for onboarding details.

Best regards
```

#### 3. Visual Feedback
- Clicked row highlights in purple
- Template load notification appears in logs
- Character count updates automatically

### Updated Add/Edit Recipient Form

The recipient management modal now includes these new fields:
- Company Name
- HR Name
- Template Name
- Email Title
- Email Content (with placeholder support)

All fields support the placeholder system for dynamic personalization.

## How to Use

1. **Login** and navigate to the dashboard
2. **Choose Email or WhatsApp** channel
3. **View the recipient table** with all details
4. **Click any row** to load its template into the message fields
5. **Select recipients** using checkboxes
6. **Click Send** to deliver messages

The selected row's template will be used as the default, but you can edit it before sending!
