import mail from '@sendgrid/mail';

const key = process.env.SENDGRID_API_KEY;
mail.setApiKey(key || '');

export enum MailTemplates {
  Login = 'd-dbd24a1f6b69408bbdcff1b4130ecde4',
  TeammateInvite = 'd-bde77990c2394a1fba408a67285063b6',
  RecipientInvite = 'd-c7dcc8f33282470099ae8a0247710d20'
}
export interface DT {
  firstname?: string;
  lastname?: string;
  link?: string;
  subject: string;
  email?: string;
  name?: string;
  resetLink?: string;
  emailComfirmLink?: string;
}

export interface SendMailProps {
  to: string;
  subject: string;
  templateId: MailTemplates;
  websiteName?: string;
  websiteEmail?: string;
  data: any;
}

export default async function SendMail({
  to,
  templateId,
  subject,
  websiteName = 'VTVL',
  websiteEmail = 'no-reply@vtvl.io',
  data
}: SendMailProps) {
  try {
    if (!to) return "Reciever's email is needed";
    if (!templateId) return ' Email template is needed';

    const dynamicTemplateData = { ...data, subject };
    await mail.send({
      to,
      // Update the email value into websiteEmail after whitelisting on SendGrid and on confirmation with Limewire
      from: { name: websiteName, email: 'no-reply@vtvl.io' },
      templateId,
      dynamicTemplateData,
      subject
    });
    return 'email sent';
  } catch (error) {
    console.error(error);
  }
}
