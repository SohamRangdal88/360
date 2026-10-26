# Faculty 360

Faculty profile management for a college or department, built on MongoDB, Express, React and Node.

The first module is the **Faculty Profile Builder**: twelve sections a faculty member fills in
once and maintains over time. College and department administration read the same records later
through their own dashboards.

---

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | 18 or newer |
| MongoDB | 6 or newer, running locally or a MongoDB Atlas URI |
| npm | 9 or newer |

---

## Setup

Two terminals. API first.

**1. API**

```bash
cd server
npm install
cp .env.example .env      # edit MONGO_URI if you are not on localhost
npm run seed              # loads one sample faculty record
npm run dev               # http://localhost:5000
```

**2. Client**

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite proxies `/api` and `/uploads` to port 5000, so no CORS setup is needed in development.

Check the API is alive at `http://localhost:5000/api/health`.

### Running both at once

From the project root:

```bash
npm install
npm run dev
```

### Production build

```bash
cd client && npm run build          # writes client/dist
cd ../server && NODE_ENV=production npm start
```

In production the Express server serves `client/dist` itself, so the whole app runs on one port.

---

## Project structure

```
faculty360/
├── server/
│   ├── server.js                  Express entry point
│   ├── config/db.js               Mongo connection
│   ├── models/Faculty.js          one schema, all twelve sections
│   ├── controllers/
│   │   └── facultyController.js   CRUD, submit, exports
│   ├── routes/
│   │   ├── facultyRoutes.js
│   │   └── uploadRoutes.js
│   ├── middleware/
│   │   ├── upload.js              multer, 8 MB, JPG/PNG/PDF
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── completion.js          server side percentage
│   │   ├── exportBuilders.js      printable HTML and CSV
│   │   └── seed.js                sample record
│   └── uploads/                   stored certificates and photos
│
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                state, autosave, navigation, downloads
        ├── api/facultyApi.js
        ├── components/
        │   ├── Fields.jsx         every input type
        │   ├── RecordList.jsx     repeatable cards
        │   ├── Chrome.jsx         header, tabs, modal, toast, downloads
        │   └── ReviewPanel.jsx    review sheet and submitted screen
        ├── sections/
        │   ├── SectionsIdentity.jsx     1, 2, 3
        │   ├── SectionsExperience.jsx   4, 5, 6
        │   ├── SectionsResearch.jsx     7, 8, 9
        │   └── SectionsFunding.jsx      10, 11, 12
        ├── data/
        │   ├── constants.js       dropdown lists, section metadata
        │   └── blank.js           empty profile and record factories
        ├── utils/
        │   ├── helpers.js         age, duration, currency, dates
        │   ├── completion.js      completion scoring
        │   ├── validate.js        per section rules
        │   └── download.js        JSON, CSV, HTML, print
        └── styles/
            ├── base.css           tokens, reset, buttons
            ├── layout.css         header, tabs, shell, action bar
            ├── forms.css          grid, inputs, tags, uploads
            └── components.css     cards, modal, toast, print
```

---

## Data shape

Sections with a single value are stored as objects. Sections that can repeat are stored as arrays.

```js
{
  facultyId: 'FAC-2011-0342',
  status: 'draft',            // draft | submitted | approved | returned
  completion: 74,             // recalculated by the server on every save

  personalDetails: {},
  contactDetails: {},
  qualifications: {},         // holds ug, pg and phd objects
  professionalDetails: {},

  industryTrainings: [],
  programs: [],
  publications: [],
  patents: [],
  awards: [],
  financialSupport: [],
  projects: [],
  nptelCourses: [],
  otherCourses: [],

  notApplicable: {}           // sections the faculty marked as having nothing to report
}
```

