import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      <div className="container px-4 mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Terms of Service
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
              Welcome to PulseCoach. These Terms of Service ("Terms") govern
              your access to and use of the PulseCoach platform, including any
              websites, mobile applications, and other online services that link
              to these Terms (collectively, the "Services").
            </p>

            <p>
              By accessing or using the Services, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              1. Account Registration
            </h2>

            <p>
              To use certain features of the Services, you must register for an
              account. When you register, you agree to provide accurate,
              current, and complete information about yourself and to update
              this information to keep it accurate, current, and complete.
            </p>

            <p>
              You are responsible for safeguarding your account credentials and
              for all activities that occur under your account. You agree to
              notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              2. Subscription and Payments
            </h2>

            <p>
              Some aspects of the Services may be available only with a paid
              subscription. By subscribing to a paid plan, you agree to pay the
              subscription fees as described at the time of purchase.
            </p>

            <p>
              Subscription fees are billed in advance on a recurring basis,
              depending on the billing cycle you select. You authorize us to
              charge your payment method for all fees incurred in connection
              with your account.
            </p>

            <p>
              You may cancel your subscription at any time, but we do not
              provide refunds for any partial subscription periods.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              3. User Content
            </h2>

            <p>
              The Services may allow you to upload, submit, store, send, or
              receive content, including text, photos, videos, and other
              materials ("User Content"). You retain ownership of any
              intellectual property rights that you hold in your User Content.
            </p>

            <p>
              By uploading User Content, you grant PulseCoach a worldwide,
              non-exclusive, royalty-free license to use, reproduce, modify,
              adapt, publish, translate, create derivative works from,
              distribute, and display such content in connection with providing
              and promoting the Services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              4. Prohibited Conduct
            </h2>

            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Use the Services in any way that violates any applicable law or
                regulation
              </li>
              <li>
                Impersonate any person or entity or falsely state or
                misrepresent your affiliation with a person or entity
              </li>
              <li>
                Engage in any conduct that restricts or inhibits anyone's use or
                enjoyment of the Services
              </li>
              <li>
                Use the Services in any manner that could disable, overburden,
                damage, or impair the Services
              </li>
              <li>
                Use any robot, spider, or other automatic device to access the
                Services
              </li>
              <li>
                Introduce any viruses, Trojan horses, worms, or other harmful
                material
              </li>
              <li>
                Attempt to gain unauthorized access to, interfere with, damage,
                or disrupt any parts of the Services
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h2>

            <p>
              We may terminate or suspend your access to all or part of the
              Services, with or without notice, for any conduct that we, in our
              sole discretion, believe violates these Terms or is harmful to
              other users of the Services, us, or third parties, or for any
              other reason.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              6. Disclaimer of Warranties
            </h2>

            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT
              NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              7. Limitation of Liability
            </h2>

            <p>
              IN NO EVENT WILL PULSECOACH, ITS AFFILIATES, OR THEIR LICENSORS,
              SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE
              LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING
              OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              8. Indemnification
            </h2>

            <p>
              You agree to defend, indemnify, and hold harmless PulseCoach, its
              affiliates, and their respective officers, directors, employees,
              contractors, agents, licensors, and suppliers from and against any
              claims, liabilities, damages, judgments, awards, losses, costs,
              expenses, or fees (including reasonable attorneys' fees) arising
              out of or relating to your violation of these Terms or your use of
              the Services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              9. Changes to Terms
            </h2>

            <p>
              We may revise and update these Terms from time to time in our sole
              discretion. All changes are effective immediately when we post
              them. Your continued use of the Services following the posting of
              revised Terms means that you accept and agree to the changes.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              10. Governing Law
            </h2>

            <p>
              These Terms and any dispute or claim arising out of or related to
              them shall be governed by and construed in accordance with the
              laws of the State of California, without giving effect to any
              choice or conflict of law provision or rule.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              11. Contact Information
            </h2>

            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-muted-foreground">
              legal@pulsecoach.com
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
              For more information about how we handle your data, please visit
              our{" "}
              <Link
                to="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
