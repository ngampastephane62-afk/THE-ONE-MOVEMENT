import OpportunityView from '@/components/partners/OpportunityView';

export default function PartnershipOpportunity() {
  return (
    <OpportunityView
      doc="partnership" path="/partners/partnership" intent="partner"
      metaTitle="BECOME A PARTNER — THE ONE MOVEMENT INTERNATIONAL"
      metaDescription="Annual partnership with The One Movement International: programmes, media and communities across Africa, the UAE and international editions."
      eyebrow="BECOME A PARTNER" title="A year inside the ecosystem."
      lead="Partnership with The One Movement is an annual collaboration rather than sponsorship of a single event, shaped around your organisation's objectives."
      sectionsEyebrow="COLLABORATION" sectionsHeading="HOW PARTNERS TAKE PART"
      blocks={[
        { title: 'Collaboration vision', body: 'Culture, business and dialogue brought together across the Movement’s programmes, from Africa to the UAE and beyond.' },
        { title: 'Corporate and brand partnership', body: 'Twelve-month partnership levels combining programme presence, media and digital visibility, defined in a written agreement.' },
        { title: 'Institutional partnership', body: 'Tailored collaboration with governments, ministries, diplomatic missions and institutions.' },
        { title: 'Potential benefits', body: 'Visibility, relationships, editorial presence and introductions, subject to availability, selection and editorial decisions.' },
      ]}
      documentTitle="Annual Partnership 2026–2027"
      documentBody="The full partnership proposal, including partnership levels and their terms, is available to read or download."
      inquiryLabel="Begin a partnership inquiry" requestLabel="Request a tailored proposal"
      disclosures={[
        'Partnership fees cover defined services and are separate from investment and from charitable contributions.',
        'Programme dates, placements and deliverables are confirmed only in a written agreement.',
        'Media coverage, speaking opportunities and introductions depend on availability, selection and editorial decisions.',
      ]}
      alternate={{ href: '/partners/investment', label: 'Explore investment instead' }}
    />
  );
}
