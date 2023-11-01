import {
  Box,
  Button,
  Card,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { type ActionArgs } from '@remix-run/node';
import { Form, Link, useLoaderData, useParams } from '@remix-run/react';
import { useState } from 'react';
import {
  InputHidden,
  ModalCheckout,
} from '~/modules/checkout/component/checkoutForm';
import AboutDashboard, {
  useCounter,
  useFormBank,
  useFormCheckout,
  useVariant,
} from '~/modules/checkout/component/useCheckout';
import CheckoutDescription from '../components/checkoutDescription';
import {
  createCheckout,
  getCheckoutDetail,
} from '../modules/checkout/checkout.service';
import { handleClick } from './productUnpaid';

export async function loader({ params }: ActionArgs) {
  const data = params;
  const getData = {
    slug: data.slug,
    store: data.store?.replace(/-/g, ' '),
  };
  try {
    const detail = await getCheckoutDetail(getData);
    return detail;
  } catch (error) {
    console.log('error:', error);
    return null;
  }
}

export const action = async ({ request }: ActionArgs) => {
  try {
    if (request.method.toLowerCase() === 'post') {
      const formData = await request.formData();

      const name = formData.get('username') as string;
      const telp = formData.get('notelp') as string;
      const email = formData.get('email') as string;
      const province = formData.get('province') as string;
      const district = formData.get('district') as string;
      const village = formData.get('village') as string;
      const getDescription = formData.get('description') as string;
      const accountName = formData.get('accountName') as string;
      const accountNumber = formData.get('accountNumber') as string;
      const courier = formData.get('courier') as string;
      const courierService = +(formData.get('courierService') as string);

      const price = +(formData.get('price') as string);
      const storeId = formData.get('storeId') as string;
      const userId = formData.get('userId') as string;
      const productId = formData.get('productId') as string;
      const payment = formData.get('payment') as string;
      const count = +(formData.get('calculation') as string);
      const postalCode = formData.get('postalCode') as string;
      const variantOptionId = formData.get('variantOptionId') as string;
      const totalPrice = +(formData.get('totalPrice') as string);
      const totalPriceUnique = +(formData.get('totalPriceUnique') as string);
      const variantOptionValueId = formData.get('valueId') as string;
      const stock = +(formData.get('stock') as string);
      const rates = +(formData.get('rates') as string);

      let description = getDescription;
      if (!getDescription) {
        description = '';
      }

      if (!payment) {
        console.log('Please fill all fields');
        return false;
      }

      const bankAccount = {
        name: accountName,
        number: accountNumber,
      };
      console.log(bankAccount);

      const invoice = {
        price: totalPriceUnique + courierService,
        discount: 0,
        status: 'UNPAID',
        receiverLongitude: '',
        receiverLatitude: '',
        receiverDistrict: district,
        receiverPhone: '+62' + telp,
        receiverAddress: village + ' ' + district + ' ' + province,
        receiverName: name,
        receiverEmail: email,
        receiverPostalCode: postalCode,
        receiverAddressNote: description,
        invoiceNumber: '',
        waybill: '',
        mootaTransactionId: '',
        userId: userId,
      };

      const cart = {
        price: totalPrice,
        discount: 0,
        userId: userId,
        storeId: storeId,
      };

      const cartItem = {
        qty: count,
        price: price,
        variantOptionId: variantOptionId,
        userId: userId,
        productId: productId,
      };

      const invoiceHistory = {
        status: 'UNPAID',
      };

      const getPayment = {
        bank: payment,
        amount: totalPriceUnique + courierService,
        status: 'UNPAID',
        userId: userId,
        accountName: accountName,
        accountNumber: accountNumber,
      };

      const getCourier = {
        availableForCashOnDelivery: false,
        availableForProofOfDelivery: false,
        availableForInstantWaybillId: false,
        courierType: courier,
        courierInsurance: 'false',
        courierName: courier,
        courierCode: courier,
        courierServiceName: 'Instant',
        courierServiceCode: 'Instant',
        tier: 'premium',
        description: '',
        serviceType: '',
        shippingType: 'parcel',
        shipmentDurationRange: '',
        shipmentDurationUnit: '',
        price: rates,
        orderId: 'orderId-test',
        trackingId: '',
        deliveryDate: '',
        deliveryTime: '',
      };

      const updateStock = {
        valueId: variantOptionValueId,
        stock: stock,
      };

      const data = {
        invoice,
        cart,
        cartItem,
        invoiceHistory,
        getPayment,
        updateStock,
        courierService,
        getCourier,
      };

      try {
        handleClick(name, email, totalPriceUnique);
        const create = await createCheckout(data);
        return create;
      } catch (error) {
        console.log('Error : ', error);
        return false;
      } finally {
        console.log('Done');
      }
    }
    return null;
  } catch (error) {
    console.log('Error : ', error);
    return null;
  }
};

type LoaderData = {
  product: any;
  unique: number;
};

export default function Checkout() {
  const data = useLoaderData<LoaderData>();

  const item = data?.product;
  const getUnique = data?.unique;
  // const item =
  //   typeof data === "object" && "product" in data ? data.product : null;
  // const getUnique = "unique" in data ? data.unique : null;

  const uniqueNumber = getUnique;

  const { slug, store } = useParams();

  const { selectedOption, handleRadioChange } = useVariant();

  const limit = item?.variants[selectedOption]?.variantOptions[0]
    ?.variantOptionValues[0]?.stock as number;

  const { count, handleIncrement, handleDecrement, handleChange } =
    useCounter(limit);
  console.log('count', count);

  // update new

  const {
    coment,
    provinceOption,
    districtOption,
    regionOption,
    rates,
    dataCourier,
    handleRatesChange,
    postalCode,
    courierServiceOption,
    handleChangeProvince,
    handleChangeDistrict,
    handleChangeRegion,
    handleChangeCourier,
    handleChangePostalCode,
  } = AboutDashboard(item, count);

  const [bankMetode, setBankMetode] = useState('');
  const handleBankMetodeChange = (event: any) => {
    setBankMetode(event);
  };

  const { nameFor, handleChangeForm } = useFormCheckout();
  const { bankFor, handleChangeBank } = useFormBank();

  let comment = 'Currently placing a new order';
  let spinner = 'none';
  let close = 'block';

  if (count === 0) {
    comment = 'Pilih berapa banyak produk yang ingin dibeli';
  } else if (nameFor !== '') {
    comment = nameFor;
  } else if (coment !== '') {
    comment = coment;
  } else if (rates === '') {
    comment = 'Harap pilih kurir';
  } else if (bankFor !== '') {
    comment = bankFor;
  } else if (bankMetode === '') {
    comment = 'Harap pilih metode pembayaran';
  } else {
    spinner = 'block';
    close = 'none';
  }

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!data) {
    return (
      <Box>
        <Box
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          mt={'100px'}
        >
          <Card
            display={'flex'}
            flexDir={'column'}
            alignItems={'center'}
            p={5}
            boxShadow={'dark-lg'}
          >
            {/* <Image
            boxSize={'200px'}
            src="https://www.pngmart.com/files/19/Sad-Emoji-PNG-File.png"
            alt="sad emoji"
          /> */}
            <Text textAlign={'center'} fontWeight={'bold'} fontSize={'4xl'}>
              We Have Error
            </Text>
            <Box
              display={'flex'}
              flexDir={'column'}
              alignItems={'center'}
              gap={2}
            >
              <Text>Please try again</Text>
              <Text>Click this button</Text>
              <Link to={`/${store}/${slug}`} target="_blank">
                <Button w={'200px'} colorScheme={'red'}>
                  Reload
                </Button>
              </Link>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  const handleSubmit = () => {
    if (spinner === 'none') {
      return onOpen();
    } else {
      onOpen();
    }
  };

  const rate = parseInt(rates);
  const isTotal = item?.variants[selectedOption]?.variantOptions[0]
    ?.variantOptionValues[0]?.price as number;

  const priceTotal = isTotal * count;
  const totalCiel = Math.ceil(priceTotal / 1000) * 1000;

  const total = totalCiel + uniqueNumber;
  let totalValue = 0;
  if (!rate) {
    totalValue = total;
  } else {
    totalValue = total + rate;
  }

  const valueTotal = totalValue.toLocaleString('id-ID');
  const ValueAfter = total.toLocaleString('id-ID');

  return (
    <>
      <CheckoutDescription
        image={item?.attachments ? item?.attachments[0]?.url : ''}
        name={item?.name}
        description={item?.description}
      />
      <Box display={'flex'} flexDir={'column'} alignItems={'center'}>
        <Box display={'none'}>
          <Text>{store}</Text>
          <Text>{slug}</Text>
        </Box>
        <Box>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalCheckout text={comment} displaySpinner={spinner}>
              <Button
                display={close}
                colorScheme="blue"
                mr={3}
                onClick={onClose}
              >
                Close
              </Button>
            </ModalCheckout>
          </Modal>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          gap={3}
          m={3}
          p={3}
          bgColor={'#dcdcdc'}
          w={'90%'}
        >
          <Form method="post">
            <Box>
              <TableContainer>
                <Box>
                  <Text>Produk Dipesan</Text>
                </Box>
                <Table variant="simple">
                  <Thead>
                    <Tr fontWeight={'bold'}>
                      <Th width={'40%'}>Produk</Th>
                      <Th width={'40%'}>Variasi</Th>
                      <Th minW={'180px'}>Jumlah</Th>
                      <Th>Harga</Th>
                      <Th>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td display={'flex'} gap={3} alignItems={'center'}>
                        <Image
                          objectFit={'cover'}
                          boxSize={'10'}
                          borderRadius={'10%'}
                          src={
                            item?.attachments ? item?.attachments[0]?.url : ''
                          }
                          alt=""
                        />
                        <Box>
                          <Text>{item?.name}</Text>
                          <Text color={'gray.600'}>
                            {(item?.variants[selectedOption]?.variantOptions[0]
                              ?.variantOptionValues[0]?.stock as number) -
                              count}
                            pcs
                          </Text>
                          <Input
                            type="hidden"
                            name="stock"
                            value={
                              (item?.variants[selectedOption]?.variantOptions[0]
                                ?.variantOptionValues[0]?.stock as number) -
                              count
                            }
                            readOnly
                          />
                        </Box>
                      </Td>
                      <Td>
                        <Box display={'flex'} flexWrap={'wrap'} gap={2}>
                          {item?.variants?.map((i: any, o: number) => (
                            <Box key={o}>
                              <label
                                style={{
                                  border: '1px solid',
                                  borderRadius: '5px',
                                  backgroundColor:
                                    selectedOption === o ? 'white' : '#dcdcdc',
                                  borderColor:
                                    selectedOption === o ? '#0091f7' : '#ccc',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Input
                                  type="radio"
                                  value={o}
                                  checked={selectedOption === o}
                                  display={'none'}
                                  onChange={handleRadioChange}
                                />
                                {i?.name}
                              </label>
                            </Box>
                          ))}
                        </Box>
                      </Td>
                      <Td>
                        <Flex alignItems="center">
                          <Button onClick={handleDecrement}>-</Button>
                          <Input
                            minW={'50px'}
                            type="number"
                            value={count}
                            onChange={handleChange}
                            name="calculation"
                          />
                          <Button onClick={handleIncrement}>+</Button>
                        </Flex>
                      </Td>
                      <Td>
                        {item?.variants[
                          selectedOption
                        ]?.variantOptions[0]?.variantOptionValues[0]?.price.toLocaleString(
                          'id-ID'
                        )}
                      </Td>
                      <Td>{totalCiel.toLocaleString('id-ID')}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
            <InputHidden
              selectedOption={selectedOption}
              price={
                item?.variants[selectedOption]?.variantOptions[0]
                  ?.variantOptionValues[0]?.price
              }
              storeId={item?.storeId}
              productId={item?.id}
              valueId={
                item?.variants[selectedOption]?.variantOptions[0]
                  ?.variantOptionValues[0]?.id
              }
              variantOptionId={
                item?.variants[selectedOption]?.variantOptions[0]?.id
              }
              userId={item?.store?.users[selectedOption]?.id}
            />
            <Box display={'flex'} flexDir={'column'} gap={3}>
              <Box>
                <Text fontWeight={['bold', 'normal', 'bold', 'normal']}>
                  Data Penerima
                </Text>
                <Box display={'flex'} flexDirection={'column'} gap={3}>
                  <Input
                    bgColor={'#fcfcfc'}
                    type="text"
                    placeholder="Nama Anda"
                    name="username"
                    onChange={handleChangeForm}
                  />
                  <InputGroup>
                    <InputLeftAddon children="+62" />
                    <Input
                      type="tel"
                      bgColor={'#fcfcfc'}
                      placeholder="Nomor Telepon"
                      name="notelp"
                      onChange={handleChangeForm}
                    />
                  </InputGroup>
                  <Input
                    bgColor={'#fcfcfc'}
                    type="email"
                    placeholder="Email Anda"
                    name="email"
                    onChange={handleChangeForm}
                  />
                </Box>
                <Box mt={3}>
                  {/* Update New */}
                  <Box display={'flex'} flexDirection={'column'} gap={3}>
                    <Box>
                      <Select
                        bgColor={'#fcfcfc'}
                        name="province"
                        onChange={(e) => handleChangeProvince(e.target.value)}
                      >
                        <option hidden>Pilih Provinsi</option>
                        {provinceOption.map((data) => (
                          <option
                            key={data.id}
                            value={data.id + ',' + data.name}
                          >
                            {data.name}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Select
                        bgColor={'#fcfcfc'}
                        name="district"
                        onChange={(e) => handleChangeDistrict(e.target.value)}
                      >
                        <option hidden>Pilih Kota</option>
                        {districtOption.map((data) => (
                          <option
                            key={data.id}
                            value={data.id + ',' + data.name}
                          >
                            {data.name}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Select
                        bgColor={'#fcfcfc'}
                        name="village"
                        onChange={(e) => handleChangeRegion(e.target.value)}
                      >
                        <option hidden>Pilih Kecamatan</option>
                        {regionOption.map((data) => (
                          <option
                            key={data.id}
                            value={data.id + ',' + data.name}
                          >
                            {data.name}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Select
                        bgColor={'#fcfcfc'}
                        name="postalCode"
                        onChange={(e) => handleChangePostalCode(e.target.value)}
                      >
                        <option hidden>Pilih Kode Pos</option>
                        {postalCode.map((data) => (
                          <option key={data.id} value={data.postal_code}>
                            {data.postal_code}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box display={'flex'} gap={3}>
                      <Select
                        w={'50%'}
                        bgColor={'#fcfcfc'}
                        name="courier"
                        onChange={(e) => handleChangeCourier(e.target.value)}
                      >
                        <option hidden>Pilih Kurir</option>
                        {dataCourier.map((data, index) => (
                          <option value={data} key={index}>
                            {data}
                          </option>
                        ))}
                      </Select>

                      <Select
                        w={'50%'}
                        bgColor={'#fcfcfc'}
                        name="courierService"
                        onChange={(e) => {
                          handleRatesChange(e);
                        }}
                      >
                        <option selected hidden>
                          Pilih Servis
                        </option>
                        {courierServiceOption.map((data, index) => (
                          <option value={data.price} key={index}>
                            {data.duration} {data.service_type} {data.price}{' '}
                            {data.type}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Input
                      bgColor={'#fcfcfc'}
                      type="text"
                      name="description"
                      placeholder="Masukkan Catatan Pemesanan"
                    />
                    <Input
                      bgColor={'#fcfcfc'}
                      type="text"
                      name="accountName"
                      placeholder="Masukkan Nama Rekening Bank"
                      onChange={handleChangeBank}
                    />
                    <Box>
                      <Input
                        bgColor={'#fcfcfc'}
                        type="text"
                        name="accountNumber"
                        placeholder="Masukkan Nomor Rekening Bank"
                        onChange={handleChangeBank}
                      />
                      <Text fontSize={'sm'}>
                        Untuk pengembalian uang jika pesananmu dibatalkan
                      </Text>
                    </Box>

                    <Text>Harga Ongkir : {rates} </Text>
                  </Box>
                  <Box>
                    <Box display={'flex'} flexDirection={'column'} gap={3}>
                      <Box>
                        <Box>
                          <Text fontWeight={'bold'}>Metode Pembayaran</Text>
                          <RadioGroup
                            name="payment"
                            bgColor={'#fcfcfc'}
                            p={3}
                            id="payment"
                            onChange={handleBankMetodeChange}
                          >
                            <Stack gap={2}>
                              <Radio value="BCA">
                                <Flex gap={2} alignItems={'center'}>
                                  <Image
                                    w={'50px'}
                                    src="https://www.bca.co.id/-/media/Feature/Card/List-Card/Tentang-BCA/Brand-Assets/Logo-BCA/Logo-BCA_Biru.png"
                                    alt="bca icon"
                                  />
                                  BCA
                                </Flex>
                              </Radio>
                              <Radio value="BRI">
                                <Flex gap={2} alignItems={'center'}>
                                  <Image
                                    w={'50px'}
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/BRI_2020.svg/2560px-BRI_2020.svg.png"
                                    alt="bca icon"
                                  />
                                  BRI
                                </Flex>
                              </Radio>
                              <Radio value="Mandiri">
                                <Flex gap={2} alignItems={'center'}>
                                  <Image
                                    w={'50px'}
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/1200px-Bank_Mandiri_logo_2016.svg.png"
                                    alt=""
                                  />
                                  Mandiri
                                </Flex>
                              </Radio>
                              <Radio value="BNI">
                                <Flex gap={2} alignItems={'center'}>
                                  <Image
                                    w={'50px'}
                                    src="https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/2560px-BNI_logo.svg.png"
                                    alt=""
                                  />
                                  BNI
                                </Flex>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </Box>
                        <Box bgColor={'#fcfcfc'} p={3}>
                          <Text color={'gray'} as="ins">
                            RINCIAN PESANAN
                          </Text>
                          <Text color={'gray'}>{item?.name}</Text>
                          <Text
                            w={'50%'}
                            overflow={'hidden'}
                            textOverflow={'ellipsis'}
                            whiteSpace={'nowrap'}
                            color={'gray'}
                          >
                            {item?.description}
                          </Text>
                          <Box fontWeight={'bold'}>
                            <Box
                              display={'flex'}
                              justifyContent={'space-between'}
                              borderBottom={'1px'}
                            >
                              <Text>Kode Unik</Text>
                              <Text>{getUnique}</Text>
                            </Box>
                            <Box
                              display={'flex'}
                              justifyContent={'space-between'}
                            >
                              <Text>Total</Text>
                              <Text>{valueTotal ?? ValueAfter}</Text>
                              <Input
                                type="hidden"
                                name="totalPrice"
                                value={
                                  (item?.variants[selectedOption]
                                    ?.variantOptions[0]?.variantOptionValues[0]
                                    ?.price as number) * count
                                }
                                readOnly
                              />
                              <Input
                                type="hidden"
                                name="totalPriceUnique"
                                value={total}
                                readOnly
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      {/* <Box>
                        <Button
                          display={"none"}
                          onChange={(e) => handlePostalCodeChange(e)}
                        ></Button>
                      </Box>
                      <Input
                        hidden
                        name="selectedProvinceName"
                        placeholder="Phone Number"
                        value={selectedProvinceName}
                        readOnly
                      />
                      <Input
                        hidden
                        name="selectedKabupatenName"
                        placeholder="Phone Number"
                        value={selectedKabupatenName}
                        readOnly
                      />
                      <Input
                        hidden
                        name="selectedKecamatanName"
                        placeholder="Phone Number"
                        value={selectedKecamatanName}
                        readOnly
                      /> */}
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box>
                <Button
                  onClick={handleSubmit}
                  bgColor={'GrayText'}
                  w={'100%'}
                  type="submit"
                >
                  Beli Sekarang
                </Button>
              </Box>
            </Box>
          </Form>
        </Box>
      </Box>
    </>
  );
}
