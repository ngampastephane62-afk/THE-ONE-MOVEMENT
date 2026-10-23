import OpportunityView from '@/components/partners/OpportunityView';

export default function InvestmentOpportunity() {
  return (
    <OpportunityView
      doc="investment" path="/partners/investment" intent="investment"
      metaTitle="INVESTMENT OPPORTUNITIES — THE ONE MOVEMENT INTERNATIONAL"
      metaDescription="Investment information on The One Movement Multinational: vision, business model and strategic opportunity."
      eyebrow="EXPLORE INVESTMENT OPPORTUNITIES" title="Culture, capital and connection."
      lead="The One Movement Multinational brings programmes, media and a growing member network together on one platform. Investment discussions are held directly and reviewed individually."
      sectionsEyebrow="OVERVIEW" sectionsHeading="THE OPPORTUNITY"
      blocks={[
        { title: 'Investment vision', body: 'An ecosystem linking culture, business and media between Africa, the UAE and international markets.' },
        { title: 'Business model', body: 'Revenue intended to come from programmes, partnerships, media and membership, as described in the presentation.' },
        { title: 'Strategic opportunity', body: 'The presentation sets out a stated capital requirement of USD 4 million to launch and position the platform.' },
        { title: 'Process', body: 'An initial inquiry, followed by a direct conversation and access to further documentation where appropriate.' },
      ]}
      documentTitle="Investment presentation"
      documentBody="The Founder's investment presentation for The One Movement Multinational, available to read or download."
      inquiryLabel="Begin an investment inquiry" requestLabel="Request full documentation"
      disclosures={[
        'This page is for information only and is not an offer or solicitation to buy securities.',
        'The USD 4 million figure is a stated funding need, not a valuation and not funds already raised; allocation by category is still to be defined.',
        'Revenue figures for 2026–2028 are projections, not achieved results. Investments carry risk, including loss of capital, and no return is guaranteed.',
        'Any investment is subject to due diligence, agreement and applicable law. Seek independent advice.',
      ]}
      alternate={{ href: '/partners/partnership', label: 'Explore partnership instead' }}
    />
  );
}
