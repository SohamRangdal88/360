import React from 'react';
import {
  TextInput, TextArea, SelectInput, DateInput, CheckboxGroup, RadioGroup, TagInput
} from '../components/Fields';
import { RecordList } from '../components/RecordList';
import {
  EXPERIENCE_YEARS, EXPERIENCE_MONTHS, PROFESSIONAL_BODIES,
  SPECIALIZATIONS, RESEARCH_AREAS, SKILLS,
  INDUSTRY_SECTORS, TRAINING_LEVELS,
  PARTICIPATION_TYPES, PROGRAM_TYPES, PROGRAM_MODES,
  CAPACITY_OPTIONS
} from '../data/constants';
import { duration } from '../utils/helpers';

/* ---------------------------------------- 4. Professional details */

export function ProfessionalSection({ ctx }) {
  const pr = {
    teachYears: '',
    teachMonths: '',
    indYears: '',
    indMonths: '',
    dateOfJoining: '',
    specializations: [],
    researchAreas: [],
    skills: [],
    bodies: [],
    otherBody: '',
    ...(ctx.p.professionalDetails || {})
  };
  const specializations = Array.isArray(pr.specializations) ? pr.specializations : [];
  const researchAreas = Array.isArray(pr.researchAreas) ? pr.researchAreas : [];
  const skills = Array.isArray(pr.skills) ? pr.skills : [];
  const bodies = Array.isArray(pr.bodies) ? pr.bodies : [];
  const set = (field, value) => ctx.set(['professionalDetails', field], value);

  return (
    <div className="section-block">
      <h2 className="section-title">4. Professional Details</h2>
      <div className="form-grid">
        <SelectInput label="Teaching experience (years)" required value={pr.teachYears} onChange={(v) => set('teachYears', v)} options={EXPERIENCE_YEARS} span={4} error={ctx.errors['professionalDetails.teachYears']} />
        <SelectInput label="Months" value={pr.teachMonths} onChange={(v) => set('teachMonths', v)} options={EXPERIENCE_MONTHS} span={3} />
        <div className="field span-5" />
        <SelectInput label="Industry experience (years)" value={pr.indYears} onChange={(v) => set('indYears', v)} options={EXPERIENCE_YEARS} span={4} />
        <SelectInput label="Months" value={pr.indMonths} onChange={(v) => set('indMonths', v)} options={EXPERIENCE_MONTHS} span={3} />
        <div className="field span-5" />

        <DateInput label="Date of Joining" value={pr.dateOfJoining} onChange={(v) => set('dateOfJoining', v)} />

        <TagInput
          label="Specializations"
          values={specializations}
          onChange={(v) => set('specializations', v)}
          placeholder="Type and press Enter"
          suggestions={SPECIALIZATIONS}
        />
        <TagInput
          label="Research areas"
          values={researchAreas}
          onChange={(v) => set('researchAreas', v)}
          placeholder="Type and press Enter"
          suggestions={RESEARCH_AREAS}
        />
        <TagInput
          label="Technical skills"
          values={skills}
          onChange={(v) => set('skills', v)}
          placeholder="Type and press Enter"
          suggestions={SKILLS}
        />
        <CheckboxGroup
          label="Membership of Professional Bodies"
          values={bodies}
          onChange={(v) => set('bodies', v)}
          options={PROFESSIONAL_BODIES}
        />
        {bodies.includes('Other') && (
          <TextInput label="Other professional body" value={pr.otherBody} onChange={(v) => set('otherBody', v)} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------- 5. Industry training */

export function IndustryTrainingSection({ ctx }) {
  return (
    <RecordList
      title="Industry Training"
      listKey="industryTrainings"
      records={ctx.p.industryTrainings}
      ctx={ctx}
      labelFn={(r) => r.company}
    >
      {(r, i) => (
        <>
          <TextInput label="Company / Organization" required value={r.company} onChange={(v) => ctx.setRecord('industryTrainings', i, 'company', v)} error={ctx.err('industryTrainings', i, 'company')} />
          <SelectInput label="Industry sector" required value={r.sector} onChange={(v) => ctx.setRecord('industryTrainings', i, 'sector', v)} options={INDUSTRY_SECTORS} error={ctx.err('industryTrainings', i, 'sector')} />
          <TextInput label="Location" value={r.location} onChange={(v) => ctx.setRecord('industryTrainings', i, 'location', v)} />
          <TextInput label="Discipline" value={r.discipline} onChange={(v) => ctx.setRecord('industryTrainings', i, 'discipline', v)} />
          <SelectInput label="Training level" value={r.level} onChange={(v) => ctx.setRecord('industryTrainings', i, 'level', v)} options={TRAINING_LEVELS} />
          <DateInput label="From" value={r.from} onChange={(v) => ctx.setRecord('industryTrainings', i, 'from', v)} />
          <DateInput label="To" value={r.to} onChange={(v) => ctx.setRecord('industryTrainings', i, 'to', v)} error={ctx.err('industryTrainings', i, 'to')} />
          {r.from && r.to && <TextInput label="Duration" value={duration(r.from, r.to)} readOnly span={4} />}
          <TextArea label="Description" value={r.description} onChange={(v) => ctx.setRecord('industryTrainings', i, 'description', v)} />
          <TextInput label="Proof / Certificate URL" value={r.proofUrl} onChange={(v) => ctx.setRecord('industryTrainings', i, 'proofUrl', v)} span={12} placeholder="https://" />
        </>
      )}
    </RecordList>
  );
}

/* ---------------------------------------- 6. FDP / STTP / Workshop */

export function ProgramSection({ ctx }) {
  return (
    <RecordList
      title="FDP / STTP / Workshop"
      listKey="programs"
      records={ctx.p.programs}
      ctx={ctx}
      labelFn={(r) => r.title}
    >
      {(r, i) => (
        <>
          <RadioGroup label="Participation" value={r.participation} onChange={(v) => ctx.setRecord('programs', i, 'participation', v)} options={PARTICIPATION_TYPES} span={12} />
          <CheckboxGroup label="Programme type" values={r.types} onChange={(v) => ctx.setRecord('programs', i, 'types', v)} options={PROGRAM_TYPES} />
          {r.types.includes('Other') && (
            <TextInput label="Other type" value={r.otherType} onChange={(v) => ctx.setRecord('programs', i, 'otherType', v)} />
          )}
          <TextInput label="Title" required value={r.title} onChange={(v) => ctx.setRecord('programs', i, 'title', v)} span={12} error={ctx.err('programs', i, 'title')} />
          <SelectInput label="Capacity" value={r.capacity} onChange={(v) => ctx.setRecord('programs', i, 'capacity', v)} options={CAPACITY_OPTIONS} span={4} />
          <DateInput label="From" value={r.from} onChange={(v) => ctx.setRecord('programs', i, 'from', v)} />
          <DateInput label="To" value={r.to} onChange={(v) => ctx.setRecord('programs', i, 'to', v)} error={ctx.err('programs', i, 'to')} />
          <TextInput label="Awarding Agency / Institute / Organisation" value={r.awardingAgency} onChange={(v) => ctx.setRecord('programs', i, 'awardingAgency', v)} span={12} />
          <TextInput label="Organizer" value={r.organizer} onChange={(v) => ctx.setRecord('programs', i, 'organizer', v)} />
          <RadioGroup label="Mode" value={r.mode} onChange={(v) => ctx.setRecord('programs', i, 'mode', v)} options={PROGRAM_MODES} />
          {(r.mode === 'Offline' || r.mode === 'Hybrid') && (
            <>
              <TextInput label="Venue" value={r.venueName} onChange={(v) => ctx.setRecord('programs', i, 'venueName', v)} />
              <TextInput label="City" value={r.city} onChange={(v) => ctx.setRecord('programs', i, 'city', v)} />
            </>
          )}
          {(r.mode === 'Online' || r.mode === 'Hybrid') && (
            <TextInput label="Platform" value={r.platform} onChange={(v) => ctx.setRecord('programs', i, 'platform', v)} placeholder="Zoom, Teams, etc." />
          )}
          <TextInput label="Proof / Certificate URL" value={r.proofUrl} onChange={(v) => ctx.setRecord('programs', i, 'proofUrl', v)} span={12} placeholder="https://" />
        </>
      )}
    </RecordList>
  );
}
