## CV-Tracker

CV-Tracker is a web application designed to help users track their job applications. It allows users to add, update, and delete job applications, as well as filter and sort them based on various criteria. The application is built using Next.js, TypeScript, and PostgreSQL.

## Features

- Add new job applications with details such as company name, position, date applied, notes, and job URL.
- Update the status of job applications (pending or archived).
- Delete job applications.
- Filter job applications by date range (today, last 7 days, last 30 days, this month, last month).
- Sort job applications by date applied, company name, or position.
- View pending and archived job applications separately.

## Dependencies

- Next.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- Date-fns
- Lucide-react
- Sonner
- Tailwind CSS
- Zod

## Installation

1. Clone the repository:

```bash
git clone https://github.com/KacperRebosz/CV-Tracker.git
cd CV-Tracker
```

2. Install the dependencies:

```bash
npm install
```

3. Set up the environment variables:

Create a `.env.local` file in the root directory and add the following variables:

```env
DATABASE_URL=your_database_url
```

4. Run the database migrations:

```bash
npm run migrate
```

## Usage

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

The database schema consists of a single table `applications` and an enum `application_status`.

### Table: applications

| Column       | Type                | Description                        |
|--------------|---------------------|------------------------------------|
| id           | serial              | Primary key                        |
| company_name | text                | Name of the company                |
| position     | text                | Position applied for               |
| date_applied | timestamp           | Date the application was submitted |
| notes        | text                | Additional notes                   |
| status       | application_status  | Status of the application          |
| url          | text                | URL of the job posting             |

## Deployment

To deploy the application, you can use platforms like Vercel or any other hosting provider that supports Next.js applications. Follow the platform-specific instructions for deployment.