---

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | liveness check |
| GET | `/api/faculty` | list profiles, filter by `?department=` and `?status=` |
| GET | `/api/faculty/:facultyId` | fetch a profile, creating an empty draft if none exists |
| PUT | `/api/faculty/:facultyId` | save the whole draft |
| PATCH | `/api/faculty/:facultyId/section/:section` | save one section |
| POST | `/api/faculty/:facultyId/submit` | submit and issue a reference number |
| POST | `/api/faculty/:facultyId/reopen` | return a submitted profile to draft |
| POST | `/api/faculty/:facultyId/approve` | approve a submitted profile |
| POST | `/api/faculty/:facultyId/return` | return a submitted profile for updates |
| GET | `/api/faculty/:facultyId/export/json` | download the profile as JSON |
| GET | `/api/faculty/:facultyId/export/html` | printable sheet, add `?download=1` to save it |
| GET | `/api/faculty/:facultyId/export/csv` | every field as a spreadsheet row |
| POST | `/api/uploads` | upload one file, form field name `file` |
| DELETE | `/api/uploads/:filename` | remove an uploaded file |

---

## Downloading a profile

The **Download profile** button in the header works at any time, including before a draft has
ever reached the server. It builds the file from what is on screen.

| Format | What you get |
| --- | --- |
| PDF | a print ready sheet opens in a new tab, choose Save as PDF in the print dialogue |
| `.html` | the same sheet as a file you can open offline or email |
| `.csv` | every field as a row, opens in Excel or Google Sheets |
| `.json` | complete structured backup for importing elsewhere |

Every format covers all twelve sections, including records that are not finished yet.
The API serves the same three file formats for the administration side.

## Administration workspace

The login screen includes a **Demo Admin Workspace** entry point. The administration workspace
shows all faculty profiles with search, status filters, completion metrics, and a detail drawer.
Administrators can open a printable report, approve submitted profiles, or return them for updates.
For local/demo use, signing in with `admin@college.edu.in` also opens the administration workspace.

This first version uses the existing email-only demo access. Production deployments should place
these administration routes behind the application's role-based authentication middleware before
exposing them outside a trusted environment.

## Clearing demo data and administrator accounts

The repository no longer needs a seeded faculty record for normal operation. To remove all
existing faculty data from the configured MongoDB database, run:

```bash
cd server
npm run clear-data
```

The local administrator directory is in `server/config/admins.js`. The main administrator
(`admin@college.edu.in`) can see every department. Department administrators are restricted to
their configured department (the sample entry is `cse.admin@college.edu.in`).

---

## How the form behaves

- **Autosave.** Changes save 1.2 seconds after you stop typing. A copy also goes to
  `localStorage`, so if the API is unreachable the header shows "Saved on this device only"
  and nothing is lost.
- **Completion.** Each section scores against its own required fields, and the twelve scores
  are averaged. The client and the server use the same rules, so the bar never jumps after a save.
- **Nothing to report.** Every repeatable section has a checkbox for faculty with no patents or
  no financial support, so an honest profile can still reach 100 percent. The checkbox locks
  itself once records exist.
- **Validation** runs on Save and continue, never on Save draft. Failures expand the offending
  record card. Cross field rules cover end before start, PG before UG, grant before publication,
  and an emergency number identical to the faculty member's own.
- **Controlled inputs.** Years are dropdowns from 1950, extended to the current year plus ten
  for expected PhD completion. Publication dates use a month and year pair. Durations use two
  date pickers with the span calculated for you.
- **Automatic fields.** Age from date of birth, award year from the award date, project duration
  from its two dates. All read only.

---

## Configuration

`server/.env`

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/faculty360
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env` is optional. Set `VITE_API_URL` only if the API is not behind the Vite proxy.

---

## Next steps

- Authentication. `FACULTY_ID` is currently a constant at the top of `client/src/App.jsx`.
  Replace that one line with the logged in user's ID once auth is in place.
- Department and college dashboards. `GET /api/faculty` already returns the list with
  completion percentages and can filter by department and status.
- Review workflow. The schema carries `approved` and `returned` statuses that no screen uses yet.
