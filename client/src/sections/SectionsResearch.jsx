import React from 'react';
import {
  TextInput, SelectInput, DateInput, MonthYearInput, MoneyInput, RepeatRows, ProofInput
} from '../components/Fields';
import { RecordList } from '../components/RecordList';
import {
  PUBLICATION_TYPES, PATENT_STATUSES, AWARD_CATEGORIES, AWARD_LEVELS
} from '../data/constants';

/* ---------------------------------------- 7. Publications */

export function PublicationSection({ ctx }) {
  return (
    <RecordList
      title="Research Publications"
      listKey="publications"
      records={ctx.p.publications}
      ctx={ctx}
      labelFn={(r) => r.title}
    >
      {(r, i) => (
        <>
          <RepeatRows
            label="Authors" required
            values={r.authors} onChange={(v) => ctx.setRecord('publications', i, 'authors', v)}
            placeholder="Author name" addLabel="Add author"
          />
          <TextInput label="Title" required value={r.title} onChange={(v) => ctx.setRecord('publications', i, 'title', v)} span={12} error={ctx.err('publications', i, 'title')} />
          <SelectInput label="Publication type" value={r.type} onChange={(v) => ctx.setRecord('publications', i, 'type', v)} options={PUBLICATION_TYPES} />
          <TextInput label="Published in" value={r.source} onChange={(v) => ctx.setRecord('publications', i, 'source', v)} placeholder="Journal / Conference name" />
          <TextInput label="ISSN / ISBN" value={r.issn} onChange={(v) => ctx.setRecord('publications', i, 'issn', v)} span={4} />
          <TextInput label="Publisher" value={r.publisher} onChange={(v) => ctx.setRecord('publications', i, 'publisher', v)} />
          <TextInput label="Venue" value={r.venue} onChange={(v) => ctx.setRecord('publications', i, 'venue', v)} />
          <MonthYearInput
            label="Publication date"
            month={r.month} year={r.year}
            onMonth={(v) => ctx.setRecord('publications', i, 'month', v)}
            onYear={(v) => ctx.setRecord('publications', i, 'year', v)}
          />
          <TextInput label="DOI / Link" value={r.link} onChange={(v) => ctx.setRecord('publications', i, 'link', v)} span={12} placeholder="https://doi.org/..." />
        </>
      )}
    </RecordList>
  );
}

/* ---------------------------------------- 8. Patents */

export function PatentSection({ ctx }) {
  return (
    <RecordList
      title="Patent Details"
      listKey="patents"
      records={ctx.p.patents}
      ctx={ctx}
      labelFn={(r) => r.title}
    >
      {(r, i) => (
        <>
          <TextInput label="Patent Application Number" required value={r.appNo} onChange={(v) => ctx.setRecord('patents', i, 'appNo', v)} error={ctx.err('patents', i, 'appNo')} />
          <SelectInput label="Status" value={r.status} onChange={(v) => ctx.setRecord('patents', i, 'status', v)} options={PATENT_STATUSES} />
          <RepeatRows
            label="Inventor/s Name" values={r.inventors}
            onChange={(v) => ctx.setRecord('patents', i, 'inventors', v)}
            placeholder="Inventor name" addLabel="Add inventor"
          />
          <TextInput label="Patent title" required value={r.title} onChange={(v) => ctx.setRecord('patents', i, 'title', v)} span={12} error={ctx.err('patents', i, 'title')} />
          <RepeatRows
            label="Applicants" values={r.applicants}
            onChange={(v) => ctx.setRecord('patents', i, 'applicants', v)}
            placeholder="Applicant name / org" addLabel="Add applicant"
          />
          <DateInput label="Filed date" value={r.filedDate} onChange={(v) => ctx.setRecord('patents', i, 'filedDate', v)} />
          <TextInput label="Publication number" value={r.pubNo} onChange={(v) => ctx.setRecord('patents', i, 'pubNo', v)} />
          <DateInput label="Publication date" value={r.pubDate} onChange={(v) => ctx.setRecord('patents', i, 'pubDate', v)} />
          <TextInput label="Grant number" value={r.grantNo} onChange={(v) => ctx.setRecord('patents', i, 'grantNo', v)} />
          <DateInput label="Grant date" value={r.grantDate} onChange={(v) => ctx.setRecord('patents', i, 'grantDate', v)} />
          <MoneyInput label="Earnings from patent" value={r.earnings} onChange={(v) => ctx.setRecord('patents', i, 'earnings', v)} />
          <ProofInput
            proof={r.proof}
            onChange={(v) => ctx.setRecord('patents', i, 'proof', v)}
            onError={(msg) => ctx.notify(msg, 'error')}
            uploading={ctx.uploading === `patents.${i}`}
          />
        </>
      )}
    </RecordList>
  );
}

/* ---------------------------------------- 9. Awards */

export function AwardSection({ ctx }) {
  return (
    <RecordList
      title="Achievements and Awards"
      listKey="awards"
      records={ctx.p.awards}
      ctx={ctx}
      labelFn={(r) => r.title}
    >
      {(r, i) => (
        <>
          <TextInput label="Award title" required value={r.title} onChange={(v) => ctx.setRecord('awards', i, 'title', v)} span={12} error={ctx.err('awards', i, 'title')} />
          <TextInput label="Awarding agency" value={r.agency} onChange={(v) => ctx.setRecord('awards', i, 'agency', v)} />
          <SelectInput label="Category" value={r.category} onChange={(v) => ctx.setRecord('awards', i, 'category', v)} options={AWARD_CATEGORIES} />
          {r.category === 'Other' && (
            <TextInput label="Other category" value={r.otherCategory} onChange={(v) => ctx.setRecord('awards', i, 'otherCategory', v)} />
          )}
          <SelectInput label="Level" value={r.level} onChange={(v) => ctx.setRecord('awards', i, 'level', v)} options={AWARD_LEVELS} />
          <DateInput label="Date of award" value={r.date} onChange={(v) => ctx.setRecord('awards', i, 'date', v)} />
          {r.date && <TextInput label="Award year" value={r.date ? new Date(r.date).getFullYear().toString() : ''} readOnly span={3} />}
          <ProofInput
            proof={r.proof}
            onChange={(v) => ctx.setRecord('awards', i, 'proof', v)}
            onError={(msg) => ctx.notify(msg, 'error')}
            uploading={ctx.uploading === `awards.${i}`}
          />
        </>
      )}
    </RecordList>
  );
}
