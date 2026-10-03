# FLEX Student Portal Demo

An Expo / React Native academic portal prototype inspired by FLEX. It uses simple React Native components and fictional in-app academic records. It does not connect to the university or a remote database.

## Features

- **Sign in:** the shared login form routes username/password `admin` / `admin` to the Admin Panel; valid student roll-number credentials open the student portal. Student accounts are not listed on the login screen.
- **Home:** student summary, personal/contact details, editable phone number, attendance and marks summaries, quick links, and tasks that can be marked done or open.
- **Attendance:** attendance percentage per registered course. Selecting a course opens its attendance percentage and class-by-class records.
- **Marks:** course marks with assessment sections and weighted absolutes. A course detail shows raw scores, absolutes earned and lost, attendance, and class records. Earned marks below 50% are highlighted in red.
- **Course registration:** register or drop catalog courses during the current session.
- **Fee details:** tuition, amount paid, balance, challan details, and payment history.
- **Course feedback:** five Yes/No course questions and a description, stored per course during the current session.
- **Retake exam request:** select a registered course and submit a specific reason. Submission displays a reminder to visit the concerned academic office.
- **Transcript:** SGPA, CGPA, and grades by semester.
- **Tentative study plan:** an eight-semester course roadmap with course codes, names, credit hours, and course types.
- **Study tasks:** add tasks for a course and mark them done or open.
- **Admin panel:** view the local student roster, student profiles, fee balances, course attendance, marks, and transcript grades. Admin controls can add dated attendance records, update existing assessment scores, and add or update a course grade.

The interface is responsive across desktop and phone widths. On phones, the login screen uses a compact Flex welcome header, a full-width sign-in form, and a scrollable layout that remains usable with the on-screen keyboard. Portal content, cards, admin controls, and tables use tighter spacing and wrapping on narrow screens. Navigation uses a horizontal `FlatList`; course, semester, and task lists use `FlatList` where appropriate. The app uses basic React Native views, text, inputs, and pressables. `useState` manages edits and selections; `useEffect` synchronizes values when the selected student or course changes.

### Mark weighting

Default course weights total 100 absolutes: quizzes contribute 5 across five quizzes (1 each), assignments contribute 5, two sessionals contribute 30 (15 each), a project contributes 20 when included, and the final exam uses the remaining default weight (40 when a project is included, 60 otherwise). Admins can add any number of quizzes and assignments; the section's total weight is redistributed evenly across them. There are exactly two sessionals and one final exam. A project is optional. Admins can change each present section's total weight from 0 to 100; section weights are divided evenly between its assessments, and the combined course weight cannot exceed 100. Each assessment shows its raw score and weighted absolutes earned and lost.

### Input checks

- Sign in requires both fields and reports incorrect credentials without revealing which value failed.
- Phone numbers allow common formatting characters and require 7–15 digits.
- Feedback requires answers to all five questions and a description of at least 10 characters.
- Retake requests require a selected course and a reason of at least 15 characters; the input is capped at 1,000 characters.
- Study task titles must contain at least four non-space characters and are capped at 120 characters.
- Admin attendance dates must be real dates in the current calendar year, cannot be later than today, and must use `DD-MMM-YYYY` or `YYYY-MM-DD` format.
- Admin assessment scores must be numeric and within the selected assessment's range.
- Admin section weights must be numeric, from 0 to 100, and keep the full course at or below 100 absolutes.
- New quizzes and assignments require a unique name and a numeric score within the assessment maximum.
- Admin grades are limited to supported grade values (for example `A`, `B+`, `C-`, `F`, or `I`) and require a semester like `Fall 2026`.

## Run with Expo

Requires Node.js for Expo SDK 57.

```bash
npm install
npx expo install --fix
npx expo start
```

Scan the QR code with Expo Go, choose an available simulator, or press `w` for the web preview. To create a web bundle, run `npx expo export --platform web`.

If Metro reports a stale entry-point resolution error after files have changed, stop the server and restart it with `npx expo start -c` to clear its cache.

## Project structure

- `App.js` — login state, navigation, session data, and screen selection.
- `src/data/flexData.js` — fictional student records, course catalog, and tentative study plan.
- `src/services/portalService.js` — attendance and marks calculations and record updates.
- `src/components/PortalUI.js` — reusable portal components and theme colors.
- `src/screens/` — login, student screens, and the admin panel.
- `assets/flex-logo.png` — supplied FLEX Academic Portal logo.
- `AI_USAGE_REPORT.md` — AI assistance disclosure.

Edit student accounts and sample academic records in `src/data/flexData.js`. Student account names and passwords are not shown on the sign-in screen. Phone, registration, feedback, task, retake, and admin changes live in app memory for the current session and reset when the app restarts. This is an educational demo: the fixed `admin` / `admin` credentials are not production-grade security. Do not put real student data or production credentials in this prototype.

## Project video and AI usage documents

- [Watch the project video](https://drive.google.com/file/d/1kov8WINWnv4lIQXkelt3Ytfhy0JRIuQy/view?usp=sharing)
- [AI Usage Report (Word document)](AI%20Usage%20Report.docx)

The AI usage report is included in the project directory for submission. The project video is hosted on Google Drive.

## Sample data note

The named student profiles were included for this requested demo. Other profile details and academic values are sample data. All data remains local; the app makes no connection to `flex.nu.edu.pk`.
