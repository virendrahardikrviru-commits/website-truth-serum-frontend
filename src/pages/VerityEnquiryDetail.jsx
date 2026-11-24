import React from 'react';

const FIELD_LABELS = {
  id: 'Enquiry ID',
  full_name: 'Contact name',
  business_email: 'Business email',
  company_name: 'Company',
  business_type: 'Business type',
  business_website: 'Business website',
  supplier_website: 'Supplier website',
  supplier_country: 'Supplier country',
  investigation_notes: 'Investigation notes',
  privacy_consent: 'Privacy consent',
  status: 'Enquiry status',
  source: 'Submission source',
  created_at: 'Date received',
  requested_services: 'Requested services',
  verification_purpose: 'Verification purpose',
  purpose_details: 'Purpose details',
  investigation_requirements: 'Investigation requirements',
  expected_deliverable: 'Expected deliverable',
  paid_service_acknowledgement: 'Paid service acknowledgement',
};

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';

  if (key === 'created_at') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (Array.isArray(value)) {
    return value.length ? value.map(String).join(', ') : '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatLabel(key) {
  return FIELD_LABELS[key] ||
    key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function VerityEnquiryDetail({ enquiry, onBack }) {
  if (!enquiry) return null;

  return (
    <section className="verity-panel verity-enquiry-detail">
      <div className="verity-panel-heading">
        <div>
          <p className="verity-eyebrow">ENQUIRY RECORD</p>
          <h2>{enquiry.company_name || enquiry.full_name || 'Enquiry details'}</h2>
        </div>

        <button
          type="button"
          className="verity-refresh"
          onClick={onBack}
        >
          Back to enquiries
        </button>
      </div>

      <div className="verity-detail-grid">
        {Object.entries(enquiry).map(([key, value]) => (
          <div
            className={`verity-detail-item ${
              ['investigation_notes', 'purpose_details',
                'investigation_requirements', 'expected_deliverable',
                'id'].includes(key) ? 'verity-detail-full' : ''
            }`}
            key={key}
          >
            <span>{formatLabel(key)}</span>
            <p>{formatValue(key, value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
