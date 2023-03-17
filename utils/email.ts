import { IEmailTemplate } from '@providers/global.context';
import mail from '@sendgrid/mail';

const key = process.env.SENDGRID_API_KEY;
mail.setApiKey(key || '');

export enum MailTemplates {
  ThemedLogin = 'd-d7421e14f0f049e1a0e18488ff1b2f63',
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
  emailTemplate?: IEmailTemplate;
  data: any;
}

export default async function SendMail({
  to,
  templateId,
  subject,
  websiteName = 'VTVL',
  websiteEmail = 'no-reply@vtvl.io',
  emailTemplate,
  data
}: SendMailProps) {
  try {
    if (!to) return "Reciever's email is needed";
    if (!templateId) return ' Email template is needed';

    const dynamicTemplateData = { ...data, subject, ...emailTemplate };
    await mail.send({
      to,
      from: { name: websiteName, email: websiteEmail },
      templateId,
      dynamicTemplateData,
      subject
    });
    return 'email sent';
  } catch (error) {
    console.error(error);
  }
}
