# Invitation System Documentation

## Overview

The invitation system allows project owners to invite users to their projects via email. Users receive an invitation link that they can click to accept the invitation and join the project.

**Key Feature:** Users can be invited even if they haven't registered yet. They will be prompted to create an account or log in when they click the invitation link.

## How It Works

### 1. Invitation Creation

When a project owner invites a user:

1. The system generates a unique invitation token
2. Creates an invitation record in the database with:
   - Token (unique identifier)
   - Project ID
   - Inviter ID
   - Invitee email
   - Status: "pending"
   - Expiration date (7 days from creation)
3. **Note:** The system does NOT check if the user exists in the database. Users can be invited even if they haven't registered yet.
4. Sends an email to the invitee with the invitation link
5. Returns the invitation link (for development purposes)

### 2. Invitation Acceptance

When a user clicks the invitation link:

1. The system validates the invitation token
2. Checks if the invitation is still pending and not expired
3. **If the user is already logged in:**
   - Adds the user to the project members
   - Updates invitation status to "accepted"
   - Redirects to the project board
4. **If the user is not logged in:**
   - Shows the invitation page with project details
   - Displays two options: "Create Account & Join Project" and "Already have an account? Sign in"
   - **"Create Account & Join Project"** redirects to `/invitations/[token]/register`
   - **"Already have an account? Sign in"** redirects to `/login?redirect=/invitations/[token]`

### 3. Registration Flow with Invitation

When a user clicks "Create Account & Join Project":

1. User is redirected to `/invitations/[token]/register`
2. The page loads invitation details and pre-fills the email field (read-only)
3. User only needs to enter:
   - Name
   - Password
4. After clicking "Create Account & Join Project":
   - User account is created with the invitation email
   - User is automatically logged in
   - Invitation is automatically accepted
   - User is redirected to the project board
5. **No manual invitation acceptance required** - it's all automatic!

### 4. Login Flow with Invitation

When a user clicks "Already have an account? Sign in":

1. User is redirected to `/login?redirect=/invitations/[token]`
2. User logs in with their existing account
3. After successful login, user is redirected back to the invitation page
4. User can then accept the invitation manually
5. User's email must match the invitee email for the invitation to be accepted

### 3. Invitation Status

Invitations can have the following statuses:

- `pending`: Invitation sent, waiting for acceptance
- `accepted`: User has accepted and joined the project
- `declined`: User has declined the invitation
- `expired`: Invitation has passed the 7-day expiration

## API Endpoints

### Create Invitation

