import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      <div className="container px-4 mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Cookie Policy
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
              This Cookie Policy explains how PulseCoach ("we", "us", or "our")
              uses cookies and similar technologies to recognize you when you
              visit our website and use our platform. It explains what these
              technologies are and why we use them, as well as your rights to
              control our use of them.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              What Are Cookies?
            </h2>

            <p>
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. Cookies are widely used by
              website owners to make their websites work, or to work more
              efficiently, as well as to provide reporting information.
            </p>

            <p>
              Cookies set by the website owner (in this case, PulseCoach) are
              called "first-party cookies". Cookies set by parties other than
              the website owner are called "third-party cookies". Third-party
              cookies enable third-party features or functionality to be
              provided on or through the website (e.g., advertising, interactive
              content, and analytics).
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Types of Cookies We Use
            </h2>

            <p>We use the following types of cookies:</p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Essential Cookies
            </h3>
            <p>
              These cookies are necessary for the website to function and cannot
              be switched off in our systems. They are usually only set in
              response to actions made by you which amount to a request for
              services, such as setting your privacy preferences, logging in, or
              filling in forms.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Performance Cookies
            </h3>
            <p>
              These cookies allow us to count visits and traffic sources so we
              can measure and improve the performance of our site. They help us
              to know which pages are the most and least popular and see how
              visitors move around the site.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Functionality Cookies
            </h3>
            <p>
              These cookies enable the website to provide enhanced functionality
              and personalization. They may be set by us or by third-party
              providers whose services we have added to our pages.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Targeting Cookies
            </h3>
            <p>
              These cookies may be set through our site by our advertising
              partners. They may be used by those companies to build a profile
              of your interests and show you relevant advertisements on other
              sites.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How Can You Control Cookies?
            </h2>

            <p>
              You can set or amend your web browser controls to accept or refuse
              cookies. If you choose to reject cookies, you may still use our
              website though your access to some functionality and areas of our
              website may be restricted. As the means by which you can refuse
              cookies through your web browser controls vary from browser to
              browser, you should visit your browser's help menu for more
              information.
            </p>

            <p>
              In addition, most advertising networks offer you a way to opt out
              of targeted advertising. If you would like to find out more
              information, please visit{" "}
              <a
                href="http://www.aboutads.info/choices/"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://www.aboutads.info/choices/
              </a>{" "}
              or{" "}
              <a
                href="http://www.youronlinechoices.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://www.youronlinechoices.com
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Do You Use Flash Cookies or Local Shared Objects?
            </h2>

            <p>
              Websites may also use so-called "Flash Cookies" (also known as
              Local Shared Objects or "LSOs") to, among other things, collect
              and store information about your use of our services, fraud
              prevention, and for other site operations.
            </p>

            <p>
              If you do not want Flash Cookies stored on your computer, you can
              adjust the settings of your Flash player to block Flash Cookies
              storage using the tools contained in the{" "}
              <a
                href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Website Storage Settings Panel
              </a>
              . You can also control Flash Cookies by going to the{" "}
              <a
                href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Global Storage Settings Panel
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Do You Serve Targeted Advertising?
            </h2>

            <p>
              Third parties may serve cookies on your computer or mobile device
              to serve advertising through our website. These companies may use
              information about your visits to this and other websites in order
              to provide relevant advertisements about goods and services that
              you may be interested in. They may also employ technology that is
              used to measure the effectiveness of advertisements. This can be
              accomplished by them using cookies or web beacons to collect
              information about your visits to this and other sites in order to
              provide relevant advertisements about goods and services of
              potential interest to you.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How Often Will You Update This Cookie Policy?
            </h2>

            <p>
              We may update this Cookie Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons. Please therefore
              revisit this Cookie Policy regularly to stay informed about our
              use of cookies and related technologies.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Where Can I Get Further Information?
            </h2>

            <p>
              If you have any questions about our use of cookies or other
              technologies, please contact us at:
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
              For more information about our privacy practices, please visit our{" "}
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
