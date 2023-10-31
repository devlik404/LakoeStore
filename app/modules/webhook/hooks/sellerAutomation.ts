import MailerLite from '@mailerlite/mailerlite-nodejs';
import { db } from '~/libs/prisma/db.server';
import type { IDroppingOff } from '~/modules/DashboardMailerlite/mailerliteAdminDeclined';

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY as string,
});

export function SellerAutomation(email: string, name: string, price: number) {
  const emailAddress = `${email}`;
  const date = new Date().getTime();
  const uniqueName = `${date}`;

  // Split the email address into username and domain
  const atIndex = emailAddress.indexOf('@');
  const usernamePart = emailAddress.slice(0, atIndex);
  const domainPart = emailAddress.slice(atIndex + 1);

  // Create a new email address with a value inserted between username and domain
  const newEmailAddress = `${usernamePart}+${uniqueName}@${domainPart}`;

  console.log(newEmailAddress); // Output: john.doe-johndoe-example.com
  console.log('price::::', price);

  const params: IDroppingOff = {
    email: `${newEmailAddress}`, // The receiver email's - We will get the email from table invoice userId relation to get the email
    fields: {
      // This is where you can make custom fields variable for email template display
      name: `${name}`,
      price: `${price}`,
      // address: `${address}`,
    },
    groups: ['103544806836274804'], // This is where you need to categorize which group it should go for email automation trigger
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

export async function UpdateInvoiceStatusInDelivered(dataInvoice: any) {
  console.log('====================================');
  console.log('dataInvoice:', dataInvoice);
  console.log('====================================');
  const creditStore = dataInvoice.user.store.credit;
  const priceInvoice = dataInvoice.price;
  const newCredit = ((creditStore as number) + priceInvoice) as number;

  console.log('creditStore ', creditStore);
  console.log('priceInvoice ', priceInvoice);
  console.log('new credit ', newCredit);

  await db.store.update({
    where: {
      id: dataInvoice.user.storeId,
    },
    data: {
      credit: newCredit,
    },
  });
  const data = {
    status: 'ORDER_COMPLETED',
    invoiceId: dataInvoice.id,
  };
  await db.invoiceHistory.create({
    data,
  });
  return null;
}
