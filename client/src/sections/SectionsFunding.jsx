import React from 'react';
import {
  TextInput, SelectInput, DateInput, YearSelect, MoneyInput, RadioGroup, ProofInput
} from '../components/Fields';
import { RecordList } from '../components/RecordList';
import { PROJECT_TYPES, PROJECT_STATUSES, EDUCATION_YEARS, NPTEL_RESULTS, NPTEL_DURATION_WEEKS } from '../data/constants';
import { duration, formatRupees } from '../utils/helpers';

/* ---------------------------------------- 10. Financial support */

export function FinancialSupportSection({ ctx }) {
  return (
    <RecordList
      title="Financial Support"
      listKey="financialSupport"
      records={ctx.p.financialSupport}
      ctx={ctx}
      labelFn={(r) => r.event}
    >
      {(r, i) => (
        <>
          <YearSelect label="Year" value={r.year} onChange={(v) => ctx.setRecord('financialSupport', i, 'year', v)} />
          <TextInput label="Event / Activity" required value={r.event} onChange={(v) => ctx.setRecord('financialSupport', i, 'event', v)} span={8} error={ctx.err('financialSupport', i, 'event')} />
          <TextInput label="Funding organization" value={r.body} onChange={(v) => ctx.setRecord('financialSupport', i, 'body', v)} />
          <MoneyInput label="Amount (₹)" value={r.amount} onChange={(v) => ctx.setRecord('financialSupport', i, 'amount', v)} />
          <TextInput label="Purpose" value={r.purpose} onChange={(v) => ctx.setRecord('financialSupport', i, 'purpose', v)} span={12} />
          <ProofInput
            proof={r.proof}
            onChange={(v) => ctx.setRecord('financialSupport', i, 'proof', v)}
            onError={(msg) => ctx.notify(msg, 'error')}
            uploading={ctx.uploading === `financialSupport.${i}`}
          />
        </>
      )}
    </RecordList>
  );
}

/* ---------------------------------------- 11. Projects */

export function ProjectSection({ ctx }) {
  return (
    <RecordList
      title="Projects and Consultancy"
      listKey="projects"
      records={ctx.p.projects}
      ctx={ctx}
      labelFn={(r) => r.title}
    >
      {(r, i) => (
        <>
          <SelectInput label="Project type" value={r.type} onChange={(v) => ctx.setRecord('projects', i, 'type', v)} options={PROJECT_TYPES} />
          <TextInput label="Name of the Faculty (Principal Investigator)" value={r.principalInvestigator} onChange={(v) => ctx.setRecord('projects', i, 'principalInvestigator', v)} span={12} />
          <TextInput label="Funding agency" value={r.agency} onChange={(v) => ctx.setRecord('projects', i, 'agency', v)} />
          <TextInput label="Project title" required value={r.title} onChange={(v) => ctx.setRecord('projects', i, 'title', v)} span={12} error={ctx.err('projects', i, 'title')} />
          <TextInput label="Order / Sanction number" value={r.orderNo} onChange={(v) => ctx.setRecord('projects', i, 'orderNo', v)} />
          <DateInput label="Sanction date" value={r.sanctionDate} onChange={(v) => ctx.setRecord('projects', i, 'sanctionDate', v)} />
          <DateInput label="From" value={r.from} onChange={(v) => ctx.setRecord('projects', i, 'from', v)} />
          <DateInput label="To" value={r.to} onChange={(v) => ctx.setRecord('projects', i, 'to', v)} error={ctx.err('projects', i, 'to')} />
          {r.from && r.to && <TextInput label="Duration" value={duration(r.from, r.to)} readOnly span={4} />}
          <MoneyInput label="Sanctioned amount" value={r.sanctioned} onChange={(v) => ctx.setRecord('projects', i, 'sanctioned', v)} />
          <RadioGroup label="Amount received?" value={r.received} onChange={(v) => ctx.setRecord('projects', i, 'received', v)} options={['Yes', 'No']} span={4} />
          {r.received === 'Yes' && (
            <MoneyInput label="Amount received" value={r.receivedAmount} onChange={(v) => ctx.setRecord('projects', i, 'receivedAmount', v)} />
          )}
          <SelectInput label="Project status" value={r.status} onChange={(v) => ctx.setRecord('projects', i, 'status', v)} options={PROJECT_STATUSES} />
          <ProofInput
            proof={r.proof}
            onChange={(v) => ctx.setRecord('projects', i, 'proof', v)}
            onError={(msg) => ctx.notify(msg, 'error')}
            uploading={ctx.uploading === `projects.${i}`}
          />
        </>
      )}
    </RecordList>
  );
}

