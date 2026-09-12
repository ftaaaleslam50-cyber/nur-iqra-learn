# أكاديمية الفردوس

Build a modern, responsive Arabic Learning Management System (LMS) for a private Islamic academy.

The platform is private. Users CANNOT register themselves. Only the administrator can create, edit, or delete student accounts from the admin panel.

The website should have two roles:

1. Student

2. Administrator

========================

STUDENT FEATURES

========================

Create a beautiful student dashboard displaying:

- Student name

- Profile photo

- Current course

- Attendance percentage

- Number of absences

- Progress percentage

- Reward points

- Certificates earned

- Quiz results

- Latest announcements

Create a Lessons page:

- Lessons organized by course

- Each lesson contains:

  - Embedded YouTube video

  - Lesson description

  - Downloadable attachments

Create a Transcripts page:

- Written transcript for every lesson

- Download PDF or DOC files

Create a Schedule page:

- Weekly schedule

- Lesson dates

- Exam dates

- Upcoming academy events

Create a Quizzes page:

- Online quizzes

- Multiple choice questions

- Timer support

- Automatic grading

- Student score

Create an Announcements page:

- Latest academy announcements

- Important notices

- Upcoming activities

Create a Profile page:

- Personal information

- Change password

========================

ADMIN PANEL

========================

Administrator can:

- Create student accounts

- Edit student accounts

- Delete student accounts

Manage:

- Courses

- Lessons

- YouTube video links

- Lesson attachments

- Transcripts

- Schedule

- Quizzes

- Attendance

- Student points

- Certificates

- Announcements

Dashboard should include statistics:

- Total students

- Attendance rate

- Number of lessons

- Number of quizzes

- Recent activity

========================

DESIGN

========================

- Arabic RTL layout

- Clean and modern UI

- Green and white color palette

- Responsive for desktop, tablet, and mobile

- Professional dashboard

- Smooth animations

- Beautiful cards

- Sidebar navigation

- Dark mode support

========================

TECHNICAL

========================

Use React + TypeScript + Tailwind CSS.

Structure the project cleanly with reusable components.

Prepare the project so it can later connect easily to Google Apps Script as the backend and Google Sheets as the database.

Do NOT implement public registration. Authentication is only for administrator-created accounts.

Generate production-quality code.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nur-iqra-learn.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e44c3dc-a15b-49cf-a0ee-31cca4d51bbd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
