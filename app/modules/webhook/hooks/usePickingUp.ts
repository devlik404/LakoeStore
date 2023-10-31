import MailerLite from '@mailerlite/mailerlite-nodejs';
import type { IMailerLite } from '~/interfaces/mailerlite';
import { db } from '~/libs/prisma/db.server';

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY as string,
});

export function pickingUp(
  email: string,
  name: string,
  waybill: string,
  invoiceNumber: string,
  courierName: string,
  productName: string,
  quantity: number,
  variants: string
): void {
  const emailAddress = `${email}`;
  const date = new Date().getTime();
  const username = `${date}`;

  // Split the email address into username and domain
  const atIndex = emailAddress.indexOf('@');
  const usernamePart = emailAddress.slice(0, atIndex);
  const domainPart = emailAddress.slice(atIndex + 1);

  // Create a new email address with a value inserted between username and domain
  const newEmailAddress = `${usernamePart}+${username}@${domainPart}`;

  console.log(newEmailAddress); // Output: john.doe-johndoe-example.com

  const params: IMailerLite = {
    email: `${newEmailAddress}`, // The receiver email's - We will get the email from table invoice userId relation to get the email
    fields: {
      // This is where you can make custom fields variable for email template display
      name: `${name}`,
      waybill: `${waybill}`,
      invoicenumber: `${invoiceNumber}`,
      couriername: `${courierName}`,
      productname: `${productName}`,
      quantity: `${quantity}`,
      variant: `${variants}`,

      // address: `${address}`,
    },
    groups: ['100917108885423441'], // This is where you need to categorize which group it should go for email automation trigger
    status: 'active', // possible statuses: active, unsubscribed, unconfirmed, bounced or junk.
  };

  mailerlite.subscribers
    .createOrUpdate(params)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      if (error.response) console.log(error.response.data);
    });
}

export async function updateInvoiceStatus(invoiceId: string) {
  // const date = new Date().getTime().toString()
  await db.invoice.update({
    where: { id: invoiceId },
    data: { status: 'IN_TRANSIT' },
  });

  // Create an invoice history with the status "READY_TO_SHIP"
  await db.invoiceHistory.create({
    data: {
      status: 'READY_TO_SHIP',
      invoice: { connect: { id: invoiceId } },
    },
  });
}
