import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";

// ---------------------------------------------------------------------------
// Before launch, replace or verify:
//   • Registered legal entity for GIKSN Research and its jurisdiction of
//     incorporation (currently referred to as "GIKSN Research").
//   • Registered address in India (needed for service of legal notice).
//   • Grievance Officer's full name (only the email is given for now).
//   • DMCA Designated Agent registration with the US Copyright Office
//     (§512(c)(2)) — necessary before relying on §512 safe harbour.
//   • City / court to be named as the exclusive forum in §14 (currently
//     drafted as "the courts of the city in which the lab is registered"
//     as a placeholder).
//   • Aggregate liability cap in §12 — currently INR 1,000 or the amount
//     paid in the last 12 months, whichever is greater.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Terms of Use — GIKSN Research",
  description:
    "The terms on which readers, contributors, and administrators use GIKSN Research. Covers submissions, third-party citation, copyright notices under India's IT Rules 2021 and the US DMCA, and dispute resolution.",
};

const EFFECTIVE_DATE = "2026-07-03";
const CONTACT_EMAIL = "research@giksn.com";

export default function TermsOfUsePage() {
  return (
    <>
      <Masthead />
      <CategoryNav />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <article className="grid grid-cols-12 gap-6 md:gap-10">
          <header className="col-span-12 pb-8 sm:pb-10 border-b border-rule">
            <div className="kicker mb-3">Terms &amp; policies</div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[22ch]"
              style={{ fontSize: "clamp(2rem, 6vw, 4.6rem)" }}
            >
              Terms of <span className="text-accent">Use</span>.
            </h1>
            <p className="mt-5 sm:mt-7 max-w-[62ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
              What you can and cannot do on GIKSN Research, how we handle
              submissions, how we treat citations of third-party research
              from platforms such as arXiv, and how we deal with copyright
              notices. Written for compliance with India&apos;s IT Rules 2021, the
              Copyright Act 1957, and the US Digital Millennium Copyright
              Act.
            </p>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Effective date: {EFFECTIVE_DATE}
            </div>
          </header>

          <div className="col-span-12 md:col-span-8 pt-6 md:pt-8 prose-body">
            <h2>1. Acceptance</h2>
            <p>
              By accessing or using GIKSN Research (&ldquo;the platform&rdquo;)
              you agree to these Terms of Use (&ldquo;these Terms&rdquo;) and
              to our{" "}
              <Link href="/privacy" className="link-underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the platform.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally competent to
              enter into a binding contract. §9 of India&apos;s Digital Personal
              Data Protection Act 2023 defines a &ldquo;child&rdquo; as an
              individual below 18. Access to the platform is intended for
              researchers, builders and readers who meet this threshold. If
              you access the platform on behalf of an organisation you
              warrant that you have authority to bind that organisation to
              these Terms.
            </p>

            <h2>3. What the service is</h2>
            <p>
              GIKSN Research is a community-first research lab and editorial
              archive. Readers may view published papers, updates and product
              pages without an account. Contributors may submit papers,
              updates and comments subject to editorial review. Admins may
              manage content through a sign-in-gated admin panel. The
              platform is provided free of charge for reading; contribution
              is gated.
            </p>

            <h2>4. Accounts and access</h2>
            <ul>
              <li>
                <strong className="font-display">Admin accounts</strong> are
                created by the lab and secured with an email address and a
                scrypt-hashed password. You are responsible for keeping your
                credentials confidential.
              </li>
              <li>
                <strong className="font-display">Contributor submissions</strong>{" "}
                are made through the public submission form. You must
                provide a contact handle (email, X, GitHub or Telegram) so
                editors can reach you.
              </li>
              <li>
                <strong className="font-display">Suspension.</strong> We may
                suspend or terminate access for violations of these Terms,
                for security reasons or where required by law.
              </li>
            </ul>

            <h2>5. Submissions and licence</h2>
            <p>
              You retain copyright in the papers, updates and comments you
              submit (&ldquo;Submissions&rdquo;). To let us operate the
              platform, you grant GIKSN Research a non-exclusive, worldwide,
              royalty-free, sublicensable licence to host, store, reproduce,
              display, distribute, index and edit for clarity your
              Submissions on and in connection with the platform.
            </p>
            <p>You warrant that:</p>
            <ul>
              <li>You own the copyright in your Submissions, or have all necessary rights to grant the licence above.</li>
              <li>Your Submissions do not infringe any third-party right, including copyright, trademark, privacy, publicity or contractual rights.</li>
              <li>Your Submissions comply with applicable law.</li>
              <li>The credit and contact information you provide is accurate.</li>
            </ul>
            <p>
              You may ask us to remove or anonymise a Submission at any
              time. We will honour the request unless retention is required
              by law or is necessary to preserve an existing discussion
              thread whose contributors have relied on the Submission.
            </p>

            <h2>6. Third-party research and citations</h2>
            <p>
              The lab publishes commentary, surveys and blog-style writing
              that discusses existing research, including preprints on
              arXiv.org and other public research repositories. We rely on
              the following legal grounds and self-impose the following
              limits.
            </p>
            <ul>
              <li>
                <strong className="font-display">United States.</strong>{" "}
                Commentary, criticism, teaching and scholarship are
                expressly favoured purposes under 17 U.S.C. §107. Our
                quotation of third-party research is limited to what is
                reasonably necessary for the commentary and does not
                reproduce the underlying work in full.
              </li>
              <li>
                <strong className="font-display">India.</strong>{" "}
                Reproduction for private and personal use including
                research, criticism, review and reporting current events is
                permitted under §52(1)(a) of the Copyright Act 1957. Bona
                fide instructional use is permitted under §52(1)(h). Our
                quotation stays within the &ldquo;fair dealing&rdquo;
                boundary set by these provisions.
              </li>
              <li>
                <strong className="font-display">arXiv content.</strong>{" "}
                Authors submit to arXiv under one of a set of licences
                (arXiv&apos;s default non-exclusive licence, CC BY, CC BY-SA,
                CC BY-NC-SA, or CC0). Copyright remains with the author.
                We quote and comment on arXiv preprints without
                reproducing the full paper unless the author&apos;s selected
                licence permits redistribution.
              </li>
              <li>
                <strong className="font-display">Attribution.</strong>{" "}
                Every reference includes attribution to the author and a
                link back to the source where a stable URL exists.
              </li>
              <li>
                <strong className="font-display">Removal on request.</strong>{" "}
                If you are an author or rightsholder and you believe our
                quotation exceeds fair use or fair dealing, contact us as
                described in section 7 and we will review the specific
                material promptly.
              </li>
            </ul>

            <h2>7. Copyright notices and takedown</h2>

            <h3>7.1 India — IT Rules 2021 grievance mechanism</h3>
            <p>
              Under Rule 3(2) of the IT Rules 2021 we operate a grievance
              mechanism. Notices should be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
              include the specific URL of the material, a description of
              the right allegedly infringed, and your contact details.
            </p>
            <ul>
              <li>
                We acknowledge receipt within 24 hours of the notice as
                required by Rule 3(2)(a).
              </li>
              <li>
                We dispose of the complaint within 15 days as required by
                Rule 3(2)(a).
              </li>
              <li>
                Complaints concerning non-consensual intimate imagery,
                impersonation or morphed images are actioned within 24
                hours.
              </li>
              <li>
                On actual knowledge of unlawful content through a court
                order or a lawful notification from a competent authority we
                remove or disable access within 36 hours as required by
                Rule 3(1)(d).
              </li>
            </ul>

            <h3>7.2 United States — DMCA §512 takedown</h3>
            <p>
              For copyrighted work under US law, notices should be sent to
              our copyright agent at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. A
              valid notice under 17 U.S.C. §512(c)(3) must contain:
            </p>
            <ul>
              <li>A physical or electronic signature of the person authorised to act on behalf of the owner.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material claimed to be infringing and information reasonably sufficient to locate it on the platform.</li>
              <li>Your contact information (name, address, phone, email).</li>
              <li>A statement of good-faith belief that the use is not authorised by the copyright owner, its agent or the law.</li>
              <li>
                A statement made under penalty of perjury that the
                information in the notification is accurate and that you
                are the owner or authorised to act on behalf of the owner.
              </li>
            </ul>

            <h3>7.3 Counter-notice</h3>
            <p>
              If your content is removed and you believe the removal was
              a mistake or a misidentification, you may send a counter-
              notice meeting the requirements of §512(g)(3). We will
              restore the material in 10 to 14 business days after
              receipt, unless the original complainant notifies us that a
              court action has been filed seeking to restrain the alleged
              infringement.
            </p>

            <h3>7.4 Repeat infringers</h3>
            <p>
              We terminate the accounts and remove the content of
              contributors who are found to be repeat infringers, in line
              with the safe-harbour condition in §512(i).
            </p>

            <h2>8. Prohibited use</h2>
            <p>You must not use the platform to:</p>
            <ul>
              <li>Publish content that is unlawful, defamatory, obscene, harassing, threatening or hateful.</li>
              <li>Infringe any copyright, trademark, trade secret, privacy, publicity or contractual right.</li>
              <li>Impersonate any person or misrepresent your affiliation.</li>
              <li>Publish personal information about other people without their consent.</li>
              <li>Distribute malware, exploit code intended for unauthorised access, or attempt to gain unauthorised access to the platform, other users&apos; accounts or the underlying infrastructure.</li>
              <li>Scrape at a scale that degrades service for other readers, or bypass rate limits.</li>
              <li>Interfere with the moderation or grievance mechanism.</li>
              <li>Use the platform to spam or advertise commercial products unrelated to the research being discussed.</li>
              <li>Violate any applicable law in India, in the country from which you access the service, or in the United States for so far as the DMCA obligations described above apply.</li>
            </ul>

            <h2>9. Content moderation</h2>
            <p>
              Editors read Submissions for clarity and structural fit, not
              for opinion. We may edit for typography, formatting,
              punctuation and clarity, and we may reject or remove content
              that violates these Terms. Discussion under a paper is
              preserved verbatim, except where moderation removes a specific
              comment, in which case a short placeholder is left in the
              thread with a one-line reason.
            </p>

            <h2>10. No warranty</h2>
            <p>
              The platform is provided on an &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo; basis. To the maximum extent
              permitted by law, we disclaim all warranties, express or
              implied, including warranties of merchantability, fitness for
              a particular purpose, non-infringement and quiet enjoyment.
              We do not warrant that the platform will be uninterrupted or
              error-free. Papers reflect the views of their authors and
              not necessarily those of the lab.
            </p>

            <h2>11. Availability</h2>
            <p>
              We do not guarantee any specific uptime. We may pause the
              platform for maintenance, security or infrastructure
              migration without prior notice.
            </p>

            <h2>12. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, GIKSN
              Research and its personnel are not liable for indirect,
              incidental, special, consequential, exemplary or punitive
              damages, or for loss of profits, revenue, data, goodwill or
              anticipated savings, arising out of or in connection with
              your use of the platform, whether based on contract, tort,
              statute or otherwise. Our aggregate liability under or in
              connection with these Terms is capped at the greater of
              (a) any amount you have paid to us in the twelve months
              preceding the event giving rise to the claim, and
              (b) INR 1,000. Nothing in these Terms limits liability
              which cannot lawfully be limited, including for fraud,
              gross negligence, wilful misconduct or personal injury
              caused by negligence.
            </p>

            <h2>13. Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless GIKSN Research
              against any claim, demand, loss or expense (including
              reasonable legal fees) arising from your Submissions, your
              use of the platform, or your breach of these Terms or of any
              third-party right.
            </p>

            <h2>14. Governing law and dispute resolution</h2>
            <p>
              These Terms are governed by the laws of the Republic of
              India, without regard to conflict-of-laws rules. Any
              dispute, controversy or claim arising out of or in
              connection with these Terms will be referred to and finally
              resolved by arbitration under the Arbitration and
              Conciliation Act 1996. The seat and venue of arbitration
              will be in India. The arbitral tribunal will consist of a
              single arbitrator. The language of arbitration will be
              English. Subject to arbitration, the courts of the city in
              which the lab is registered will have exclusive jurisdiction.
            </p>
            <p>
              Nothing in this section prevents either party from seeking
              interim or injunctive relief before any competent court to
              protect its intellectual property or confidential
              information.
            </p>

            <h2>15. Termination</h2>
            <p>
              We may suspend or terminate your access to the platform at
              any time if you breach these Terms or if suspension is
              required for legal or security reasons. The following
              sections survive termination: 5 (in respect of the licence
              you granted for content already published), 7, 8, 10, 12,
              13, 14 and 17.
            </p>

            <h2>16. Changes to these Terms</h2>
            <p>
              We may modify these Terms from time to time. The effective
              date at the top of the page will change when we do. If a
              change materially reduces your rights we will announce the
              change on the site before it takes effect. Your continued
              use of the platform after the effective date of a change
              constitutes acceptance of the updated Terms.
            </p>

            <h2>17. Miscellaneous</h2>
            <ul>
              <li>
                <strong className="font-display">Entire agreement.</strong>{" "}
                These Terms, together with the Privacy Policy, form the
                entire agreement between you and GIKSN Research relating
                to the platform.
              </li>
              <li>
                <strong className="font-display">Severability.</strong> If
                any provision is held unenforceable, the remaining
                provisions remain in effect.
              </li>
              <li>
                <strong className="font-display">No waiver.</strong> Our
                failure to enforce a provision is not a waiver of that
                provision.
              </li>
              <li>
                <strong className="font-display">Assignment.</strong> You
                may not assign or transfer these Terms without our written
                consent. We may assign these Terms on notice to you.
              </li>
              <li>
                <strong className="font-display">Notices.</strong> Legal
                notices to us should be sent to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </li>
            </ul>

            <h2>18. Contact</h2>
            <p>
              Questions about these Terms, copyright notices, counter-
              notices and grievances all reach us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </div>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-8 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">At a glance</div>
            <dl className="space-y-4 font-mono text-[12px]">
              <MetaBlock term="Effective date" value={EFFECTIVE_DATE} />
              <MetaBlock term="Operator" value="GIKSN Research" />
              <MetaBlock term="Governing law" value="India" />
              <MetaBlock term="Age minimum" value="18 years" />
              <MetaBlock term="Grievance officer" value={CONTACT_EMAIL} />
              <MetaBlock term="Copyright agent" value={CONTACT_EMAIL} />
              <MetaBlock
                term="Grievance ack"
                value="24 hours (Rule 3(2))"
              />
              <MetaBlock
                term="Grievance resolution"
                value="15 days (Rule 3(2))"
              />
              <MetaBlock
                term="Court-ordered takedown"
                value="36 hours (Rule 3(1)(d))"
              />
              <MetaBlock
                term="Fair use"
                value="17 U.S.C. §107"
              />
              <MetaBlock
                term="Fair dealing"
                value="Copyright Act §52(1)"
              />
              <MetaBlock
                term="DMCA counter-notice"
                value="10-14 business days"
              />
            </dl>

            <div className="mt-8 divider-dashed" />

            <div className="kicker mt-8 mb-3">On this page</div>
            <ul className="space-y-1.5 text-[13px]">
              {[
                ["Acceptance", "1"],
                ["Eligibility", "2"],
                ["What the service is", "3"],
                ["Accounts and access", "4"],
                ["Submissions and licence", "5"],
                ["Third-party research and citations", "6"],
                ["Copyright notices and takedown", "7"],
                ["Prohibited use", "8"],
                ["Content moderation", "9"],
                ["No warranty", "10"],
                ["Availability", "11"],
                ["Limitation of liability", "12"],
                ["Indemnity", "13"],
                ["Governing law and disputes", "14"],
                ["Termination", "15"],
                ["Changes", "16"],
                ["Miscellaneous", "17"],
                ["Contact", "18"],
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
                href="/privacy"
                className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em]"
              >
                Read the Privacy Policy →
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
