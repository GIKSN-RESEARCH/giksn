import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { AnalyticsControls } from "@/components/AnalyticsControls";

// ---------------------------------------------------------------------------
// Before launch, replace the following with real values verified by counsel:
//   • Registered legal entity name for GIKSN Research (currently referred to
//     as "GIKSN Research" — set to registered LLP/Pvt Ltd/Proprietorship name).
//   • Registered business address in India (§8(9) DPDPA implicitly requires
//     an identifiable Data Fiduciary; the grievance officer must be reachable).
//   • Grievance officer's full name (currently only the email is given).
//   • Website domain in canonical form (currently referenced by name only).
//   • If ever crossing DPDPA "Significant Data Fiduciary" designation or CCPA
//     revenue/consumer thresholds, revise §11 and §14 accordingly.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Privacy Policy. GIKSN Research",
  description:
    "How GIKSN Research collects, uses, and protects personal data. Written to comply with India's Digital Personal Data Protection Act 2023, the IT Rules 2021, California's CCPA/CPRA, and equivalent obligations.",
};

const EFFECTIVE_DATE = "2026-07-03";
const CONTACT_EMAIL = "research@giksn.com";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Masthead />
      <CategoryNav />
      <main className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <article className="grid grid-cols-12 gap-6 md:gap-10">
          <header className="col-span-12 pb-8 sm:pb-10 border-b border-rule">
            <div className="kicker mb-3">Terms &amp; policies</div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[20ch]"
              style={{ fontSize: "clamp(2rem, 6vw, 4.6rem)" }}
            >
              Privacy <span className="text-accent">Policy</span>.
            </h1>
            <p className="mt-5 sm:mt-7 max-w-[62ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
              What personal data GIKSN Research collects, why we collect it, and
              the rights you have over it. Written for compliance with India&apos;s
              Digital Personal Data Protection Act 2023, the IT Rules 2021, and
              California&apos;s CCPA and CPRA, with equivalent rights honoured for
              readers elsewhere.
            </p>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Effective date: {EFFECTIVE_DATE}
            </div>
          </header>

          <div className="col-span-12 md:col-span-8 pt-6 md:pt-8 prose-body">
            <h2>1. Who we are</h2>
            <p>
              GIKSN Research (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the
              lab&rdquo;) is the Data Fiduciary responsible for personal data
              processed through this platform. We are a research lab operating
              from India. General enquiries and privacy questions can be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Details
              of the grievance officer are in section 13.
            </p>

            <h2>2. What this policy covers</h2>
            <p>
              This policy covers personal data we collect when you read the
              archive, submit a paper or an update, comment under a paper,
              apply to contribute, or use the admin panel. It does not cover
              third-party websites we link to; those sites have their own
              policies.
            </p>

            <h2>3. Information we collect</h2>
            <p>
              We collect only what the platform actually needs to work, plus
              optional analytics that require your consent. We do not embed
              advertising trackers and we do not use behavioural profiling.
            </p>
            <ul>
              <li>
                <strong className="font-display">Submissions.</strong> When you
                submit a paper or an update, we collect the name you choose to
                credit, one contact handle (email, X, GitHub or Telegram, at
                your choice), the abstract and body you provide, and metadata
                such as the submission timestamp.
              </li>
              <li>
                <strong className="font-display">Comments.</strong> When you
                comment, we collect the display name, a public handle and the
                comment body. Comments are published publicly under the paper.
              </li>
              <li>
                <strong className="font-display">Admin accounts.</strong> For
                admin sign-in we store the admin&apos;s email and a scrypt hash of
                the admin&apos;s password. Passwords are never stored in plaintext
                and cannot be recovered by us.
              </li>
              <li>
                <strong className="font-display">Session cookie.</strong> After
                admin sign-in we set a single HttpOnly cookie called{" "}
                <code>giksn_admin</code>. It contains the admin email, an
                expiry timestamp and an HMAC signature, and nothing else. It is
                not a tracking cookie.
              </li>
              <li>
                <strong className="font-display">Server logs.</strong> Our
                hosting provider records standard request metadata such as IP
                address, user-agent and requested path for security, abuse
                prevention and debugging. Logs are retained for a rolling
                30 days.
              </li>
              <li>
                <strong className="font-display">
                  Analytics (only with your consent).
                </strong>{" "}
                If, and only if, you accept the analytics banner, we use
                Google Analytics to record aggregate usage: page views,
                referrer, screen size, approximate location derived from a
                truncated IP address, session identifier and interactions
                such as clicks and scrolls. See section 11 for what is set,
                how to withdraw consent and how the data is treated.
              </li>
            </ul>
            <p>
              We do not collect government-issued identifiers, precise
              geolocation, financial account details, biometric data,
              sex-life or sexual-orientation data, religion, health data or
              any other category defined as &ldquo;sensitive personal
              information&rdquo; under CCPA §1798.140(ae), and we do not
              process such categories.
            </p>

            <h2>4. How we use it</h2>
            <ul>
              <li>To display submissions and comments on the platform.</li>
              <li>To credit authors and contributors.</li>
              <li>To let editors reach contributors about their submissions.</li>
              <li>To authenticate admins.</li>
              <li>To secure the platform and investigate abuse.</li>
              <li>To meet legal and regulatory obligations.</li>
            </ul>

            <h2>5. Legal grounds for processing</h2>
            <p>
              Under the DPDPA 2023 we process personal data on the following
              grounds. Where CCPA / CPRA or another local law applies, we
              process for the equivalent business purpose.
            </p>
            <ul>
              <li>
                <strong className="font-display">Your consent</strong> for
                submissions, comments and application forms. You give consent
                by choosing to submit, and can withdraw it as described in
                section 10.
              </li>
              <li>
                <strong className="font-display">Legitimate uses</strong> under
                §7 of the DPDPA for admin authentication, session management
                and security logging.
              </li>
              <li>
                <strong className="font-display">Legal obligation</strong>{" "}
                where retention or disclosure is required by Indian law or
                other applicable law.
              </li>
            </ul>

            <h2>6. Sharing and disclosure</h2>
            <p>
              We do not sell personal data. We do not share personal data for
              cross-context behavioural advertising. Because we neither sell
              nor share personal information within the meaning of CCPA
              §1798.140, no &ldquo;Do Not Sell or Share&rdquo; link is required
              or offered.
            </p>
            <p>
              We disclose personal data only in three narrow situations:
            </p>
            <ul>
              <li>
                <strong className="font-display">Processors.</strong> We use
                Neon (managed Postgres hosted in the United States) for the
                database, and we may use email delivery infrastructure for
                transactional messages. These processors act on our written
                instructions and cannot use the data for their own purposes.
              </li>
              <li>
                <strong className="font-display">Analytics processor.</strong>{" "}
                Where you have granted analytics consent, Google LLC
                processes analytics data on our behalf through Google
                Analytics 4, with advertising features and Google Signals
                explicitly disabled by us. See section 11 for details.
              </li>
              <li>
                <strong className="font-display">Legal disclosure.</strong>{" "}
                Where required by a lawful order of a court or a competent
                authority, or to defend our legal rights.
              </li>
              <li>
                <strong className="font-display">Public content.</strong>{" "}
                Anything you publish under a paper (your name, handle,
                comments, abstract, body) is public by design.
              </li>
            </ul>

            <h2>7. Cross-border transfers</h2>
            <p>
              Our database is operated by Neon, a service provider based in
              the United States. Where you have granted analytics consent,
              usage data is processed by Google LLC on servers operated by
              Google in the United States and other Google regions.
              Processing personal data on servers outside India involves a
              cross-border transfer. Under §16 of the DPDPA, such transfers
              are permitted unless the Central Government specifically
              restricts a destination country by notification. As at the
              effective date, transfers to the United States are not
              restricted. If a restriction is later notified we will adjust
              our processing accordingly.
            </p>

            <h2>8. Retention</h2>
            <ul>
              <li>
                <strong className="font-display">Public content.</strong>{" "}
                Papers, comments and the associated author metadata are
                retained for as long as the entry remains published. On
                request from the author, we will remove or anonymise the
                entry unless retention is required by law.
              </li>
              <li>
                <strong className="font-display">Admin accounts.</strong>{" "}
                Retained while active. Deleted on written request or when the
                account is no longer needed.
              </li>
              <li>
                <strong className="font-display">Session cookies.</strong>{" "}
                Expire 30 days after issue. Cleared on sign-out.
              </li>
              <li>
                <strong className="font-display">Server logs.</strong> Rolling
                30-day retention, then automatically deleted.
              </li>
              <li>
                <strong className="font-display">Backups.</strong> Encrypted
                database backups may persist for up to 90 days before being
                overwritten.
              </li>
              <li>
                <strong className="font-display">Analytics data.</strong>{" "}
                Google Analytics data is retained for 2 months from
                collection, the shortest option Google offers, after which
                Google deletes it automatically. Aggregate metrics that no
                longer identify individuals may persist in reports.
              </li>
            </ul>

            <h2>9. Security</h2>
            <p>
              We serve the platform over HTTPS. Admin passwords are stored as
              scrypt hashes. Session cookies are HMAC-signed and marked
              HttpOnly. Database credentials and session secrets are held in
              environment variables, not committed to code. Access to
              production data is limited to admins. No online system is
              perfectly secure; if you believe your data has been compromised
              please contact us at once.
            </p>

            <h2>10. Your rights</h2>

            <h3>10.1 Rights under the DPDPA (India)</h3>
            <ul>
              <li>
                <strong className="font-display">Right to access (§11).</strong>{" "}
                Ask for a summary of the personal data we hold about you and
                how we process it.
              </li>
              <li>
                <strong className="font-display">
                  Right to correction and erasure (§12).
                </strong>{" "}
                Ask us to correct, complete, update or erase your personal
                data, subject to overriding legal obligations.
              </li>
              <li>
                <strong className="font-display">
                  Right of grievance redressal (§13).
                </strong>{" "}
                Raise a grievance with the grievance officer named in
                section 13 before approaching the Data Protection Board.
              </li>
              <li>
                <strong className="font-display">
                  Right to nominate (§14).
                </strong>{" "}
                Nominate another individual to exercise your rights in the
                event of your death or incapacity.
              </li>
            </ul>
            <p>
              Requests should be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We
              respond within a reasonable period and, in any event, within
              30 days of a valid request.
            </p>

            <h3>10.2 Rights for California residents (CCPA / CPRA)</h3>
            <p>
              We voluntarily honour the CCPA / CPRA rights for California
              residents, whether or not statutory thresholds strictly apply
              to us.
            </p>
            <ul>
              <li>Right to know what personal information we hold and how we use it.</li>
              <li>Right to delete personal information subject to permitted exceptions.</li>
              <li>Right to correct inaccurate personal information.</li>
              <li>
                Right to opt out of sale or sharing for cross-context
                behavioural advertising. We do neither.
              </li>
              <li>
                Right to limit use of sensitive personal information. We do
                not process such information (see section 3).
              </li>
              <li>Right to non-discrimination for exercising any of the above.</li>
              <li>Right to data portability where reasonably feasible.</li>
            </ul>
            <p>
              Requests may be made to the same email address. We confirm
              receipt within 10 business days and respond substantively
              within 45 days, with a one-time 45-day extension available
              where reasonably necessary, in line with §1798.130.
            </p>

            <h3>10.3 Rights elsewhere</h3>
            <p>
              Where you are protected by another data protection law
              (including UK GDPR, the EU GDPR, or a US state privacy statute
              such as the Virginia CDPA, Colorado CPA, Connecticut CTDPA or
              Utah UCPA) we will treat your request as an exercise of the
              equivalent right under that law.
            </p>

            <h2>11. Cookies and analytics</h2>

            <h3>11.1 Session cookie</h3>
            <p>
              The site sets one first-party cookie, <code>giksn_admin</code>,
              only after an administrator signs in. It stores the admin
              email, an expiry timestamp and an HMAC signature. It is
              HttpOnly, secure and marked SameSite. It is not a tracking
              cookie.
            </p>

            <h3>11.2 Analytics (consent-gated)</h3>
            <p>
              We use Google Analytics to understand which papers are read
              and where readers arrive from. Google Analytics is not loaded
              until you accept the analytics banner. Nothing is written to
              your browser and no data leaves your device until then.
            </p>
            <p>What we configure:</p>
            <ul>
              <li>
                <strong className="font-display">Anonymised IP addresses</strong>{" "}
                (<code>anonymize_ip: true</code>), so full IPs are truncated
                before storage.
              </li>
              <li>
                <strong className="font-display">Google Signals disabled</strong>{" "}
                (<code>allow_google_signals: false</code>), so your GA data
                is not joined with cross-site behavioural data Google holds
                about you.
              </li>
              <li>
                <strong className="font-display">
                  Advertising personalisation disabled
                </strong>{" "}
                (<code>allow_ad_personalization_signals: false</code>), so
                the data is not used to build ad audiences.
              </li>
              <li>
                <strong className="font-display">Consent Mode v2</strong>{" "}
                initialised with <code>ad_storage</code>,{" "}
                <code>ad_user_data</code> and <code>ad_personalization</code>{" "}
                all denied.
              </li>
              <li>
                <strong className="font-display">2-month retention</strong>{" "}
                in the GA property, the shortest option Google offers.
              </li>
            </ul>
            <p>Cookies set by Google Analytics if you accept:</p>
            <ul>
              <li>
                <code>_ga</code> and <code>_ga_&lt;property-id&gt;</code> for
                session and user identification.
              </li>
            </ul>
            <p>
              Legal basis: your consent under §7 of the DPDPA and Article 6
              of the UK / EU GDPR. Business purpose under §1798.140 of the
              CCPA. We do not sell or share this data for cross-context
              behavioural advertising within the meaning of §1798.140.
            </p>

            <h3>11.3 Manage your preference</h3>
            <p>
              You can turn analytics on or off at any time from the controls
              below. Turning it off stops further collection and prevents
              Google Analytics from loading. Any GA cookies already set can be cleared
              from your browser&apos;s cookie settings.
            </p>
            <div className="not-prose my-5 border border-rule p-4 bg-tint/50">
              <div className="kicker mb-2">Your analytics preference</div>
              <AnalyticsControls />
            </div>

            <h2>12. Children</h2>
            <p>
              The service is intended for researchers, builders and readers
              aged 18 or above. Under §9 of the DPDPA the age threshold for a
              &ldquo;child&rdquo; is 18. The service is not directed to
              children within the meaning of §312 of the US Children&apos;s
              Online Privacy Protection Act. We do not knowingly collect
              personal data from anyone under 18. If we learn that we have,
              we will delete it. If you believe a child has provided personal
              data, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>

            <h2>13. Grievance mechanism</h2>
            <p>
              Under §8(9) of the DPDPA and Rule 3(2) of the IT Rules 2021 we
              publish contact details of the officer who handles data-privacy
              and content grievances.
            </p>
            <ul>
              <li>
                <strong className="font-display">Grievance Officer.</strong>{" "}
                Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </li>
              <li>
                <strong className="font-display">Acknowledgement.</strong>{" "}
                We acknowledge complaints within 24 hours of receipt as
                required by Rule 3(2)(a).
              </li>
              <li>
                <strong className="font-display">Resolution.</strong> We
                dispose of complaints within 15 days as required by Rule
                3(2)(a). Complaints concerning non-consensual intimate
                imagery or impersonation are actioned within 24 hours.
              </li>
              <li>
                <strong className="font-display">Escalation.</strong> If you
                are not satisfied with our response you may complain to the
                Data Protection Board of India under §13 of the DPDPA.
              </li>
            </ul>

            <h2>14. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The effective date
              at the top of the page will change when we do. Material
              changes will be announced on the site.
            </p>

            <h2>15. Contact</h2>
            <p>
              Privacy questions, rights requests and grievances all reach us
              at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </div>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-8 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">At a glance</div>
            <dl className="space-y-4 font-mono text-[12px]">
              <MetaBlock term="Effective date" value={EFFECTIVE_DATE} />
              <MetaBlock term="Data Fiduciary" value="GIKSN Research" />
              <MetaBlock term="Grievance officer" value={CONTACT_EMAIL} />
              <MetaBlock
                term="Ack window"
                value="24 hours (IT Rules 2021)"
              />
              <MetaBlock
                term="Resolution window"
                value="15 days (IT Rules 2021)"
              />
              <MetaBlock
                term="DPDPA response"
                value="Within 30 days"
              />
              <MetaBlock
                term="CCPA response"
                value="Within 45 days"
              />
              <MetaBlock
                term="Analytics"
                value="Google Analytics (opt-in only)"
              />
              <MetaBlock term="Ad networks" value="None" />
              <MetaBlock term="Data sold" value="None" />
              <MetaBlock
                term="Data shared for ads"
                value="None"
              />
            </dl>

            <div className="mt-8 divider-dashed" />

            <div className="kicker mt-8 mb-3">On this page</div>
            <ul className="space-y-1.5 text-[13px]">
              {[
                ["Who we are", "1"],
                ["What this policy covers", "2"],
                ["Information we collect", "3"],
                ["How we use it", "4"],
                ["Legal grounds", "5"],
                ["Sharing and disclosure", "6"],
                ["Cross-border transfers", "7"],
                ["Retention", "8"],
                ["Security", "9"],
                ["Your rights", "10"],
                ["Cookies and analytics", "11"],
                ["Children", "12"],
                ["Grievance mechanism", "13"],
                ["Changes", "14"],
                ["Contact", "15"],
              ].map(([label, n]) => (
                <li key={n} className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-accent tracking-[0.16em] shrink-0 w-5">
                    {n}
                  </span>
                  <span className="text-ink-soft">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 divider-dashed" />

            <div className="mt-8">
              <Link
                href="/terms"
                className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em]"
              >
                Read the Terms of Use →
              </Link>
            </div>
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}

function MetaBlock({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 border-b border-rule-soft pb-2">
      <dt className="text-ink-faint uppercase tracking-[0.12em] shrink-0 max-w-[16ch]">
        {term}
      </dt>
      <dd className="text-ink text-right normal-case tracking-normal font-body text-[13px] min-w-0 break-all leading-tight">
        {value}
      </dd>
    </div>
  );
}
