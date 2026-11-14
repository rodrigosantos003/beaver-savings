# Privacy Policy

**Last updated:** November 12, 2026

Beaver Savings ("Beaver Savings", "we", "us", or "our") is a personal finance
web application developed and operated by **Rodrigo Santos**.

This Privacy Policy explains how we collect, use, store, and protect personal
information when you use Beaver Savings.

## 1. Who is responsible for your data?

The data controller responsible for personal data processed through Beaver
Savings is:

**Rodrigo Santos** Email:
[rodrigo.s.santos003@gmail.com](mailto:rodrigo.s.santos003@gmail.com)

If you have any questions about this Privacy Policy or how your personal data is
handled, you can contact us at the email address above.

## 2. Information we collect

When you create and use a Beaver Savings account, we collect or process the
following categories of information.

### Account information

When you register for an account, we collect:

- Your name
- Your email address
- A cryptographic hash of your password

Your password is not stored in plain text.

### Savings information

When you use Beaver Savings, you may provide financial information such as:

- Monthly income
- Monthly expenses
- Total savings amount

This information is associated with your account so that Beaver Savings can
provide its savings-related functionality.

Beaver Savings does not request or intentionally collect bank account numbers,
payment card numbers, bank login credentials, or other banking credentials.

### Session and security information

When you authenticate with Beaver Savings, our authentication system creates
session information that may include:

- Your IP address
- Your browser or device user-agent information
- A session token
- The session token's expiration date

This information is used to maintain authenticated sessions, keep your account
secure, and allow you to access Beaver Savings without repeatedly signing in.

Session tokens are security credentials. You should not share them with other
people.

## 3. How we use your information

We use your personal information only as necessary to operate and provide Beaver
Savings.

This includes using your information to:

- Create and manage your account
- Authenticate you and maintain your signed-in session
- Secure the application and prevent unauthorized access
- Store and display your savings information
- Provide the application's savings-related functionality
- Allow you to export your savings results
- Respond to requests or questions you send to us
- Maintain and secure the service
- Detect, prevent, and address technical or security problems
- Generate savings tips and answer your questions through the optional AI
  savings coach, when you choose to use it
- Send you service notices about your account, such as a warning before an
  inactive account is deleted

We do not use your personal financial information for advertising or behavioral
profiling.

We do not sell your personal information.

## 4. Legal bases for processing

Where the General Data Protection Regulation (GDPR) applies, we process your
personal data on the following legal bases, as applicable:

### Performance of a contract

We process information necessary to provide Beaver Savings to you, including
your account information, authentication information, and savings data.

For example, we need your email address and authentication information to
maintain your account and authenticated sessions, and we need your savings
information to provide the application's core functionality.

When you choose to use the AI savings coach, we process your savings information
and any question you type in order to provide the tips or answers you request.

### Legitimate interests

We may process limited information where this is necessary for legitimate
interests such as maintaining, securing, debugging, and improving the
reliability of Beaver Savings, provided that those interests do not override
your rights and freedoms.

This may include processing technical and security information such as IP
addresses and user-agent information for authentication and security purposes.

### Legal obligations

We may process personal information where this is necessary to comply with
applicable legal obligations.

## 5. Passwords and authentication

Authentication for Beaver Savings is handled using **Better Auth**.

Your password is stored as a cryptographic hash rather than as the original
password. Beaver Savings does not have access to your password in its original
form.

Better Auth also maintains session information required to authenticate you.
This may include your IP address, user-agent information, session token, and
session expiration date.

Session information is used for authentication and security purposes and is
associated with your account while your session is active.

You should choose a strong, unique password and avoid reusing your Beaver
Savings password on other services.

## 6. Exporting your savings results

Beaver Savings provides an export feature that allows you to send your savings
results to an email address.

When you use this feature:

1. You provide an email address for the export.
2. Beaver Savings sends the requested results to that address.
3. Beaver Savings does not store the recipient email address as part of your
   Beaver Savings account data.

Email delivery for this feature is handled by **Resend**.

The email address you provide for an export is transmitted to Resend as
necessary to deliver the email. Resend may process that information according to
its own privacy practices and applicable contractual terms.

You should only provide an email address that you are authorized to use for this
purpose.

## 7. AI savings coach

Beaver Savings includes an optional AI savings coach, **Bucky**, available to
signed-in users. Bucky is powered by a large language model run by
**Scaleway**, a French cloud provider, through its Generative APIs service
hosted in the European Union.

The coach only runs when you ask it to, for example when you request tips for
your plan or type a question. Each time, Beaver Savings sends the following
information to Scaleway so that the model can generate a response:

