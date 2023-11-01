import type { z } from 'zod';
import type {
  createMessageSchema,
  updateMessageSchema,
} from './configuration.schema';
import { db } from '~/libs/prisma/db.server';

export default async function createLocation(storeId: any, data: any) {
  try {
    const location = await db.location.create({
      data: {
        store: {
          connect: { id: storeId },
        },
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longtitude: data.longtitude,
        cityDistrict: data.cityDistrict,
        postalCode: data.postalCode,
        isMainLocation: data.isMainLocation,
      },
    });

    return location;
  } catch (error) {
    console.log('error service', error);
  }
}

export async function deleteLocation(id: any) {
  return await db.location.delete({
    where: { id },
  });
}

export async function updateLocation(storeId: any, id: any, data: any) {
  try {
    const updateLocation = await db.location.update({
      where: { id: id },
      data: {
        store: {
          connect: { id: storeId },
        },
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longtitude: data.longtitude,
        cityDistrict: data.cityDistrict,
        postalCode: data.postalCode,
        isMainLocation: data.isMainLocation,
      },
    });

    return updateLocation;
  } catch (error) {
    console.log('error service', error);
  }
}

export async function updateMain(id: any) {
  try {
    const updateMain = await db.location.update({
      where: { id: id },
      data: {
        isMainLocation: true,
      },
    });
    const getMain = await db.location.findMany({
      where: { NOT: { id: id } },
    });
    const updateNotMain = await db.location.updateMany({
      where: { NOT: { id: id } },
      data: {
        isMainLocation: false,
      },
    });

    return { updateMain, getMain, updateNotMain };
  } catch (error) {
    console.log('error service', error);
  }
}

export async function getAllDataLocation(storeId: any) {
  return await db.location.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      store: true,
    },
  });
}

//====================================================++++++

export async function getStoreData(id: string) {
  const dataStore = await db.store.findFirst({
    where: {
      id: id,
    },
  });
  return dataStore;
}

export async function updateStoreInformation(store_id: string, data: any) {
  const dataUpdate = await db.store.update({
    where: { id: store_id },
    data: {
      name: data.name,
      slogan: data.slogan,
      description: data.description,
      domain: data.domain,
      logoAttachment: data.logoAttachment,
    },
  });
  return dataUpdate;
}

//ini service template message====================

export async function getMessages(id: any) {
  return await db.messageTemplate.findMany({
    where: {
      storeId: id,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStoreid(id: any) {
  // export async function login(data: z.infer<typeof checkoutSchema>) {}
  return await db.store.findFirst({
    where: {
      id: id,
    },
  });
}

export async function createMessage(data: z.infer<typeof createMessageSchema>) {
  return await db.messageTemplate.create({
    data,
  });
}

export async function updateMessage(data: z.infer<typeof updateMessageSchema>) {
  const updateMessage = await db.messageTemplate.update({
    where: { id: data.id },
    data,
  });

  return updateMessage;
}

export async function deleteMessage(id: any) {
  return await db.messageTemplate.delete({
    where: { id },
  });
}
