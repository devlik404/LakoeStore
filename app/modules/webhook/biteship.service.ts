// import {
//   SellerAutomation,
//   UpdateInvoiceStatusInDelivered,
// } from '~/hooks/sellerAutomation';
// import {
//   UpdateInvoiceStatusInTransit,
//   UseOrderSucces,
// } from '~/hooks/useOrderSucces';

import { db } from '~/libs/prisma/db.server';
import { pickingUp, updateInvoiceStatus } from './hooks/usePickingUp';

export async function getEmail(payload: any) {
  const dataInvoice = await db.invoice.findFirst({
    where: {
      waybill: payload.courier_waybill_id,
    },
    include: {
      user: {
        include: {
          store: true,
        },
      },
      courier: true,
      cart: {
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  variants: {
                    include: {
                      variantOptions: {
                        include: {
                          variantOptionValues: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return dataInvoice;
}

// const data = useLoaderData<typeof loader>();

export async function Biteship(payload: any) {
  // const dataInvoice = await getEmail(payload);

  // if (!dataInvoice) {
  //   // Handle the case where dataInvoice is null (no matching record)
  //   console.log(
  //     'No matching record found for waybill: ' + payload.courier_waybill_id
  //   );
  // }

  // const email = dataInvoice?.user?.email as string;
  // const name = dataInvoice?.user?.name as string;
  // const waybill = dataInvoice?.waybill as string;
  // const receiverEmail = dataInvoice?.receiverEmail as string;
  // const receiverName = dataInvoice?.receiverName as string;
  // const price = dataInvoice?.price as number;

  // Allocated
  try {
    if (payload.status === 'allocated') {
      // const invoice = await db.invoice.findFirst({
      //   where: {
      //     courierId: payload.courierId,
      //   },
      // });

      // if (!invoice) {
      //   console.log('Invoice with Courier ID is not found!');
      //   return;
      // }

      // await db.courier.update({
      //   where: { id: invoice.courierId },
      //   data: { orderId: payload.order_id },
      // });

      const courier = await db.courier.findFirst({
        where: {
          orderId: payload.order_id,
        },
      });

      if (!courier) {
        console.log('Courier ID is not found!');
        return;
      }

      await db.invoice.update({
        where: { courierId: courier.id },
        data: { waybill: payload.courier_waybill_id },
      });

      if (!courier) {
        console.log('Courier ID is not found!');
        return;
      }

      await db.courier.update({
        where: { id: courier.id },
        data: { trackingId: payload.courier_tracking_id },
      });
      console.log('Waybill and tracking updated successfully!');
      console.log('this is payload status: ' + payload.status);
    }

    // Courier picks up goods
    if (payload.status === 'picking_up') {
      const dataInvoice = await getEmail(payload);

      // console.log(dataInvoice);

      if (!dataInvoice) {
        // Handle the case where dataInvoice is null (no matching record)
        console.log(
          'No matching record found for orderId: ' + payload.order_id
        );
      }

      const email = dataInvoice?.user?.email as string;
      const name = dataInvoice?.user?.name as string;
      const waybill = dataInvoice?.waybill as string;
      const invNum = dataInvoice?.invoiceNumber as string;
      const courierName = dataInvoice?.courier?.courierName as string;
      let variantInfo = '';
      let qty = 0; // Initialize quantity as 0
      let productName = ''; // Initialize product name as an empty string

      const cartItems = dataInvoice?.cart?.cartItems || []; // Ensure cartItems is defined

      cartItems.forEach((item) => {
        qty += item.qty || 0; // Add item quantity to the total, treating undefined as 0
        productName += item.product?.name || ''; // add item product names, treating undefined as an empty string

        if (item.product?.variants) {
          item.product.variants.forEach((variant) => {
            variantInfo += `Variant: ${variant.name}\n`;
            if (variant.variantOptions) {
              variant.variantOptions.forEach((option) => {
                variantInfo += `, ${option.name}\n`;
              });
            }
          });
        }
      });
      pickingUp(
        email,
        name,
        waybill,
        invNum,
        courierName,
        productName,
        qty,
        variantInfo
      );
      console.log('Email sent succesfully');
      console.log('this is payload status: ' + payload.status);
    }

    // The goods have been picked up
    if (payload.status === 'picked') {
      const existingInvoice = await db.invoice.findFirst({
        where: {
          waybill: payload.courier_waybill_id,
        },
      });
      if (!existingInvoice) {
        console.log(
          'invoice not found for waybill' + payload.courier_waybill_id
        );
      } else {
        await updateInvoiceStatus(existingInvoice.id);
      }

      console.log('this is payload status: ' + payload.status);
    }

    // Courier on the way to recipient's location
    if (payload.status === 'dropping_off') {
      // droppingOff(email, name, waybill);
      // updateInvoiceStatusInTransit(dataInvoice);
      // console.log("this is payload status: " + payload.status);
    }

    // Item successfully recieved
    if (payload.status === 'delivered') {
      // UseOrderSucces(receiverEmail, receiverName, waybill);
      // SellerAutomation(email, name, price);
      // UpdateInvoiceStatusInTransit(dataInvoice);
      // UpdateInvoiceStatusInDelivered(dataInvoice);
      console.log('this is payload status: ' + payload.status);
    }

    // Courier not found
    if (payload.status === 'courier_not_found') {
      // Handle 'courier_not_found' status
      console.log('this is payload status: ' + payload.status);
    }

    // Order cancelled
    if (payload.status === 'cancelled') {
      // Handle 'cancelled' status
      console.log('this is payload status: ' + payload.status);
    }

    // Orders are on hold
    if (payload.status === 'on_hold') {
      // Handle 'on_hold' status
      console.log('this is payload status: ' + payload.status);
    }

    // Orders are disposed
    if (payload.status === 'disposed') {
      // Handle 'disposed' status
      console.log('this is payload status: ' + payload.status);
    }

    //  In process return to sender
    if (payload.status === 'return_in_transit') {
      // Handle 'return_in_transit' status
      console.log('this is payload status: ' + payload.status);
    }

    // The order has been returned to sender
    if (payload.status === 'returned') {
      // Handle 'returned' status
      console.log('this is payload status: ' + payload.status);
    }
  } catch (err) {
    console.log('error: ' + err);
  }
}