- The savings plan you entered in the calculator, such as your income,
  subsidies, extra income, expenses, savings goal, and savings method
- Figures calculated from that plan, such as your typical month, projected
  annual savings, and suggested savings
- A summary of your saving habits based on your recent plans, such as median
  savings and median monthly expenses
- The total amount saved in your dam and the number of deposits
- Your preferred currency and the language of the app
- The text of any question you type

We do not send your name, email address, password, or session information to
Scaleway as part of coach requests.

Questions you type are sent to Scaleway as written. Please do not include
information that is not needed for your question, such as names, contact
details, bank details, or information about your health or other sensitive
matters.

Beaver Savings does not store your questions or the coach's responses in its
database. A response is shown in your browser and is lost when you close the
coach or leave the page.

Scaleway processes this information as our service provider, only to generate
the response and within the European Union. Under Scaleway's terms for this
service, your information is not used to train or improve AI models, and the
content of requests and responses is not retained by default. Scaleway may
collect anonymised usage data, such as the number of requests, to operate the
service.

Coach responses are generated automatically and are not reviewed by a person.
They do not produce legal or similarly significant effects on you, and they are
not professional financial advice.

Using the coach is entirely optional. If you do not want your savings
information to be sent to Scaleway, simply do not use it. All other features of
Beaver Savings work without it.

## 8. Service providers

Beaver Savings uses third-party infrastructure and service providers to operate
the application.

### Vercel

Beaver Savings is hosted and deployed using **Vercel**.

Vercel may process information associated with operating and delivering the
application, including technical information necessary for hosting, networking,
security, and service operation.

### MongoDB Atlas

Beaver Savings uses **MongoDB Atlas** to store application data.

Our MongoDB Atlas database deployment is located in **Frankfurt, Germany**.

The database may contain account information, authentication/session
information, and savings information described in this Privacy Policy.

We do not currently configure separate MongoDB Atlas backups for Beaver Savings.

### Better Auth

Beaver Savings uses **Better Auth** as its authentication framework.

Better Auth handles authentication and session management within the Beaver
Savings application. The resulting authentication and session information is
stored in our application database.

### Resend

Beaver Savings uses **Resend** to deliver emails associated with the export
feature.

When you request an export, the email address you provide is transmitted to
Resend as necessary to send the email. Beaver Savings does not store that export
recipient address in your account data.

### Scaleway

Beaver Savings uses **Scaleway Generative APIs** to power the optional AI
savings coach.

When you use the coach, the savings information and questions described in the
"AI savings coach" section are transmitted to Scaleway to generate a response.
Scaleway processes this information in data centres located in the European
Union.

These providers process information as necessary to provide their respective
services. Their own privacy policies and contractual terms may also apply.

## 9. International data transfers

Beaver Savings is available worldwide.

Although our primary application database is deployed in Frankfurt, Germany,
some of our service providers may process information in other countries,
including countries outside the European Economic Area (EEA).

Vercel, MongoDB, and Resend are based in the United States. Each of them is
certified under the **EU-U.S. Data Privacy Framework** for the type of personal
data we share with them. Transfers of personal data from the EEA to these
providers rely on that certification and on the European Commission's adequacy
decision for the EU-U.S. Data Privacy Framework.

For users protected by the GDPR, we take reasonable steps to ensure that
international transfers of personal data are conducted in accordance with
applicable data protection requirements.

Scaleway, which runs the AI savings coach, is based in France and processes
coach requests within the European Union.

## 10. Data retention

We retain your personal information for as long as your Beaver Savings account
remains active and as necessary to provide the service.

Session information is retained according to the expiration period configured
for the applicable session.

If you do not use your account for 24 months, we delete it together with all
associated data. If your email address is verified, we email you at least 30
days before the deletion, and signing in during that period keeps your account.

You can delete your Beaver Savings account directly through the application.

When you delete your account, the account information, authentication
information, session information, and savings data associated with your account
are permanently deleted from Beaver Savings.

We do not maintain separate application backups of your data on MongoDB Atlas or
Vercel.

Certain information may nevertheless be retained by our third-party service
providers in their own operational logs or systems according to their respective
retention policies. Such information is subject to those providers' applicable
privacy policies and contractual terms.

## 11. Account deletion

You can delete your Beaver Savings account directly through the application.

Deleting your account permanently deletes the personal information and savings
data associated with your account from Beaver Savings, including the account and
authentication information stored in our database.

If you are unable to delete your account through the application, you may
contact us at:

**[rodrigo.s.santos003@gmail.com](mailto:rodrigo.s.santos003@gmail.com)**

We may need to verify your identity before processing a deletion request.

## 12. Your data protection rights

Depending on your location and applicable law, you may have rights regarding
your personal data.