```
POST /api/projects/[id]/invite
```

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "invitationLink": "http://localhost:3000/invitations/abc123...",
  "message": "Invitation sent successfully"
}
```

### Get Invitation Details

```
GET /api/invitations/[token]
```

**Response:**

```json
{
  "success": true,
  "invitation": {
    "projectName": "My Project",
    "inviterName": "John Doe",
    "inviterEmail": "john@example.com",
    "expiresAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### Accept Invitation

```
POST /api/invitations/[token]/accept
```

**Response:**

```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "projectId": "project-id-here"
}
```

### List User Invitations

```
GET /api/invitations
```

**Response:**

```json
{
  "success": true,
  "invitations": [...]
}
```

## Email Configuration

### Development Mode

In development, the invitation link is returned in the API response and logged to the console. No email is actually sent.

### Production Mode

To enable email sending in production, configure one of the following email services in your `.env` file:

#### Option 1: Mailjet (Recommended - Currently Configured)

```bash
MAIL_SENDER=your-email@gmail.com
MAIL_HOST=in-v3.mailjet.com
MAIL_PORT=587
MAIL_USER=your-mailjet-api-key
MAIL_PASSWORD=your-mailjet-api-secret
```

The application is already configured to use Mailjet API. Just add the environment variables above and emails will be sent automatically.

Get your API Key and Secret from: https://app.mailjet.com/account/api_keys

#### Option 2: SMTP (Nodemailer)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

Then install Nodemailer:

```bash
npm install nodemailer @types/nodemailer
```

And update `lib/email.ts` to use Nodemailer instead of Mailjet.

#### Option 3: SendGrid

```bash
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

Then install SendGrid:

```bash
npm install @sendgrid/mail
```

And update `lib/email.ts` to use SendGrid instead of Mailjet.

#### Option 4: AWS SES

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

Then install AWS SDK:

```bash
npm install @aws-sdk/client-ses
```

And update `lib/email.ts` to use AWS SES instead of Mailjet.

## Frontend Usage

### Invite User from Dashboard

```tsx
const handleInviteUser = async () => {
  const response = await fetch(`/api/projects/${projectId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email: inviteEmail }),
  });

  const result = await response.json();
  if (result.success) {
    console.log("Invitation Link:", result.invitationLink);
    // Show success message to user
  }
};
```

### Accept Invitation

The invitation page (`/invitations/[token]`) handles the acceptance flow automatically. Users just need to click the link.

## Security Features

1. **Unique Tokens**: Each invitation has a cryptographically secure random token
2. **Expiration**: Invitations expire after 7 days
3. **Owner Only**: Only project owners can create invitations
4. **Authentication Required**: Users must be logged in to accept invitations
5. **One-time Use**: Each invitation can only be accepted once
6. **Duplicate Prevention**: Cannot send multiple invitations to the same email for the same project
7. **Email Verification**: User's email must match the invitee email for the invitation to be accepted
8. **No User Existence Check**: Invitations can be sent to any email address, even if the user hasn't registered yet

## Database Schema

### Invitation Collection

```typescript
{
  token: string; // Unique invitation token
  projectId: ObjectId; // Reference to Project
  inviterId: ObjectId; // Reference to User who sent the invitation
  inviteeEmail: string; // Email of the invited user
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: Date; // Expiration date
  createdAt: Date; // Creation date
}
```

## Troubleshooting

### Invitation Link Not Working

1. Check that `NEXT_PUBLIC_APP_URL` is set correctly in `.env`
2. Verify the invitation token is valid in the database
3. Check if the invitation has expired

### Email Not Sending

1. Verify email service credentials in `.env`
2. Check email service provider's dashboard for any issues
3. Review server logs for error messages
4. Ensure email service package is installed
5. Check if Mailjet API key is valid and active

### User Cannot Accept Invitation

1. Verify user is logged in
2. Check if invitation is still pending
3. Confirm invitation hasn't expired
4. Verify user's email matches the invitee email
5. Ensure user has registered/logged in with the same email address that received the invitation

### Invitation Shows "User Not Found" Error

This is **normal and expected** behavior. The invitation system is designed to work as follows:

1. **Invitation Creation:** When you invite a user, the system does NOT check if the user exists in the database. It simply creates an invitation record and sends an email.

2. **User Registration:** The invited user should click "Create Account & Join Project" on the invitation page. This will:
   - Take them to a special registration page at `/invitations/[token]/register`
   - Pre-fill their email address (from the invitation)
   - Only require them to enter name and password
   - Automatically accept the invitation after registration

3. **Alternative Flow:** If the user already has an account, they can:
   - Click "Already have an account? Sign in"
   - Log in with their existing credentials
   - Accept the invitation manually

**Why this approach?**

- More user-friendly: You can invite anyone without requiring them to register first
- Natural flow: Similar to Slack, Asana, and other collaboration tools
- Better security: Users choose their own passwords instead of receiving random ones
- Seamless experience: Automatic invitation acceptance after registration

**What to do:**

1. Send the invitation email to the user
2. User clicks the invitation link
3. User clicks "Create Account & Join Project"
4. User enters name and password (email is pre-filled)
5. User is automatically added to the project after registration

## Future Enhancements

- Add invitation decline functionality
- Send reminder emails before expiration
- Add invitation history page
- Support for inviting multiple users at once
- Add invitation revocation by owner
- Add email preferences for users
