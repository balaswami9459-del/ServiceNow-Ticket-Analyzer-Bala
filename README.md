# ServiceNow Ticket Manager

A modern web application for managing ServiceNow incidents and tickets. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: View ticket statistics and breakdowns by status and priority
- **Ticket Management**: Browse, search, filter, and manage ServiceNow incidents
- **Create Tickets**: Create new incidents with detailed information
- **Edit & Update**: Modify ticket details, status, priority, and add work notes
- **Real-time Connection**: Direct integration with ServiceNow REST APIs
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

- Node.js 18+ and npm
- ServiceNow instance with REST API access
- ServiceNow user account with appropriate permissions

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd servicenow-ticket-manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

## Configuration

On first launch, you'll be prompted to enter your ServiceNow connection details:

- **Instance URL**: Your ServiceNow instance (e.g., `dev12345.service-now.com`)
- **Username**: Your ServiceNow username
- **Password**: Your ServiceNow password or API token

The application will test the connection and save your configuration for the session.

## Usage

### Dashboard
View a summary of all tickets with statistics on:
- Total tickets
- Open tickets (New, In Progress, On Hold)
- Resolved tickets
- Critical/High priority tickets
- Status and priority breakdowns

### Tickets List
- Browse all incidents with pagination
- Search by ticket number or description
- Filter by status and priority
- Sort by update date
- Quick navigation to ticket details

### Ticket Details
- View complete ticket information
- Edit ticket properties (status, priority, description)
- Add work notes
- View assignment and timeline information

### Create Ticket
- Create new incidents with required fields
- Set priority, urgency, and impact
- Assign categories and subcategories

## Required ServiceNow Permissions

Your ServiceNow user account needs the following access:
- Read access to the `incident` table
- Create access for creating new incidents
- Update access for modifying existing incidents

## API Endpoints Used

The application uses the following ServiceNow Table API endpoints:
- `GET /api/now/table/incident` - List incidents
- `GET /api/now/table/incident/{sys_id}` - Get incident details
- `POST /api/now/table/incident` - Create new incident
- `PATCH /api/now/table/incident/{sys_id}` - Update incident

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Troubleshooting

### Connection Issues

1. Verify your instance URL is correct
2. Check that your credentials are valid
3. Ensure your ServiceNow account has API access
4. Check for any network restrictions or firewalls

### CORS Errors

If you encounter CORS errors, ensure your ServiceNow instance allows cross-origin requests from your development server, or use a proxy configuration.

## License

MIT License

## Support

For issues or questions, please check the ServiceNow documentation or contact your ServiceNow administrator.
