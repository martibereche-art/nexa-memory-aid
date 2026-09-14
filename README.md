# NEXA: Your External Memory

You are an expert senior full-stack engineer, UI/UX designer, database architect, and product developer.



Build a complete, functional, polished web application called NEXA. This must be a real working application, NOT a landing page, static mockup, or fake demo.



NEXA is an external memory assistant for everyday life. Its Arabic tagline is:

"ذاكرتك خارج رأسك"

English tagline:

"Your memory, outside your head."



IMPORTANT DESIGN REFERENCE:

Use the attached image as the primary visual and UX inspiration. Recreate its design language: premium dark navy theme, elegant mobile-first interface, rounded cards, soft gradients, colorful feature cards, clean typography, modern icons, bottom mobile navigation, organized dashboard, and full Arabic RTL support. Do not simply copy the image; build a real application inspired by it.



TECHNICAL REQUIREMENTS:

- Responsive web app/PWA for mobile, tablet, and desktop.

- Mobile-first design, optimized for 375px, 390px, 768px, 1024px, and desktop.

- Use React + TypeScript + Vite + Tailwind CSS or another stable equivalent.

- Use a real database such as PostgreSQL with Prisma if suitable.

- Real CRUD operations and persistent data.

- Clean component architecture and maintainable code.

- No hardcoded fake functionality or placeholder buttons.

- No lorem ipsum.

- Protect user data and isolate each user's records.



AUTHENTICATION:

Implement:

- Continue as Guest mode.

- Create account with name, email, password, and confirmation.

- Login and logout.

- Secure password handling.

- User-specific data isolation.

- Authenticated data must persist after refresh and across sessions.

- Guest data may use local storage and should migrate to an account after registration if practical.

- Prepare architecture for future Google OAuth.



LANGUAGES:

Support Arabic, English, and French.

- Arabic must use complete RTL layout.

- English and French must use LTR.

- Use translation dictionaries/i18n, not hardcoded interface text.

- Save the selected language.

- Never translate the user's personal data automatically.

- Arabic should be the default language if appropriate.



MAIN APP STRUCTURE:

1. Welcome / onboarding screen

2. Dashboard

3. Saved Places — "أين وضعت هذا؟"

4. Take With Me / Packing — "ماذا آخذ معي غدًا؟"

5. Waiting For — "ما زلت أنتظر؟"

6. Shopping — "ماذا أشتري؟"

7. Forgotten Tasks — "ما المهام التي نسيتها؟"

8. Tomorrow Preparation

9. Global Search

10. Notifications and reminders

11. Profile

12. Settings

13. More section



WELCOME SCREEN:

Include NEXA logo, tagline, short explanation, Get Started, Continue as Guest, Login, Create Account, and language selector.



DASHBOARD:

Create a beautiful dashboard with:

- Greeting and user's name

- Current date

- Search bar

- Notification and profile icons

- Quick overview

- Colorful cards for the five main features

- Counts for pending items

- Upcoming reminders

- Tomorrow preparation summary

- Recent items

- Global Quick Add button

- Mobile bottom navigation and desktop sidebar/adaptive navigation



CORE FEATURE 1 — SAVED PLACES:

Allow users to save where they placed important things.

Fields:

- Item name

- Description

- Location

- Category

- Optional image

- Tags

- Favorite/important status

- Last updated date

Include search and examples such as car documents, passport, keys, folders, etc.



CORE FEATURE 2 — TAKE WITH ME / PACKING:

Create reusable lists for:

work, university, travel, doctor, gym, shopping, tomorrow, and custom lists.

Each list supports:

- Title

- Date

- Destination

- Checklist items

- Notes

- Completion status

- Edit, delete, duplicate, reuse, and reminders

Users must be able to check items off.



CORE FEATURE 3 — WAITING FOR:

Track things the user is waiting for:

- Title

- Person/company

- Description

- Category

- Start date

- Expected date

- Last follow-up

- Next reminder

- Priority

- Notes

Statuses:

Waiting, Follow-up Needed, Received, Cancelled.

Show how long the user has been waiting and overdue follow-ups.



CORE FEATURE 4 — SHOPPING:

Support multiple shopping lists and categories:

home, car, work, travel, personal, groceries, and custom.

Each item supports:

- Name

- Quantity

- Notes

- Priority

- Purchased status

- Repeated item option

Allow adding, editing, deleting, checking purchased items, clearing purchased items, and reusing lists.



CORE FEATURE 5 — FORGOTTEN TASKS:

A personal task system for small unfinished tasks.

Fields:

- Title

- Description

- Category

- Due date

- Reminder

- Priority

- Status

- Recurring option

- Notes

Statuses:

Pending, In Progress, Completed, Archived.



TOMORROW PREPARATION:

Create a smart page that combines:

- Things to take tomorrow

- Tasks due tomorrow

- Upcoming reminders

- Shopping needs

- Waiting follow-ups

- Personal notes

This page should feel useful for evening preparation.



GLOBAL FEATURES:

- Global Quick Add available from anywhere.

- Add saved item, task, shopping item, waiting item, packing item, or note.

- Global search across all user data.

- Notifications center.

- Reminders for tasks, follow-ups, packing lists, tomorrow preparation, and recurring items.

- Use real browser notifications only if genuinely supported; otherwise provide reliable in-app notifications.

- Favorites, archive, empty states, confirmation dialogs, loading states, error states, success toasts, and form validation.

- Optional borrowed/lent items feature if practical.



SETTINGS:

Include:

- Profile editing

- Language

- Theme: dark, light, system

- Notification preferences

- Account settings

- Data/export options if practical

- Logout

- About NEXA

- App version



DATABASE:

Create proper models/tables for users, preferences, saved items, packing lists, packing items, waiting items, shopping lists, shopping items, tasks, reminders, notifications, and categories as needed.



SECURITY:

- Secure authentication.

- Server-side authorization.

- Validate all forms and API inputs.

- Prevent users from accessing another user's data.

- Never expose secrets or credentials.

- Use environment variables.

- Prevent ID tampering and unsafe queries.



UX QUALITY:

The application must feel like a premium modern productivity product, not a generic task manager.

Use:

- Consistent design system

- Rounded cards

- Beautiful dark navy background

- Blue, green, orange, purple, pink, and cyan category colors

- Clear Arabic typography

- Accessible buttons and inputs

- Smooth but subtle transitions

- Excellent empty states

- Proper mobile spacing

- No clutter

- No broken navigation

- No dead buttons

- No fake data as the only functionality



IMPLEMENTATION PRIORITY:

First build the complete working foundation, routing, authentication, database, dashboard, and all five core CRUD features. Then implement localization, RTL/LTR, responsive design, reminders, settings, and visual polish.



Make reasonable technical decisions without asking unnecessary questions. If a feature is too large, implement a practical working MVP version rather than leaving it as a placeholder. Prioritize:

1. Working application

2. Data persistence

3. Authentication and security

4. All core features

5. Arabic RTL and multilingual support

6. Beautiful responsive UI

7. Stability and bug-free navigation



Before finishing, test the application carefully:

- Build must succeed without errors.

- All navigation must work.

- Guest mode must work.

- Registration/login/logout must work.

- CRUD operations must work.

- Data must persist.

- Arabic RTL, English LTR, and French must work.

- Mobile layout must be polished.

- Forms, empty states, loading states, errors, and notifications must work.

- No major console errors.

- Do not deliver only a visual prototype.



Start implementing the complete NEXA application now.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nexa-memory-aid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc889efa-3d0b-494d-9403-d6011818ab35).

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
