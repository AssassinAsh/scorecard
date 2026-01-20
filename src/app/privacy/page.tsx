import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CrickSnap",
  description: "Privacy Policy for CrickSnap cricket scoring application",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Last updated: January 20, 2026
        </p>

        <div className="space-y-8 cricket-card p-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              Welcome to CrickSnap. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              application and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Information We Collect
            </h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>We may collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account Information:</strong> Name, email address, and
                  profile details when you create an account
                </li>
                <li>
                  <strong>Cricket Data:</strong> Tournament details, match
                  scores, player information, and other cricket-related data you
                  input
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our
                  application, including pages visited and features accessed
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, IP address,
                  and device identifiers
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. How We Use Your Information
            </h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our cricket scoring services</li>
                <li>Create and manage your account</li>
                <li>Store and display your tournament and match data</li>
                <li>Improve our application and user experience</li>
                <li>Send you important updates and notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to enhance our services</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>
                We do not sell your personal data. We may share your information
                with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> Third-party services that
                  help us operate our application (e.g., Supabase for database
                  hosting)
                </li>
                <li>
                  <strong>Public Data:</strong> Tournament and match data you
                  choose to make public is visible to all users
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We implement appropriate security measures to protect your
              personal data against unauthorized access, alteration, disclosure,
              or destruction. We use secure HTTPS connections, encrypted
              passwords, and secure database access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-3"
            >
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We use essential cookies to maintain your session and provide
              authentication. We also use Google Analytics to understand how
              users interact with our application. You can control cookies
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We retain your personal data only for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              privacy policy. When you delete your account, we will delete your
              personal data within 30 days, except where we are required to
              retain it by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Children's Privacy
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              Our service is not directed to children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Changes to This Policy
            </h2>
            <p style={{ color: "var(--muted)" }} className="leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <div
              style={{ color: "var(--muted)" }}
              className="leading-relaxed space-y-2"
            >
              <p>
                If you have any questions about this privacy policy or our data
                practices, please contact us:
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
        </div>
      </main>
    </div>
  );
}
