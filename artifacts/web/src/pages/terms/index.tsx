import { Helmet } from 'react-helmet-async';
import LegalPageFrame, {
  LegalList,
  LegalSection,
} from '@/components/LegalPageFrame';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Use — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta
          name="description"
          content="Terms for TOMI Network, member publications, official certifications, commercial packages and public inquiries."
        />
        <meta property="og:title" content="Terms of Use — THE ONE MOVEMENT INTERNATIONAL" />
        <meta
          property="og:description"
          content="Terms for TOMI Network, member publications, official certifications, commercial packages and public inquiries."
        />
      </Helmet>

      <LegalPageFrame
        eyebrow="TERMS OF USE"
        title="THE TERMS OF OUR SHARED SPACE."
        intro="These terms describe the public website, TOMI Network, member publications and discussions, official-status applications, commercial packages and inquiries."
      >
        <LegalSection id="operator" title="1. Operator and scope">
          <p>
            The One Movement International is operated by{' '}
            <strong>Tropik Agence FZE LLC</strong>, a Free Zone Entity (FZE
            LLC) registered in Ajman, United Arab Emirates.
          </p>
          <p>
            Commercial licence and registration number:{' '}
            <strong>2627815105888</strong>
            <br />
            Registered address:{' '}
            <strong>
              CWS-1V-226429, 26th Floor, Amber Gem Tower, Ajman, United Arab
              Emirates
            </strong>
          </p>
          <p>
            These terms apply to your use of the current public website and
            related pages, forms and links operated under The One Movement
            International name.
          </p>
        </LegalSection>

        <LegalSection id="website" title="2. What the website provides">
          <p>
            The website currently provides informational pages about the
            Movement, its vision, ecosystem, programs, news, partners and
            media pathways. It also provides:
          </p>
          <LegalList>
            <li>an expression-of-interest form for people who want to connect with the Movement; and</li>
            <li>an institutional inquiry form for organizations and institutions to contact the Movement.</li>
            <li>a verified-email member network with professional profiles, posts, media, follows and recipient-approved private discussions;</li>
            <li>applications for programme-specific official status and optional commercial packages, with payment after review and written agreement.</li>
          </LegalList>
          <p>
            Submitting a form does not create a member account, guarantee
            membership, confirm a partnership, reserve a place at an event,
            create an employment relationship, or activate access to a future
            platform.
          </p>
        </LegalSection>

        <LegalSection id="submissions" title="3. Submissions">
          <p>
            A member account lets you maintain an ecosystem profile, save resources
            and, after opting into TOMI Network, interact with other members.
            Email verification confirms access to an email address, not identity,
            professional qualifications or business legitimacy. Profiles and posts
            are member-authored and are not blanket endorsements by TOMI or its partners.
            Official certifications require a separate Founder decision and apply only
            to their stated role, programme and validity period.
            Official external resources belong to their named publishers and are not
            TOMI-operated programmes. AI-generated service illustrations are not
            photographs of actual events or completed collaborations.
          </p>
          <p>
            Annual designer and partnership packages are optional and separate from
            the free social account. Download the applicable official document and
            review the written agreement before paying. Event participation, media,
            travel and other deliverables remain subject to that agreement, confirmation,
            availability and any relevant selection. Sales, visas, investment outcomes
            and celebrity collaborations are not guaranteed. Custom packages require a
            specific quote. A checkout payment covers the agreed twelve-month term;
            it does not authorize automatic renewal. Renewal, cancellations, refunds
            and any taxes are governed by the applicable written terms and mandatory law.
          </p>
          <p>
            Founder approval and, where applicable, confirmed payment are separate
            requirements for an official commercial badge. Payment alone does not
            certify a business or grant official status. Capital investment proposals
            require separate legally validated documentation; the website does not
            sell equity or promise financial returns through checkout.
          </p>
          <p>
            Humanitarian collections are not active until a specific beneficiary,
            campaign terms, applicable authorization and payment-provider eligibility
            have been confirmed. A referenced collaborator is not automatically a
            recipient or participant in every campaign. No tax-deductibility or
            completed humanitarian outcome is implied.
          </p>
          <p>
            You are responsible for the accuracy and completeness of the
            information you submit and for updating it when it changes. You
            must have the authority to submit information for an organization
            or another person and must not impersonate someone else.
          </p>
          <p>
            Do not submit unlawful, abusive, threatening, misleading,
            defamatory, invasive or malicious content. Do not submit passwords,
            payment details, highly sensitive information or information that
            is not needed for the purpose of the relevant form.
          </p>
          <p>
            We may decline to process or respond to a submission that does not
            comply with these terms, applicable law or the purpose of the
            pathway.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="4. Acceptable use">
          <LegalList>
            <li>Use the website only for lawful purposes.</li>
            <li>Do not interfere with, probe, overload or attempt to bypass the website or its security controls.</li>
            <li>Do not introduce malware, automated abuse or content that infringes another person’s rights.</li>
            <li>Do not use website content or forms to send unsolicited advertising or fraudulent communications.</li>
            <li>Do not misrepresent an affiliation with the Movement, its operator, a partner or an institution.</li>
            <li>Upload only content you have the right and consent to share. Respect the displayed file formats and size limits.</li>
            <li>Do not harass members, evade blocks, send unwanted discussion requests or publish another person’s private information.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="intellectual-property" title="5. Intellectual property">
          <p>
            The website’s text, layout, visual treatment, graphics, logos and
            other materials are owned by or used by the operator with
            permission, unless a different source or rights holder is
            identified. You may view and share ordinary links to public pages
            for lawful, non-misleading purposes.
          </p>
          <p>
            Except where applicable law permits or the operator gives
            permission, you may not reproduce, adapt, sell, publish, scrape,
            or commercially exploit website materials. Your submission remains
             yours, but you give the operator the non-exclusive permission needed
             to store, deliver and display it to the audience you choose, and to
             review applications and reports for the purposes described in the{' '}
            <a
              href="/privacy-policy"
              className="font-medium text-lagoon-700 underline decoration-gold-500 underline-offset-4 hover:text-ink-900"
            >
              Privacy Policy
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="third-party" title="6. Third-party links and content">
          <p>
            The website may link to third-party websites, organizations or
            resources. Those links are provided for convenience and context.
            The operator does not control every third-party service and is not
            responsible for its content, availability, terms or privacy
            practices. Review the third party’s own terms before using it.
          </p>
          <p>
            References to programs, partners, institutions or media are
            informational and do not by themselves create an endorsement,
            contract, partnership or guarantee.
          </p>
        </LegalSection>

        <LegalSection id="advice" title="7. No professional advice">
          <p>
            Website content is general information about the Movement and its
            public activities. It is not legal, financial, investment, medical,
            immigration, security, employment or other professional advice.
            Obtain advice from a qualified professional before acting on a
            matter that requires it.
          </p>
        </LegalSection>

        <LegalSection id="availability" title="8. Availability and disclaimers">
          <p>
            We aim to keep the website useful and available, but pages,
            programs, content and submission pathways may change, pause or
            become unavailable. Information may be corrected or updated
            without advance notice.
          </p>
          <p>
            To the extent permitted by applicable law, the website and its
            content are provided on an “as available” basis without a guarantee
            that they will always be complete, current, uninterrupted, secure
            or free of errors. A submission does not guarantee a response or
            any future opportunity.
          </p>
        </LegalSection>

        <LegalSection id="liability" title="9. Liability">
          <p>
            To the extent permitted by applicable law, the operator is not
            liable for indirect, incidental, special, consequential or similar
            loss arising from use of, or inability to use, the website,
            third-party links, or information submitted through it.
          </p>
          <p>
            Nothing in these terms excludes or limits liability that cannot be
            excluded or limited under applicable law, including liability for
            matters where such limitation would be unlawful.
          </p>
        </LegalSection>

        <LegalSection id="updates" title="10. Updates and termination">
          <p>
            We may update these terms as the public website changes. The current
            version will be published on this page with its updated date. We
            may suspend or discontinue a page, form or the website where
            reasonably necessary for security, maintenance, legal or
            operational reasons.
          </p>
        </LegalSection>

        <LegalSection id="law" title="11. Applicable law">
          <p>
            These terms are governed by mandatory applicable law of the United
            Arab Emirates. Any dispute or proceeding is subject to the
            competent jurisdiction rules that apply under that law. This
            section does not state a specific court or arbitration clause.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="12. Contact">
          <p>
            For questions about these terms or the current website, use the{' '}
            <a
              href="/join#institutional-inquiry"
              className="font-medium text-lagoon-700 underline decoration-gold-500 underline-offset-4 hover:text-ink-900"
            >
              institutional inquiry pathway
            </a>
            . The operator will use the information submitted there to review
            and respond to the inquiry as described in the Privacy Policy.
          </p>
        </LegalSection>
      </LegalPageFrame>
    </>
  );
}
