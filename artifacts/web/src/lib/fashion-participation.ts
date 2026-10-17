import { PACKAGE_DEFINITIONS } from '@workspace/shared';

export const FASHION_CATEGORIES = [
  { value: 'designers-brands', label: 'Fashion Designers & Fashion Brands', description: 'Present collections, share your creative heritage and develop professional relationships.', benefits: ['Collection presentation considered for the confirmed programme', 'Annual designer package options', 'Exchange with fashion professionals and potential collaborators'], conditions: 'Collection selection, production arrangements and deliverables require review and written agreement.', designerPackages: true },
  { value: 'models-talent', label: 'Models & Talent', description: 'Express interest in castings, presentations and creative collaborations.', benefits: ['Casting consideration', 'Professional introductions', 'Portfolio opportunities within an agreed assignment'], conditions: 'Payment or membership never guarantees casting, runway selection or a particular assignment.', designerPackages: false },
  { value: 'accessories', label: 'Accessory Designers & Creators', description: 'Introduce jewellery, bags, footwear and craft-led accessories.', benefits: ['Product showcase proposals', 'Styling and collection collaborations', 'Craft and heritage storytelling'], conditions: 'Product presentation and any commercial terms are agreed separately. No sales are guaranteed.', designerPackages: false },
  { value: 'stylists-directors', label: 'Stylists & Creative Directors', description: 'Shape visual narratives, collection styling and creative direction.', benefits: ['Creative project proposals', 'Collaboration with designers and production teams', 'Knowledge-sharing opportunities'], conditions: 'Roles, credits, rights and deliverables depend on the selected project and contract.', designerPackages: false },
  { value: 'hair-makeup', label: 'Hair & Makeup Professionals', description: 'Bring technical expertise and inclusive beauty practice to the creative team.', benefits: ['Backstage team consideration', 'Practical demonstrations and skills exchange', 'Agreed professional credits'], conditions: 'Assignments, equipment, credits and image permissions are confirmed in writing.', designerPackages: false },
  { value: 'backstage-coordination', label: 'Backstage Managers & Event Coordinators', description: 'Coordinate people, timings and the practical delivery of presentations.', benefits: ['Operational project proposals', 'Production-team collaboration', 'Professional skills exchange'], conditions: 'Participation depends on production requirements, experience, availability and contractual terms.', designerPackages: false },
  { value: 'media-press', label: 'Media Partners & Press', description: 'Propose coverage, interviews and responsible fashion storytelling.', benefits: ['Accreditation requests', 'Interview proposals', 'Editorial collaboration discussions'], conditions: 'Accreditation, interviews and restricted access require approval. Payment does not guarantee publication or broadcasting.', designerPackages: false },
  { value: 'photography-video', label: 'Photographers & Videographers', description: 'Document collections, craft and people through an agreed visual brief.', benefits: ['Editorial and production proposals', 'Portfolio collaborations', 'Fashion-film and interview concepts'], conditions: 'Access, fees, usage rights, consent and deliverables must be agreed before an assignment.', designerPackages: false },
  { value: 'technical-production', label: 'Technical & Production Teams', description: 'Contribute lighting, sound, staging, video and technical production.', benefits: ['Technical scope discussions', 'Supplier and production collaborations', 'Demonstration proposals'], conditions: 'Work depends on the event requirements, a documented scope, safety arrangements and contractual terms.', designerPackages: false },
  { value: 'logistics-operations', label: 'Logistics & Event Operations', description: 'Support transport, collections, equipment and coordinated event delivery.', benefits: ['Operational service proposals', 'Logistics coordination discussions', 'Cross-border collaboration opportunities'], conditions: 'Participation depends on the required services, applicable regulations, scope of work and written terms.', designerPackages: false },
  { value: 'sponsors-partners', label: 'Brands, Sponsors & Commercial Partners', description: 'Explore a defined collaboration supporting fashion, knowledge and cultural exchange.', benefits: ['Partnership proposals', 'Agreed brand activations', 'Potential institutional or cross-sector introductions'], conditions: 'Sponsorship is separate from designer membership. No reach, introductions or independent media coverage are guaranteed.', designerPackages: false },
  { value: 'experts-educators', label: 'Experts, Educators & Fashion Schools', description: 'Help others learn through your expertise, research and practical teaching.', benefits: ['Propose workshops, demonstrations or mentoring', 'Share fashion heritage and professional skills', 'Explore collaboration with brands and communities'], conditions: 'Teaching proposals require review and programme confirmation. No course enrolment, qualification or teaching appointment is implied.', designerPackages: false },
] as const;

