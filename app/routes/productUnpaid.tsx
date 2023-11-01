import { Box } from '@chakra-ui/react';
import MailerLite from '@mailerlite/mailerlite-nodejs';

// import { db } from '~/libs/prisma/db.server';
import { GetUnpidData } from '~/modules/unpid/unpid.service';

export async function loader() {
  const datash = await GetUnpidData();
  return datash;
}
interface CreateOrUpdateParams {
  email: string;
  fields?: object;
  groups?: Array<string>;
  status?: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk';
  subscribed_at?: string;
  ip_address?: string;
  opted_in_at?: string;
  optin_ip?: string;
  unsubscribed_at?: string;
}
// const apikey = process.env.API_KEY as string;
const mailerlite = new MailerLite({
  api_key:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMDFjY2FmMmI2OGExMjU4MDU4MDYyY2U4Yjc1M2JjOTBhZGU5OTdmNWFmZGRjYWRmNGY5ZmQwZjFlZjdhZjAxNTQwMGFmODkwZGM1NGU0ZjciLCJpYXQiOjE2OTQ2OTUzNzUuMjU4NjE2LCJuYmYiOjE2OTQ2OTUzNzUuMjU4NjE4LCJleHAiOjQ4NTAzNjg5NzUuMjU0MTAyLCJzdWIiOiI2MjQ5NjIiLCJzY29wZXMiOltdfQ.e6WRNqL5SWKuoqNIhzSdug00CUg0uS8Whf-jXXHH3VNentv2jTNCIUhTv0THxlIzHOdnHoW3Seihv0_ZK1X5oq9jIEebUnkxc65pinUSqhfBzpAK31us0Q0hfqpER-o5qLH9IqkdC_5i3PIzofn6FcIpgKajlDldwxql7dJ5Ids-TWe0Rhf9w6_Wi2gFwYMULkHBldd8qAFD0HgwWhh2-79Myv_G_ErxmUnSnZoyzqEcIGtC9Vyz2sncY_34yxr-bzB7IzztJgJoGt-trBZ9F6IA9sm1cCx4HTLSgsVPcuoSpYrsJx8zP6VHY2Z9KloV6LQfwC4JHsfUpbzo5lrylYmKCgXg8obVpI1cyBOWp2G2iqvFrgzPbNMEvKOyzSe2bCKiF7QkMh5_IbD4pJg0pyaoZgJT4b357QrCH1Ojx36leIrwhZdw7U4jwdPKxT-tCHXiOheMKvphudcIk5y2SK2SM_X8AKtc3-a7t_cynip5EbBMVFrufc4Zkq6h71q2swAe4eozjPDhXbGAmdu54uFB3tY4iJG_X4Dml_uawuXt3zKD-qj2SNXMzEq_W8PX0beqI6Wh40-LaMUPL_P21Lwtccc3no-uojs8lZVBooTIw5yd2NIEgTgYaNIzGDknXfdur1yL_iUOPWm_v7mDwKlNYlv1Llf_N-I_WEvnrmk',
});

export function handleClick(
  name: string,
  email: string,
  totalPriceUnique: number
) {
  const emails = `${email}`;
  const date = new Date().getTime();
  const atIndex = emails.indexOf('@');
  const usernameEmail = emails.slice(0, atIndex);
  const domainEmail = emails.slice(atIndex + 1);
  const newEmail = `${usernameEmail}+${date}@${domainEmail}`;
  console.log('newEmail', newEmail);

  const params: CreateOrUpdateParams = {
    email: newEmail,
    fields: {
      name: `${name}`,
      subtotal: `${totalPriceUnique}`,
    },
    groups: ['103555236240558047'],
    status: 'active',
    subscribed_at: '2021-08-31 14:22:08',
  };

  console.log('params', params);

  mailerlite.subscribers
    .createOrUpdate(params)
    .then((response) => {
      console.log('Email berhasil dikirim:', response.data);
      // Tambahkan kode lain yang ingin Anda jalankan setelah pengiriman email berhasil
    })
    .catch((error) => {
      console.error('Gagal mengirim email:', error);
      // Tambahkan kode lain untuk menangani kesalahan jika diperlukan
    });
}

export function handleClickSeller(
  emailSeller: string,
  name: string,
  totalPriceSendEmail: string,
  nameStore: string
) {
  const emails = `${emailSeller}`;
  console.log('emailSeller', emailSeller);
  console.log('emails', emails);
  const date = new Date().getTime();
  const atIndex = emails.indexOf('@');
  const usernameEmail = emails.slice(0, atIndex);
  const domainEmail = emails.slice(atIndex + 1);
  const newEmail = `${usernameEmail}+${date}@${domainEmail}`;
  console.log('newEmail', newEmail);

  const params: CreateOrUpdateParams = {
    email: newEmail,
    fields: {
      namabuyer: name,
      namestore: nameStore,
      subtotal: totalPriceSendEmail,
    },
    groups: ['103556939946919846'],
    status: 'active',
    subscribed_at: '2021-08-31 14:22:08',
    // Anda dapat mengisi nilai-nilai lain sesuai kebutuhan
  };

  console.log('params', params);

  mailerlite.subscribers
    .createOrUpdate(params)
    .then((response) => {
      console.log('Email berhasil dikirim:', response.data);
      // Tambahkan kode lain yang ingin Anda jalankan setelah pengiriman email berhasil
    })
    .catch((error) => {
      console.error('Gagal mengirim email:', error);
      // Tambahkan kode lain untuk menangani kesalahan jika diperlukan
    });
}
const MailerLiteComponent3 = () => {
  return (
    <>
      <Box marginTop={'20px'}></Box>
    </>
  );
};

export default MailerLiteComponent3;
