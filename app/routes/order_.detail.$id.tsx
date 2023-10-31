import { Stack } from '@chakra-ui/react';
import type { ActionArgs, DataFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { ITracking } from '~/interfaces/order/orderTracking';
import type { IOrderDetailInvoice } from '~/interfaces/orderDetail';
import { ImplementGrid } from '~/layouts/Grid';
import { db } from '~/libs/prisma/db.server';
import { authorize } from '~/middleware/authorization';
import StatusOrderDetail from '~/modules/order/components/statusOrderDetail';
import { MootaOrderSchema } from '~/modules/order/order.schema';
import {
  MootaOrderStatusUpdate,
  getInvoiceById,
  updateStatusInvoice2,
} from '~/modules/order/order.service';
import crypto from 'crypto';

export async function loader({ request, context, params }: DataFunctionArgs) {
  await authorize({ request, context, params }, '2');

  const { id } = params;

  const apiKey = process.env.BITESHIP_API_KEY as string;
  const dataCart = await getInvoiceById(id as string);
  const currentTime = new Date().getTime();

  return { dataCart, apiKey, currentTime };
}

function isMootaIP(requestIP: string) {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') ?? [];
  return allowedIPs.includes(requestIP);
}
function verifySignature(secretKey: string, data: string, signature: string) {
  const hmac = crypto.createHmac('sha256', secretKey);
  const computedSignature = hmac.update(data).digest('hex');
  console.log('computedSignature', computedSignature);
  return computedSignature === signature;
}

export async function action({ request }: ActionArgs) {
  const requestIP = request.headers.get('x-forwarded-for') as string;

  const formData = await request.formData();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const actionType = formData.get('actionType') as string;

  const invoiceId = String(formData.get('invoiceId'));
  const userId = '2';
  const now = new Date();

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

  if (actionType === 'updateInvoiceAndHistoryStatusReadyToShip') {
    console.log('masuk sini');

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

    if (isMootaIP(requestIP)) {
      if (request.method === 'POST') {
        try {
          const requestBody = await request.text();

          const payloads = JSON.parse(requestBody);

          const secretKey = process.env.MOOTA_SECRET as string;

          const amount = payloads[0].amount as number;

          const signature = request.headers.get('Signature') as string;

          if (verifySignature(secretKey, requestBody, signature)) {
            const MootaOrder = MootaOrderSchema.parse({
              amount,
            });
            await MootaOrderStatusUpdate(MootaOrder);
          } else {
            console.log('error verify Signature!');
          }
          return json({ data: requestBody }, 200);
        } catch (error) {
          return new Response('Error in The Use webhook', {
            status: 500,
          });
        }
      }
    }

    // alert
    console.log('Status "READY_TO_SHIP" berhasil dibuat dan diupdate.');
  }

  if (request.method.toLowerCase() === 'post' && actionType === 'cancelNotif') {
    const status = formData.get('status') as string;
    const id = formData.get('id') as string;

    const validateDataUpdate = {
      id,
      status,
    };

    await updateStatusInvoice2(validateDataUpdate);
    return redirect('/order/detail/' + id);
  }

  if (actionType === 'createTrackingLimit') {
    // Calculate the timestamp 30 minutes in the future
    const nextAccessTime = new Date(now.getTime() + 10000);
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

    return json({});
  }
}

export default function OrderDetailId() {
  const { dataCart, apiKey, dataTracking } = useLoaderData<{
    dataCart: IOrderDetailInvoice;
    dataTracking: ITracking;
    apiKey: string;
  }>();

  return (
    <>
      <ImplementGrid>
        <Stack mt={'7.5vh'} spacing={4}>
          <StatusOrderDetail
            data={dataCart}
            dataTracking={dataTracking}
            apiKey={apiKey}
          />
        </Stack>
      </ImplementGrid>
    </>
  );
}
