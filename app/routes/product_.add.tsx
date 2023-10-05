import { Stack } from '@chakra-ui/react';
import type { ActionArgs, DataFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { ImplementGrid } from '~/layouts/Grid';
import { Action } from '~/modules/product/components/Action';
import { Price } from '~/modules/product/components/Price';
import { ProductDetail } from '~/modules/product/components/ProductDetail';
import { ProductInformation } from '~/modules/product/components/ProductInformation';
import { ProductManagement } from '~/modules/product/components/ProductManagement';
// import { ProductVariant } from '~/modules/product/components/ProductVariant';
import { WeightAndShipment } from '~/modules/product/components/WeightAndShipment';
import { createProduct } from '~/modules/product/product.service';
import { uploadImage } from '~/utils/uploadImage';
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
  json,
} from '@remix-run/node';
import { authorize } from '~/middleware/authorization';
// import { useState } from 'react';

export async function loader({ request, context, params }: DataFunctionArgs) {
  await authorize({ request, context, params }, '2');

  return json({});
}

export async function action({ request }: ActionArgs) {
  if (request.method.toLowerCase() === 'post') {
    const uploadHandler = composeUploadHandlers(async ({ name, data }) => {
      if (name !== 'mainPhoto' && name !== 'photo2') {
        return undefined;
      }

      const uploadedImage = await uploadImage(data);

      return uploadedImage.secure_url;
    }, createMemoryUploadHandler());

    const formData = await parseMultipartFormData(request, uploadHandler);
    const imageUrl = formData.get('mainPhoto') as string;
    const imageUrl2 = formData.get('photo2') as string;
    const height = parseFloat(formData.get('height') as string);
    console.log('image', imageUrl);
    console.log('image2', imageUrl2);

    const data = {
      url: imageUrl,
      url2: imageUrl2,
      name: formData.get('name'),
      description: formData.get('description'),
      minimumOrder: Number(formData.get('min_order')),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      sku: formData.get('sku'),
      slug: formData.get('url'),
      category: formData.get('category') as string,
      weight: parseInt(formData.get('weight') as string),
      length: parseFloat(formData.get('length') as string),
      width: parseFloat(formData.get('width') as string),
      height: height,
    };
    await createProduct(data, '1');
    return redirect('/product');
  }
  return null;
}

export default function AddProduct() {
  return (
    <ImplementGrid>
      <Form method="post" encType="multipart/form-data">
        <Stack mt={'7.5vh'} spacing={4}>
          <ProductInformation />
          <ProductDetail />
          {/* <ProductVariant /> */}
          <Price />
          <ProductManagement />
          <WeightAndShipment />
          <Action />
        </Stack>
      </Form>
    </ImplementGrid>
  );
}
