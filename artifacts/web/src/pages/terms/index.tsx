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
          content="Terms for using The One Movement International public website and its current submission pathways."
        />
        <meta property="og:title" content="Terms of Use — THE ONE MOVEMENT INTERNATIONAL" />
        <meta
          property="og:description"
          content="Terms for using The One Movement International public website and its current submission pathways."
        />
      </Helmet>

      <LegalPageFrame
        eyebrow="TERMS OF USE"
        title="THE TERMS OF THIS PUBLIC SPACE."
        intro="These terms describe the website, the personal member workspace, public ecosystem profiles, and the expression-of-interest and institutional inquiry pathways."
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
            A member account lets you maintain an ecosystem profile and save programmes
            and official resources. It does not guarantee paid membership, partnership,
            investment access or a place at an event. Public community profiles are
            member-authored and are not verified endorsements by TOMI or its partners.
            Official external resources belong to their named publishers and are not
            TOMI-operated programmes. AI-generated service illustrations are not
            photographs of actual events or completed collaborations.
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
            yours, but you give the operator permission to receive, store,
            review and respond to it for the purposes described in the{' '}
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