If the GDPR applies to you, these rights may include:

- **Right of access:** You can request a copy of the personal data we hold about
  you.
- **Right to rectification:** You can request correction of inaccurate or
  incomplete personal data.
- **Right to erasure:** You can request deletion of your personal data in
  circumstances provided by law.
- **Right to restriction:** You can request that we restrict the processing of
  your personal data in certain circumstances.
- **Right to data portability:** You may have the right to receive certain
  personal data in a structured, commonly used, and machine-readable format.
- **Right to object:** You may have the right to object to certain processing
  based on legitimate interests.
- **Right to withdraw consent:** Where processing is based on your consent, you
  may withdraw that consent at any time.

While signed in, you can download a copy of the personal data stored in your
account at any time, in a machine-readable format (JSON), using the "Download my
data" link at the bottom of the page.

Some of these rights are subject to legal exceptions and conditions.

To exercise a privacy right, contact:

**[rodrigo.s.santos003@gmail.com](mailto:rodrigo.s.santos003@gmail.com)**

We will respond to requests within the timeframe required by applicable law.

## 13. Right to lodge a complaint

If you are located in the European Union or European Economic Area and believe
that your personal data has been processed in violation of applicable data
protection law, you may have the right to lodge a complaint with the data
protection authority in your country.

For users in Portugal, the relevant supervisory authority is the **Comissão
Nacional de Proteção de Dados (CNPD)**.

You may contact the supervisory authority without first contacting us, although
we encourage you to contact us so that we have an opportunity to address your
concern.

## 14. Cookies and analytics

Beaver Savings does not use advertising cookies or third-party analytics
services to track users across the web.

We do not use services such as Google Analytics or similar analytics platforms
for behavioral tracking.

The application only uses cookies and similar technologies that are needed for
the service to work or that remember choices you make:

- **Session cookie** (`better-auth.session_token`): keeps you signed in. It is
  set when you sign in and expires after 7 days unless it is renewed while you
  use the app.
- **Language cookie** (`NEXT_LOCALE`): remembers the language you use.
- **Currency cookie** (`NEXT_CURRENCY`): remembers the currency you choose, for
  up to 1 year.
- **Browser local storage** (`pwa-install-dismissed-at`, `pwa-was-installed`):
  remembers whether you dismissed or installed the app, so the install prompt
  is not shown again. This information stays on your device.

These technologies are used to provide the service rather than for advertising
or cross-site behavioral tracking.

## 15. Children's privacy

Beaver Savings is intended for adults and is not specifically directed toward
children.

We do not knowingly design or operate Beaver Savings to collect personal
information from children.

If you believe that a child has provided personal information to Beaver Savings,
please contact us at
**[rodrigo.s.santos003@gmail.com](mailto:rodrigo.s.santos003@gmail.com)** so
that we can investigate and take appropriate action.

## 16. Financial information

Beaver Savings is a personal finance management and savings calculation tool.

The financial information you enter into Beaver Savings, such as income,
expenses, and savings amounts, is stored to provide the application's
functionality.

Beaver Savings does not provide banking, investment, lending, tax, or other
professional financial services.

You are responsible for the accuracy of the information you enter into the
application.

## 17. Data security

We take reasonable technical and organizational measures designed to protect
personal information against unauthorized access, alteration, disclosure, or
destruction.

These measures include, among other things:

- HTTPS encryption for connections to Beaver Savings
- Password hashing through the Better Auth authentication system
- Session-based authentication and security controls
- Use of managed infrastructure provided by Vercel
- Use of MongoDB Atlas for database hosting
- Access controls intended to limit access to application data

However, no internet-based service can guarantee absolute security. You should
use a strong and unique password and notify us if you believe your account has
been compromised.

## 18. Data breaches

If we become aware of a personal data breach affecting your personal
information, we will take appropriate steps to investigate, contain, and
remediate the incident.

Where required by applicable law, we will notify affected users and/or the
relevant supervisory authorities within the applicable legal timeframe.

## 19. Changes to this Privacy Policy

We may update this Privacy Policy from time to time to reflect changes to Beaver
Savings, our data-processing practices, legal requirements, or the services we
use.

When we make changes, we will update the "Last updated" date at the top of this
Privacy Policy.

We encourage you to review this Privacy Policy periodically.

## 20. Contact

If you have questions, concerns, or requests regarding this Privacy Policy or
your personal data, please contact:

**Rodrigo Santos** **Email:**
[rodrigo.s.santos003@gmail.com](mailto:rodrigo.s.santos003@gmail.com)

---

**Beaver Savings** Personal finance and savings management application Operated
by Rodrigo Santos
