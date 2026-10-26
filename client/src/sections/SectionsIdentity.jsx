import React from 'react';
import {
  TextInput, SelectInput, DateInput, YearSelect, PhotoInput, PhoneInput, TextArea, RadioGroup
} from '../components/Fields';
import {
  DEPARTMENTS, DESIGNATIONS, GENDERS, BLOOD_GROUPS,
  HIGHEST_QUALIFICATIONS, UG_DEGREES, PG_DEGREES, PHD_STATUSES, EDUCATION_YEARS
} from '../data/constants';
import { age } from '../utils/helpers';

/* ---------------------------------------- 1. Personal details */

export function PersonalSection({ ctx }) {
  const p = ctx.p.personalDetails;
  const set = (field, value) => ctx.set(['personalDetails', field], value);

  return (
    <div className="section-block">
      <h2 className="section-title">1. Personal Details</h2>
      <div className="form-grid">
        <PhotoInput
          value={p.photoUrl}
          onChange={(file) => ctx.uploadPhoto(file)}
          onError={(msg) => ctx.notify(msg, 'error')}
          uploading={ctx.uploading === 'photo'}
        />
        <TextInput label="First name" required value={p.firstName} onChange={(v) => set('firstName', v)} error={ctx.errors['personalDetails.firstName']} />
        <TextInput label="Middle name" value={p.middleName} onChange={(v) => set('middleName', v)} />
        <TextInput label="Last name" required value={p.lastName} onChange={(v) => set('lastName', v)} error={ctx.errors['personalDetails.lastName']} />
        <SelectInput label="Department" required value={p.department} onChange={(v) => set('department', v)} options={DEPARTMENTS} error={ctx.errors['personalDetails.department']} />
        <SelectInput label="Designation" required value={p.designation} onChange={(v) => set('designation', v)} options={DESIGNATIONS} error={ctx.errors['personalDetails.designation']} />
        <TextInput label="Official email" required value={p.officialEmail} onChange={(v) => set('officialEmail', v)} type="email" placeholder="name@college.edu.in" error={ctx.errors['personalDetails.officialEmail']} />
        <DateInput label="Date of birth" required value={p.dob} onChange={(v) => set('dob', v)} max={new Date().toISOString().slice(0, 10)} error={ctx.errors['personalDetails.dob']} />
        {p.dob && <TextInput label="Age" value={age(p.dob)} readOnly span={3} />}
        <RadioGroup label="Gender" required value={p.gender} onChange={(v) => set('gender', v)} options={GENDERS} span={12} error={ctx.errors['personalDetails.gender']} />
        <SelectInput label="Blood group" value={p.bloodGroup} onChange={(v) => set('bloodGroup', v)} options={BLOOD_GROUPS} span={4} />
      </div>
    </div>
  );
}

/* ---------------------------------------- 2. Contact details */

