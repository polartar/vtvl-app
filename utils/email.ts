import mail, { MailDataRequired } from "@sendgrid/mail";

const key = process.env.SENDGRID_API_KEY;
mail.setApiKey(key || "");
const temp = "d-dbd24a1f6b69408bbdcff1b4130ecde4";

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
  from: string;
  templateId: string;
  dynamicTemplateData: DT;
}

export default async function SendMail({
  to,
  email,
  // templateId,
  emailLink,
  subject,
}: any) {
  try {
    if (!to) return "Reciever's email is needed";
  //  if (!from) return "Senders's email is needed";
  //  if (!templateId) return " Email template is needed";

    const dynamicTemplateData = {
      email,
      subject,
      emailLink,
    };
    await mail.send({ to, from: 'adaobi@vtvl.io', templateId: temp, dynamicTemplateData, subject });
    return "email sent";
  } catch (error) {
    console.log(error);
  }
}
