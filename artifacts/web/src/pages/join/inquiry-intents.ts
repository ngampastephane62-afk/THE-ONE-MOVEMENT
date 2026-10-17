export const INQUIRY_INTENTS = {
  investment: {
    eyebrow: 'INVESTMENT & PARTNERSHIPS',
    heading: 'INVEST IN THE ONE MOVEMENT MULTINATIONAL',
    note: 'Discuss the project, its funding needs and development milestones directly with TOMI. This enquiry is not an investment commitment. Read the public investment presentation on the Partners page.',
    message: 'Investment enquiry — The One Movement Multinational\n\nI would like to discuss the project, its funding requirements, budget and development milestones.\nMy investment interests and indicative budget:\n',
    professional: false,
  },
  partnership: {
    eyebrow: 'INVESTMENT & PARTNERSHIPS',
    heading: 'BECOME A PARTNER',
    note: 'Tell TOMI about your visibility objectives, outdoor marketing needs, preferred locations, timing and budget. Package scope and availability are agreed with the team; this enquiry does not activate a partnership.',
    message: 'Partnership enquiry — The One Movement\n\nI would like to discuss a visibility package, outdoor marketing, media or programme collaboration.\nMy objectives, preferred locations, timing and indicative budget:\n',
    professional: false,
  },
  'knowledge-hub': {
    eyebrow: 'THE ONE KNOWLEDGE HUB · EARLY ACCESS',
    heading: 'SHARE KNOWLEDGE. EXPRESS YOUR INTEREST.',
    note: 'The full TOMI knowledge library is in preparation. Tell us what you would like to learn or contribute. Existing public resources remain available without this enquiry. This message does not enrol you in a course or create a member account.',
    message: 'The One Knowledge Hub — early-access enquiry\n\nI am interested in learning or contributing expertise to the year-round ecosystem.\nMy sector, topics of interest and proposed contribution:\n',
    professional: true,
  },
  marketplace: {
    eyebrow: 'THE ONE MARKETPLACE · EARLY ACCESS',
    heading: 'BRING YOUR BUSINESS TO THE ECOSYSTEM.',
    note: 'The full product and service marketplace is in preparation. Share your business, expertise or proposed offering with TOMI for review. This enquiry does not publish a listing, verify a business, reserve a service or take payment. You can already create a member profile and choose whether it appears in the public directory.',
    message: 'The One Marketplace — early-access enquiry\n\nI would like to showcase my business, services or expertise when the marketplace becomes available.\nMy sector, offering, market served and collaboration interests:\n',
    professional: true,
  },
  'diplomatic-gala': {
    eyebrow: 'THE ONE DIPLOMATIC GALA · PARTICIPATION',
    heading: 'BRING YOUR COUNTRY TO THE GALA.',
    note: 'Share how your country, organisation or community would like to contribute. Pavilions, representation and activities depend on review, agreement and the confirmed programme. Submitting this enquiry does not confirm a booking or official national representation.',
    message: '',
    professional: true,
  },
  'fashion-week': {
    eyebrow: 'THE ONE FASHION WEEK INTERNATIONAL · PARTICIPATION',
    heading: 'BRING YOUR CRAFT. SHARE YOUR KNOWLEDGE.',
    note: 'Apply in your professional category or propose teaching, mentoring and cultural exchange. Submitting this form does not confirm a runway place, casting, accreditation, assignment or paid membership. Designer packages follow their separate reviewed application and written agreement.',
    message: '',
    professional: true,
  },
} as const;

export const GALA_PARTICIPATION_CATEGORIES = [
  { value: 'diplomatic-missions', label: 'Diplomatic Missions & Embassies', description: 'Explore cultural dialogue and possible delegation participation.' },
  { value: 'public-institutions', label: 'Governments & Public Institutions', description: 'Share public initiatives and explore international cooperation.' },
  { value: 'cultural-communities', label: 'Cultural Associations & Communities', description: 'Bring your heritage, traditions and community stories.' },
  { value: 'artists-performers', label: 'Artists & Performers', description: 'Propose music, dance, art or a cultural performance.' },
  { value: 'businesses', label: 'Businesses & Entrepreneurs', description: 'Introduce businesses, products and collaboration ideas.' },
  { value: 'creative-industries', label: 'Fashion & Creative Industries', description: 'Share design and craft as expressions of cultural identity.' },
  { value: 'technology', label: 'Technology & Innovation Companies', description: 'Present innovations and ideas that can connect communities.' },
  { value: 'tourism-hospitality', label: 'Tourism & Hospitality Organisations', description: 'Share destinations, gastronomy and hospitality traditions.' },
  { value: 'humanitarian', label: 'NGOs & Humanitarian Organisations', description: 'Discuss community initiatives and potential impact collaborations.' },
  { value: 'media', label: 'Media & Communication Partners', description: 'Propose storytelling, interviews and cultural coverage.' },
] as const;

export function getGalaCategory(value: unknown) {
  return GALA_PARTICIPATION_CATEGORIES.find((category) => category.value === value);
}

export function getGalaInquiryContext(value: unknown) {
  return `The One Diplomatic Gala — expression of interest\nProposed participation category: ${getGalaCategory(value)?.label ?? 'Not selected'}\nSubmission is not a confirmed booking or official national representation.\n\n`;
}

export type GeneralInquiryIntent = keyof typeof INQUIRY_INTENTS;
export type InquiryIntent = GeneralInquiryIntent | 'programme-service' | undefined;

export function getInquiryDefinition(intent: unknown) {
  return typeof intent === 'string' && Object.hasOwn(INQUIRY_INTENTS, intent)
    ? INQUIRY_INTENTS[intent as GeneralInquiryIntent]
    : undefined;
}

export function isGeneralInquiryIntent(intent: string | null): intent is GeneralInquiryIntent {
  return getInquiryDefinition(intent) !== undefined;
}
