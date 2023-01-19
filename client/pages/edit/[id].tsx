import Input from '../../components/atoms/input/Input';
import Label from '../../components/atoms/label/Label';
import Stack from '@mui/material/Stack';
import base from '../../public/imageBox/base-box.svg';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '../../components/atoms/button/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

export async function getServerSideProps(context: { params: { id: number } }) {
  const { id } = context.params;
  console.log('context >>>', context);
  console.log('context.params >>>', context.params);
  // const { data } = await axios.get(`http://3.34.54.131:8080/api/boards/${id}`);
  const { data } = await axios.get(`http://localhost:3001/productList/${id}`);

  return {
    props: {
      productData: data,
    },
  };
}

interface productDataProps {
  productData: {
    title: string;
    price: number;
    productsLink: string;
    category: string;
    address: string;
    content: string;
    createDate: string;
    maxNum: number;
    curNum: number;
    deadLine: string;
    nickname: string;
  };
}

const EditPage = ({ productData }: productDataProps) => {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: productData.title,
    price: productData.price,
    productsLink: productData.productsLink,
    category: productData.category,
    quantity: '1',
    address: productData.address,
    content: productData.content,
  });

  const { title, price, productsLink, category, quantity, address, content } =
    form;

  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // function getProductDetail() {
  //   return axios.get(`http://localhost:3001/productList/${id}`, {
  //     // return axios.get(`http://3.34.54.131:8080/api/boards/${id}`, {
  //     headers: {
  //       Authorization: cookies.access_token,
  //       Refresh: cookies.refresh_token,
  //     },
  //   });
  // }

  // const productDetailQuery = useQuery(['productDetail'], getProductDetail, {
  //   initialData: productData,
  // });

  function editProductDetail() {
    // return axios
    //   .patch(`http://3.34.54.131:8080/api/boards/${id}`, form, {
    return axios
      .patch(`http://localhost:3001/productList/${id}`, form, {
        headers: {
          Authorization: Cookies.get('access_token'),
          Refresh: Cookies.get('refresh_token'),
        },
      })
      .then((res) => {
        router.push(`/nearby/${id}`);
      });
  }

  const editMutation = useMutation(() => editProductDetail());

  return (
    <div>
      <div className="flex justify-center m-7 my-12">
        <FormControl fullWidth className="flex flex-col w-10/12 max-w-lg">
          <Stack spacing={4}>
            <img
              className="h-40 w-40 mb-7 m-auto"
              src={base}
              alt={'유저이미지'}
            />
            <Input
              id="title"
              name="title"
              type="text"
              label="상품명"
              value={title}
              onChange={onChange}
              placeholder={productData.title}
            />
            <Label htmlFor={'title'} labelText={''} />
            <Input
              id="price"
              name="price"
              type="text"
              label="가격"
              value={price}
              onChange={onChange}
            />
            <Label htmlFor={'price'} labelText={''} />
            <Input
              id="productsLink"
              name="productsLink"
              type="text"
              label="상품 링크"
              value={productsLink}
              onChange={onChange}
            />
            <Label htmlFor={'productsLink'} labelText={''} />
            <FormControl fullWidth>
              <InputLabel id="category">카테고리</InputLabel>
              <Select
                labelId="category"
                name="category"
                value={category}
                label="category"
                onChange={onChange}
              >
                <MenuItem value="product">product</MenuItem>
                <MenuItem value="delivery">delivery</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="quantity">상품 개수</InputLabel>
              <Select
                labelId="quantity"
                name="quantity"
                value={quantity}
                label="quantity"
                onChange={onChange}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
            </FormControl>
            <Input
              id="address"
              name="address"
              type="text"
              label="쉐어링 위치"
              value={address}
              onChange={onChange}
            />
            <Label htmlFor={'address'} labelText={''} />
            <Input
              id="content"
              name="content"
              label="내용"
              value={content}
              onChange={onChange}
              rows={10}
              multiline
              className="h-15.75"
            ></Input>
            <Button
              className="h-14 mt-4 bg-primary text-white rounded "
              onClick={() => editMutation.mutate()}
            >
              쉐어링 수정
            </Button>
          </Stack>
        </FormControl>
      </div>
    </div>
  );
};

export default EditPage;
