import React from 'react';

/* Reusable card shell for repeatable records */

export function RecordCard({ index, label, isOpen, onToggle, onDelete, children }) {
  return (
    <div className={`record-card${isOpen ? ' is-open' : ''}`}>
      <div className="record-header" onClick={onToggle}>
        <span className="record-index">{index + 1}</span>
        <span className="record-label">{label || `Record ${index + 1}`}</span>
        <span className="record-chevron">{isOpen ? '▾' : '▸'}</span>
        <button
          type="button"
          className="record-delete-btn"
          title="Delete this record"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          ×
        </button>
      </div>
      {isOpen && (
        <div className="record-body">
          <div className="form-grid">{children}</div>
          <div className="record-footer">
            <button type="button" className="btn btn-plain btn-sm is-danger-text" onClick={onDelete}>
              Delete this record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Section shell that wraps records with "add" and "nothing to report" */

export function RecordList({ title, listKey, records, ctx, labelFn, children }) {
  const na = ctx.p.notApplicable?.[listKey] || false;
  const hasRecords = records && records.length > 0;

  return (
    <div className="section-block">
      <h2 className="section-title">{title}</h2>

      <label className="na-check">
        <input
          type="checkbox"
          checked={na}
          disabled={hasRecords}
          onChange={(e) => ctx.setNotApplicable(listKey, e.target.checked)}
        />
        Nothing to report in this section
      </label>

      {!na && (
        <>
          {records.map((record, i) => (
            <RecordCard
              key={record.rowId || i}
              index={i}
              label={labelFn(record)}
              isOpen={ctx.isOpen(record.rowId)}
              onToggle={() => ctx.toggleRow(record.rowId)}
              onDelete={() => ctx.deleteRecord(listKey, i, labelFn(record) || `Record ${i + 1}`)}
            >
              {children(record, i)}
            </RecordCard>
          ))}

          <button
            type="button"
            className="btn-add"
            onClick={() => ctx.addRecord(listKey)}
          >
            + Add {title.toLowerCase()}
          </button>
        </>
      )}
    </div>
  );
}
