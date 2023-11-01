import crypto from 'crypto';

import { json, redirect } from '@remix-run/node';
import type { DataFunctionArgs, ActionArgs } from '@remix-run/node';

import { MootaOrderSchema } from '~/modules/order/order.schema';

import {
  MootaOrderStatusUpdate,
  getAllProductUnpid,
  getDataProductReadyToShip,
  getInvoiceByStatus,
  updateInvoiceStatus,
  CanceledService,
  SuccessService,
  getTemplateMessage,
  getProductUnpid,
  whatsappTemplateDb,
  getDataInShipping,
} from '~/modules/order/order.service';

import { Flex } from '@chakra-ui/react';
import { useLoaderData } from '@remix-run/react';
import { ImplementGrid } from '~/layouts/Grid';
import { db } from '~/libs/prisma/db.server';
import { authorize } from '~/middleware/authorization';
import { getUserId } from '~/modules/auth/auth.service';
import SuccesService from '~/modules/order/orderSuccessService';
import { NavOrder } from '~/layouts/NavOrder';

export async function loader({ request, context, params }: DataFunctionArgs) {
  await authorize({ request, context, params }, '2');

  const userId = await getUserId(request);
  if (!userId) {
    return redirect('/auth/login');
  }

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  const apiKey = process.env.BITESHIP_API_KEY;

  const currentTime = new Date().getTime();
  // const dataProductReadyToShip = await getDataProductReadyToShip();
  //jangan ampai terbalik posisi untuk menampilkan data load
  const [
    unpaidCardAll,
    unpaidCard,
    canceledService,
    getTemplateMessages,
    dataProductReadyToShip,
    succesService,
    whatsappTemplateDbs,
    getDataInShippings,
    dataInvoice,
  ] = await Promise.all([
    getAllProductUnpid(),
    getProductUnpid(),
    CanceledService(),
    getTemplateMessage(),
    getDataProductReadyToShip(user?.storeId),
    SuccesService(),
    whatsappTemplateDb(),
    getDataInShipping(user?.storeId),
    getInvoiceByStatus(),
  ]);

  return json({
    unpaidCardAll,
    unpaidCard,
    canceledService,
    getTemplateMessages,
    dataProductReadyToShip,
    SuccessService,
    whatsappTemplateDbs,
    getDataInShippings,
    succesService,
    dataInvoice,
    currentTime,
    apiKey,
  });
}

export async function action({ request }: ActionArgs) {
  const requestIP = request.headers.get('x-forwarded-for') as string;

  console.log('requestIP', requestIP);

  if (isMootaIP(requestIP)) {
    if (request.method === 'POST') {
      try {
        const requestBody = await request.text();

        const payloads = JSON.parse(requestBody);
        console.log('payloads', payloads);

        const secretKey = process.env.MOOTA_SECRET as string;

        const rawAmount = payloads[0].amount;
        const amount = parseFloat(rawAmount);

        const signature = request.headers.get('Signature') as string;

        if (verifySignature(secretKey, requestBody, signature)) {
          const MootaOrder = MootaOrderSchema.parse({
            amount,
          });
          await MootaOrderStatusUpdate(MootaOrder);
        } else {
          console.log('error verify Signature!');
        }

        return json({ data: payloads }, 200);
      } catch (error) {
        return new Response('Error in The Use webhook', {
          status: 500,
        });
      }
    }
  }
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const actionType = formData.get('actionType') as string;

  const invoiceId = String(formData.get('invoiceId'));
  const userId = '2';
  const now = new Date();

  // Calculate the timestamp 30 minutes in the future
  const nextAccessTime = new Date(now.getTime() + 100000);

  if (actionType === 'createTrackingLimit') {
    const data = {
      userId,
      invoiceId,
      nextAccessTime,
      updatedAt: now,
    };

    // await db.biteshipTrackingLimit.deleteMany({
    //   where: {
    //     invoiceId: invoiceId
    //   }
    // })

    const isAvailable = await db.biteshipTrackingLimit.findFirst({
      where: {
        invoiceId: invoiceId,
      },
    });

    if (isAvailable) {
      await db.biteshipTrackingLimit.update({
        where: {
          id: isAvailable.id,
        },
        data: {
          nextAccessTime: nextAccessTime,
        },
      });
    } else {
      await db.biteshipTrackingLimit.create({ data });
    }

    // await db.biteshipTrackingLimit.create({data})

    return json({ message: 'data added.' });
  }

  if (actionType === 'updateInvoiceAndHistoryStatusReadyToShip') {
    await db.invoiceHistory.create({
      data: {
        status: status,
        invoiceId: id,
      },
    });

    await db.invoice.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  }

  if (actionType === 'updateDbCourierId') {
    const id = formData.get('id') as string;
    const orderId = formData.get('orderId') as string;

    console.log('update order id', orderId);
    console.log('update courier id', id);

    await db.courier.update({
      where: {
        id,
      },
      data: {
        orderId,
      },
    });

    return json({ data: 'data added' });
  }

  if (request.method.toLowerCase() === 'patch') {
    const formData = await request.formData();

    const id = formData.get('id') as string;
    const price = formData.get('price');
    const stock = formData.get('stock');

    await updateInvoiceStatus({ id, price, stock });
  }
  return redirect('/order');
}

function isMootaIP(requestIP: string) {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  const allowedIPSandBox = process.env.ALLOWED_IPS_SAND?.split(',') || [];
  return allowedIPs.includes(requestIP) || allowedIPSandBox.includes(requestIP);
}
function verifySignature(secretKey: string, data: string, signature: string) {
  const hmac = crypto.createHmac('sha256', secretKey);
  const computedSignature = hmac.update(data).digest('hex');
  return computedSignature === signature;
}

export default function Order() {
  const data = useLoaderData<typeof loader>();

  return (
    <ImplementGrid>
      <Flex align={'center'} justify={'center'} h={'100vh'}>
        <NavOrder cardProduct={data} />
      </Flex>
    </ImplementGrid>
  );
}