/* ---------------------------------------- 12. Courses (NPTEL + Other) */

export function CourseSection({ ctx }) {
  return (
    <div>
      <RecordList
        title="NPTEL Courses"
        listKey="nptelCourses"
        records={ctx.p.nptelCourses}
        ctx={ctx}
        labelFn={(r) => r.title}
      >
        {(r, i) => (
          <>
            <TextInput label="Course title" required value={r.title} onChange={(v) => ctx.setRecord('nptelCourses', i, 'title', v)} span={12} error={ctx.err('nptelCourses', i, 'title')} />
            <DateInput label="From" value={r.from} onChange={(v) => ctx.setRecord('nptelCourses', i, 'from', v)} />
            <DateInput label="To" value={r.to} onChange={(v) => ctx.setRecord('nptelCourses', i, 'to', v)} />
            {r.from && r.to && <TextInput label="Duration" value={duration(r.from, r.to)} readOnly span={4} />}
            <SelectInput label="Duration (Weeks)" value={r.durationWeeks} onChange={(v) => ctx.setRecord('nptelCourses', i, 'durationWeeks', v)} options={NPTEL_DURATION_WEEKS} span={4} />
            <SelectInput label="Result" value={r.result} onChange={(v) => ctx.setRecord('nptelCourses', i, 'result', v)} options={NPTEL_RESULTS} />
            <ProofInput
              label="Certificate"
              proof={r.certificate}
              onChange={(v) => ctx.setRecord('nptelCourses', i, 'certificate', v)}
              onError={(msg) => ctx.notify(msg, 'error')}
              uploading={ctx.uploading === `nptelCourses.${i}`}
            />
          </>
        )}
      </RecordList>

      <div style={{ marginTop: 'var(--sp-8)' }}>
        <RecordList
          title="Other Courses and Certifications"
          listKey="otherCourses"
          records={ctx.p.otherCourses}
          ctx={ctx}
          labelFn={(r) => r.title}
        >
          {(r, i) => (
            <>
              <TextInput label="Platform" value={r.platform} onChange={(v) => ctx.setRecord('otherCourses', i, 'platform', v)} placeholder="Coursera, Udemy, etc." />
              <TextInput label="Course title" required value={r.title} onChange={(v) => ctx.setRecord('otherCourses', i, 'title', v)} span={12} error={ctx.err('otherCourses', i, 'title')} />
              <DateInput label="From" value={r.from} onChange={(v) => ctx.setRecord('otherCourses', i, 'from', v)} />
              <DateInput label="To" value={r.to} onChange={(v) => ctx.setRecord('otherCourses', i, 'to', v)} />
              {r.from && r.to && <TextInput label="Duration" value={duration(r.from, r.to)} readOnly span={4} />}
              <TextInput label="Award / Grade" value={r.award} onChange={(v) => ctx.setRecord('otherCourses', i, 'award', v)} />
              <ProofInput
                label="Certificate"
                proof={r.certificate}
                onChange={(v) => ctx.setRecord('otherCourses', i, 'certificate', v)}
                onError={(msg) => ctx.notify(msg, 'error')}
                uploading={ctx.uploading === `otherCourses.${i}`}
              />
            </>
          )}
        </RecordList>
      </div>
    </div>
  );
}