export function ContactSection({ ctx }) {
  const c = ctx.p.contactDetails;
  const set = (field, value) => ctx.set(['contactDetails', field], value);

  return (
    <div className="section-block">
      <h2 className="section-title">2. Contact Details</h2>
      <div className="form-grid">
        <TextInput label="Personal email" required value={c.email} onChange={(v) => set('email', v)} type="email" error={ctx.errors['contactDetails.email']} />
        <PhoneInput
          label="Mobile number" required
          code={c.mobileCode} number={c.mobile}
          onCode={(v) => set('mobileCode', v)} onNumber={(v) => set('mobile', v)}
          error={ctx.errors['contactDetails.mobile']}
        />
        <PhoneInput
          label="Emergency contact"
          code={c.emergencyCode} number={c.emergency}
          onCode={(v) => set('emergencyCode', v)} onNumber={(v) => set('emergency', v)}
          error={ctx.errors['contactDetails.emergency']}
        />
        <TextArea label="Current address" required value={c.currentAddress} onChange={(v) => set('currentAddress', v)} error={ctx.errors['contactDetails.currentAddress']} />
        <div className="field span-12">
          <label className="na-check">
            <input type="checkbox" checked={c.sameAsCurrent} onChange={(e) => set('sameAsCurrent', e.target.checked)} />
            Permanent address is the same as current address
          </label>
        </div>
        {!c.sameAsCurrent && (
          <TextArea label="Permanent address" value={c.permanentAddress} onChange={(v) => set('permanentAddress', v)} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------- 3. Qualification details */

export function QualificationSection({ ctx }) {
  const q = ctx.p.qualifications;
  const set = (path, value) => ctx.set(['qualifications', ...path.split('.')], value);

  const highest = q.highest;

  // UG form is shown for all qualifications
  const isUgVisible = true;
  // PG form appears if highest is Post Graduate or Ph.D.
  const isPgVisible = highest === 'Post Graduate' || highest === 'Ph.D.';
  // PhD form appears only if highest is Ph.D.
  const isPhdVisible = highest === 'Ph.D.';

  return (
    <div className="section-block">
      <h2 className="section-title">3. Qualification Details</h2>
      <div className="form-grid">
        <SelectInput label="Highest qualification" required value={q.highest} onChange={(v) => set('highest', v)} options={HIGHEST_QUALIFICATIONS} error={ctx.errors['qualifications.highest']} />

        {/* UG Section */}
        {isUgVisible && (
          <>
            <div className="field span-12">
              <h3 className="sub-heading">Under Graduate (UG)</h3>
            </div>
            <SelectInput label="UG degree" required value={q.ug.degree} onChange={(v) => set('ug.degree', v)} options={UG_DEGREES} error={ctx.errors['qualifications.ug.degree']} />
            <TextInput label="Specialization" value={q.ug.specialization} onChange={(v) => set('ug.specialization', v)} />
            <TextInput label="University" required value={q.ug.university} onChange={(v) => set('ug.university', v)} error={ctx.errors['qualifications.ug.university']} />
            <TextInput label="College" value={q.ug.college} onChange={(v) => set('ug.college', v)} />
            <YearSelect label="Passing year" required value={q.ug.year} onChange={(v) => set('ug.year', v)} error={ctx.errors['qualifications.ug.year']} />
          </>
        )}

        {/* PG Section - appears when highest is Post Graduate or Ph.D. */}
        {isPgVisible && (
          <>
            <div className="field span-12">
              <h3 className="sub-heading">Post Graduate (PG)</h3>
            </div>
            <SelectInput label="PG degree" value={q.pg.degree} onChange={(v) => set('pg.degree', v)} options={PG_DEGREES} />
            <TextInput label="Specialization" value={q.pg.specialization} onChange={(v) => set('pg.specialization', v)} />
            <TextInput label="University" value={q.pg.university} onChange={(v) => set('pg.university', v)} />
            <TextInput label="College" value={q.pg.college} onChange={(v) => set('pg.college', v)} />
            <YearSelect label="Passing year" value={q.pg.year} onChange={(v) => set('pg.year', v)} error={ctx.errors['qualifications.pg.year']} />
          </>
        )}

        {/* PhD Section - appears only when highest is PhD */}
        {isPhdVisible && (
          <>
            <div className="field span-12">
              <h3 className="sub-heading">Ph.D.</h3>
            </div>
            <SelectInput label="Ph.D. status" value={q.phd.status} onChange={(v) => set('phd.status', v)} options={PHD_STATUSES} />
            <TextInput label="University" value={q.phd.university} onChange={(v) => set('phd.university', v)} />
            <TextInput label="Research area" value={q.phd.area} onChange={(v) => set('phd.area', v)} span={12} />
            <YearSelect label="Admission year" value={q.phd.admissionYear} onChange={(v) => set('phd.admissionYear', v)} />
            {q.phd.status === 'Pursuing' && (
              <YearSelect label="Expected completion" value={q.phd.expectedYear} onChange={(v) => set('phd.expectedYear', v)} />
            )}
            {q.phd.status === 'Awarded' && (
              <YearSelect label="Awarded year" value={q.phd.awardedYear} onChange={(v) => set('phd.awardedYear', v)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
