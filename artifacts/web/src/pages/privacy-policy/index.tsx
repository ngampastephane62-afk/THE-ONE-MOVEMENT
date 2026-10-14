import { Helmet } from 'react-helmet-async';
import LegalPageFrame, {
  LegalList,
  LegalSection,
} from '@/components/LegalPageFrame';

const privacyRequestHref = '/join?request=privacy#institutional-inquiry';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta
          name="description"
          content="How The One Movement International handles information submitted through its public Join and institutional inquiry pathways."
        />
        <meta property="og:title" content="Privacy Policy — THE ONE MOVEMENT INTERNATIONAL" />
        <meta
          property="og:description"
          content="How The One Movement International handles information submitted through its public Join and institutional inquiry pathways."
        />
      </Helmet>

      <LegalPageFrame
        eyebrow="PRIVACY & TRUST"
        title="HOW WE HANDLE INFORMATION."
        intro="This Privacy Policy explains how the website handles member accounts, ecosystem profiles, saved resources, expressions of interest and institutional inquiries."
      >
        <LegalSection id="overview" title="1. Overview">
          <p>
            This policy applies to the public website of The One Movement
            International, its member space and its public submission pathways.
            It describes the information the website receives,
            why it is used, and the choices available to people who submit it.
          </p>
          <p>
            Creating a member account provides a personal ecosystem workspace.
            An expression-of-interest or inquiry form does not create that account.
            The website does not process payments, provide a wallet or marketplace,
            or guarantee paid membership or programme participation.
          </p>
        </LegalSection>

        <LegalSection id="operator" title="2. Who operates the website">
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
        </LegalSection>

        <LegalSection id="information" title="3. Information we collect">
          <p>
            The website collects the information needed to receive, review,
            respond to, and administer the relevant submission.
          </p>
          <p>
            Member authentication is handled by Clerk, including sign-in details,
            email verification and essential session cookies. Member profiles store
            the name, profession, selected sectors and optional organization,
            country, biography, website, offering and interests you provide.
            Saved programmes and resources are private to your account.
          </p>
          <p>
            Profiles are private by default. If you enable public visibility, those
            profile fields appear in the ecosystem showcase. Your login email,
            authentication identifier and saved items are not included in that showcase.
            You can edit your profile or switch public visibility off in your member space.
          </p>
          <p>An expression of interest may include:</p>
          <LegalList>
            <li>full name, email address, country and optional city;</li>
            <li>the selected joining path, audience group and category;</li>
            <li>optional primary and additional sector interests;</li>
            <li>optional program interests and what the person is looking for;</li>
            <li>
              organization name and contact role when an organization is
              selected; and
            </li>
            <li>notification preferences and the submitted consent record.</li>
          </LegalList>
          <p>An institutional inquiry may include:</p>
          <LegalList>
            <li>organization name, organization type, country and optional city;</li>
            <li>organization website when provided;</li>
            <li>contact person name, role and email address;</li>
            <li>the message sent to the Movement; and</li>
            <li>the submitted consent record.</li>
          </LegalList>
          <p>
            The forms also process limited technical and security information
            needed to operate the service, prevent abuse and troubleshoot
            requests. This can include request timing, route, response status,
            network information used for rate limiting, and operational request
            identifiers. Form bodies are not intentionally written to
            application request logs.
          </p>
        </LegalSection>

        <LegalSection id="use" title="4. How we use information">
          <LegalList>
            <li>to review and respond to expressions of interest;</li>
            <li>to review and respond to institutional inquiries;</li>
            <li>
              to contact people about their submission, official Movement
              updates, and selected future opportunities where the form
              preference permits it;
            </li>
            <li>to administer the current submission workflow and its records;</li>
            <li>to provide sign-in, save your ecosystem preferences and bookmarks, and show relevant programmes and official resources;</li>
            <li>to display a community profile only when you explicitly enable its public visibility;</li>
            <li>to protect the website, limit abusive traffic and investigate errors; and</li>
            <li>to comply with applicable legal obligations or protect rights and safety.</li>
          </LegalList>
          <p>
            A submission is an expression of interest or an inquiry only. It is
            not an account application, membership guarantee, employment offer,
            partnership approval or promise that a program opportunity will be
            available.
          </p>
        </LegalSection>

        <LegalSection id="consent" title="5. Consent and preferences">
          <p>
            Both public forms require an affirmative consent checkbox before a
            submission can be sent. The current application records the consent
            decision together with the consent version{' '}
            <strong>join-stage1-v1</strong> so the version shown at submission
            can be identified later.
          </p>
          <p>
            Consent is used for the purposes described in the relevant form and
            this policy. A person may ask to withdraw consent, subject to
            applicable law and any processing that must continue for legal,
            security or recordkeeping reasons.
          </p>
        </LegalSection>

        <LegalSection id="requests" title="6. Privacy requests">
          <p>
            You may request access to, correction of, or deletion of
            information submitted through the website. You may also ask to
            withdraw consent. Requests may be limited where applicable law
            permits or requires particular information to be kept.
          </p>
          <p>
            Until a dedicated privacy contact channel exists, these requests
            are handled through the existing institutional inquiry pathway.
            Identify the request as a privacy or data-rights request and
            provide enough context for the operator to locate it. The operator
            may need to verify the request before acting on it.
          </p>
          <div className="mt-7 border-s-4 border-gold-500 bg-white px-6 py-6 shadow-xs">
            <p className="text-eyebrow text-gold-600">PRIVACY REQUESTS</p>
            <p className="mt-3 text-ink-700">
              Use the existing inquiry form to request access, correction,
              deletion or withdrawal of consent.
            </p>
            <a
              href={privacyRequestHref}
              className="mt-5 inline-flex items-center justify-center rounded-sm bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            >
              Make a privacy request
            </a>
          </div>
        </LegalSection>

        <LegalSection id="sharing" title="7. Sharing and infrastructure">
          <p>
            We do not sell personal information or share it with third parties
            for their advertising or marketing purposes. Information may be
            shared with people who need it to review and respond to the
            submission, or when disclosure is required to comply with law,
            protect the website, or protect rights and safety.
          </p>
          <p>
            The website relies on third-party infrastructure providers for
            services such as hosting, database operation, security and network
            delivery. Those providers may process information on behalf of the
            operator as needed to provide those services. Clerk provides account
            authentication and session management. Public profile fields are also
            visible to website visitors when you choose to publish them.
          </p>
          <p>
            Because infrastructure and the people reviewing submissions may be
            located in different countries, information may be processed outside
            the country from which it was submitted. The operator uses the
            operational and legal safeguards available for that processing.
          </p>
          <p>
            At the time of publication, the current public site has no
            intentionally configured advertising trackers or analytics tools.
            This statement does not cover a future service added after this
            policy is updated.
          </p>
        </LegalSection>

        <LegalSection id="retention" title="8. Retention">
          <p>
            Submission records are kept for as long as reasonably necessary to
            review and manage the relevant expression of interest or inquiry,
            communicate with the submitter, maintain operational and security
            records, comply with legal obligations, resolve disputes and
            enforce applicable terms.
          </p>
          <p>
            The current platform does not publish an automatic deletion
            schedule. When information is no longer reasonably needed, it will
            be deleted, anonymized or securely disposed of where practicable,
            subject to applicable legal and operational requirements.
          </p>
        </LegalSection>

        <LegalSection id="security" title="9. Security">
          <p>
            Current safeguards include HTTPS on the public deployment,
            server-side validation, required consent capture, restricted
            application request logging that omits form bodies, and
            per-process request-rate controls on the public submission
            endpoints.
          </p>
          <p>
            No internet transmission or storage system is completely risk-free.
            The operator continues to review reasonable safeguards appropriate
            to the current public submission service.
          </p>
        </LegalSection>

        <LegalSection id="children" title="10. Children and safeguarding">
          <p>
            The website is intended for a general audience and is not directed
            at children. Please do not submit personal information on behalf of
            a child unless you are authorized to do so and the submission is
            appropriate. If you believe information was submitted improperly,
            use the Privacy Requests pathway so it can be reviewed.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="11. Changes to this policy">
          <p>
            This policy may be updated when the website, submission flows,
            infrastructure or legal requirements change. The latest version
            will be published on this page with its updated date. Continued use
            of the website after an update means the published policy should be
            reviewed for current practices.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="12. Contact">
          <p>
            For privacy questions and data-rights requests, use the{' '}
            <a
              href={privacyRequestHref}
              className="font-medium text-lagoon-700 underline decoration-gold-500 underline-offset-4 hover:text-ink-900"
            >
              institutional inquiry pathway
            </a>
            . Until a dedicated privacy address exists, this is the official
            route for contacting the operator about information submitted
            through the public website.
          </p>
        </LegalSection>
      </LegalPageFrame>
    </>
  );
}
