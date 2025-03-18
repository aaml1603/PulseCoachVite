import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      <div className="container px-4 mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Privacy Policy
          </h1>

          <div className="prose prose-blue dark:prose-invert max-w-none text-foreground">
            <p className="text-muted-foreground">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <p>
              At PulseCoach, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Information We Collect
            </h2>

            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create an account</li>
              <li>Fill out a form</li>
              <li>Participate in interactive features</li>
              <li>Correspond with us</li>
              <li>Subscribe to newsletters</li>
              <li>Request customer support</li>
            </ul>

            <p className="mt-4">
              The types of information we may collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Personal identifiers (name, email address, phone number)</li>
              <li>Authentication information (password, security questions)</li>
              <li>
                Billing information (credit card details, billing address)
              </li>
              <li>Profile information (profile picture, bio)</li>
              <li>Client information (when you add clients to the platform)</li>
              <li>Workout and fitness data</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How We Use Your Information
            </h2>

            <p>
              We may use the information we collect for various purposes,
              including to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send administrative messages, updates, and security alerts
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Provide customer service and technical support</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Personalize and improve your experience</li>
              <li>Develop new products and services</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Sharing Your Information
            </h2>

            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Service providers who perform services on our behalf</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law</li>
              <li>
                In connection with a business transaction (merger, acquisition,
                etc.)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>

            <p>
              We implement appropriate technical and organizational measures to
              protect the security of your personal information. However, please
              be aware that no method of transmission over the Internet or
              electronic storage is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>

            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Cookies and Tracking Technologies
            </h2>

            <p>
              We use cookies and similar tracking technologies to track activity
              on our platform and hold certain information. You can instruct
              your browser to refuse all cookies or to indicate when a cookie is
              being sent.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Children's Privacy
            </h2>

            <p>
              Our platform is not intended for children under 16 years of age.
              We do not knowingly collect personal information from children
              under 16.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Changes to This Privacy Policy
            </h2>

            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>

            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="text-muted-foreground">
              privacy@pulsecoach.com
              <br />
              123 Fitness Street
              <br />
              San Francisco, CA 94103
              <br />
              United States
            </p>
          </div>

          <Separator className="my-8" />

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              For more information about our legal policies, please visit our{" "}
              <Link
                to="/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
