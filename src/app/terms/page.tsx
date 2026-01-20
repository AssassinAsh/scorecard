import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | CrickSnap",
  description: "Terms and Conditions for CrickSnap cricket scoring application",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Last updated: January 20, 2026
        </p>

        <div className="space-y-8 cricket-card p-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              By accessing and using CrickSnap, you accept and agree to be bound
              by these Terms and Conditions. If you do not agree to these terms,
              please do not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>When you create an account with us, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 13 years old to create an account</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Roles</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>CrickSnap has two user roles:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Viewer:</strong> Can view public tournaments and
                  matches
                </li>
                <li>
                  <strong>Scorer:</strong> Can create tournaments, matches, and
                  record live scores (requires credit purchase)
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Credits System</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>CrickSnap uses a credit-based system for creating content:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Creating a tournament costs 10 credits</li>
                <li>Creating a match costs 1 credit</li>
                <li>New scorers receive 20 credits upon upgrade</li>
                <li>Credits are non-refundable</li>
                <li>
                  Additional credits can be purchased by contacting our team
                </li>
                <li>Credits do not expire</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>
                You retain ownership of content you create. By using CrickSnap,
                you grant us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  The right to store, display, and share your tournament and
                  match data
                </li>
                <li>Permission to make public content visible to all users</li>
                <li>The right to use your content to improve our services</li>
              </ul>
              <p className="mt-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post false, misleading, or offensive content</li>
                <li>Infringe on others' intellectual property rights</li>
                <li>Use the service for any illegal purposes</li>
                <li>Attempt to manipulate or corrupt scoring data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Prohibited Uses</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Use the service in any way that violates applicable laws
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the service
                </li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>
                  Use automated tools to access the service without permission
                </li>
                <li>Impersonate another user or entity</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Harvest or collect user data without consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Service Availability
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We strive to provide reliable service but do not guarantee
              uninterrupted access. We reserve the right to modify, suspend, or
              discontinue any part of the service at any time without prior
              notice. We are not liable for any loss or damage resulting from
              service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Intellectual Property
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              The CrickSnap application, including its design, code, logos, and
              content (excluding user-generated content), is owned by CrickSnap
              and protected by copyright and intellectual property laws. You may
              not copy, modify, or distribute our intellectual property without
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Limitation of Liability
            </h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>
                To the fullest extent permitted by law, CrickSnap and its team
                shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Any indirect, incidental, special, or consequential damages
                </li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Errors or inaccuracies in scoring data entered by users</li>
                <li>
                  Any damages arising from unauthorized access to your account
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Disclaimer of Warranties
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              The service is provided "as is" and "as available" without
              warranties of any kind, either express or implied. We do not
              warrant that the service will be error-free, secure, or available
              at all times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>We may terminate or suspend your account if you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate these Terms and Conditions</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Abuse or misuse the service</li>
              </ul>
              <p className="mt-3">
                You may delete your account at any time through your profile
                settings. Upon termination, your right to use the service will
                immediately cease.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes by posting a notice on our
              application. Your continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of India, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-2"
            >
              <p>
                If you have any questions about these Terms and Conditions,
                please contact us:
              </p>
              <div className="space-y-1">
                <p>
                  <strong>Anup Patel:</strong>{" "}
                  <a
                    href="tel:+919907321792"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    +91 99073 21792
                  </a>
                </p>
                <p>
                  <strong>Nirmal Joshi:</strong>{" "}
                  <a
                    href="tel:+919770894274"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    +91 97708 94274
                  </a>
                </p>
                <p>
                  <strong>Suyash Chouhan:</strong>{" "}
                  <a
                    href="tel:+919425983055"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    +91 94259 83055
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section
            className="mt-8 p-4 rounded-lg"
            style={{ background: "var(--background)" }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "var(--muted)" }}
            >
              By using CrickSnap, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