export function getFashionCategory(value: unknown) {
  return FASHION_CATEGORIES.find((item) => item.value === value);
}

export function getFashionInquiryContext(value: unknown) {
  return `The One Fashion Week International — participation enquiry\nProfessional category: ${getFashionCategory(value)?.label ?? 'Not selected'}\nApplication subject to review and written terms; no confirmed selection, assignment or payment.\n\n`;
}

// Presentation of the existing catalogue, not new commercial package records.
// Benefits are summarised from the supplied Membership Kit, pages 13–18.
const DETAILS = {
  'designer-silver': {
    runwayLooks: 'Up to 10', vipPasses: '1', exhibition: 'Not specified', travel: 'Not included',
    benefits: ['Eligibility for one runway opportunity, subject to confirmation', 'Hair and makeup according to event arrangements', 'Designated LED logo display and event-related content where applicable', 'Welcome Dinner invitation subject to capacity'],
    conditions: 'Runway selection and each deliverable require confirmation. The Store described in the kit is not yet operational.',
  },
  'designer-gold': {
    runwayLooks: 'Up to 15', vipPasses: '3', exhibition: 'Eligible, subject to confirmation', travel: 'Not included',
    benefits: ['Applicable Silver benefits', 'Exhibition-stand eligibility', 'Selected pop-up activations subject to availability', 'Opportunities to engage with buyers, brands and business guests'],
    conditions: 'No particular buyer meeting or sale is guaranteed. Event and exhibition availability are confirmed separately.',
  },
  'designer-gold-premium': {
    runwayLooks: 'Up to 15', vipPasses: '3', exhibition: 'Eligible, subject to confirmation', travel: 'Visa assistance, selected flights, six hotel nights and local transport — written terms apply',
    benefits: ['Applicable Gold benefits', 'Visa application assistance, subject to eligibility', 'Flight support on selected routes', 'Six nights of accommodation and local event-period transport'],
    conditions: 'Visa approval is never guaranteed. Travel, accommodation and transport depend on the written agreement and availability.',
  },
  'designer-diamond': {
    runwayLooks: 'Up to 20', vipPasses: '6', exhibition: 'Eligible, subject to confirmation', travel: 'Not included',
    benefits: ['Applicable Silver and Gold benefits', 'Designer spotlight subject to selection', 'Enhanced press and promotional opportunities', 'Panel speaking consideration subject to approval'],
    conditions: 'Diamond does not automatically include Gold Premium travel benefits. Editorial coverage and speaking selection are not guaranteed.',
  },
  'designer-platinum': {
    runwayLooks: 'Relevant lower-tier terms', vipPasses: 'Relevant lower-tier terms', exhibition: 'Premium-space consideration', travel: 'Not specified — confirm in writing',
    benefits: ['Applicable benefits from the relevant lower tiers, as agreed', 'Dubai desert fashion film subject to production planning', 'Full-page designated magazine feature subject to editorial approval', 'Agreed social-media deliverables and VIP cocktail invitation', 'Priority runway and premium exhibition-space consideration'],
    conditions: 'The precise lower-tier inclusions must be agreed in writing. Production, editorial approval and programme availability apply; no independent broadcast or investor meeting is guaranteed.',
  },
} as const;

export const DESIGNER_PACKAGES = PACKAGE_DEFINITIONS
  .filter((item) => item.audience === 'designer')
  .map((item) => ({
    ...item,
    name: item.name.replace(/^Designer · /, ''),
    currency: 'usd' as const,
    durationMonths: 12 as const,
    ...DETAILS[item.slug as keyof typeof DETAILS],
  }));

/** Only existing designer-package identifiers may cross the sign-in boundary. */
export function getDesignerApplicationPath(slug: unknown): string | undefined {
  const item = DESIGNER_PACKAGES.find((candidate) => candidate.slug === slug);
  return item ? `/member/certifications?package=${encodeURIComponent(item.slug)}&role=designer&program=fashion-week` : undefined;
}
