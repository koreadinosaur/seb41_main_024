import Input from '../../components/atoms/input/Input';
import DropdownInput from '../../components/molecules/dropdownInput/DropdownInput';
import NearByPageTab from '../../components/organisms/tab/nearByPageTab/NearByPageTab';
import {
  Button,
  FormControl,
  FormHelperText,
  Popover,
  Typography,
} from '@mui/material';
import NoContent from '../../components/molecules/noContent/NoContent';
import React, { useEffect, useState } from 'react';
import { exchangeCoordToAddress, searchMap } from '../../api/kakaoMap';
import { getAddressBooks, getCurrentLocation } from '../../api/location';
import FormButton from '../../components/molecules/formbutton/FormButton';
import useInput from '../../hooks/addNewHooks/useInput';
import { useQuery } from '@tanstack/react-query';
import {
  getPostsInSpecifiedLocation,
  searchPostsByTitle,
} from '../../api/post';
import { useRouter } from 'next/router';
import useSearch from '../../hooks/search/useSearch';
import AddressBookList from '../../components/organisms/addressBookList/AddressBookList';
import Cookies from 'js-cookie';
import { locationDataType } from '../../components/container/addressBook/AddressBook';
import Link from 'next/link';
import CircleLoading from '../../components/organisms/circleLoading/CircleLoading';
import Head from 'next/head';

const CATEGORY_OPTIONS = [
  { label: '상품 쉐어링', value: '상품 쉐어링' },
  { label: '배달음식 쉐어링', value: '배달음식 쉐어링' },
];
const SEARCH_OPTIONS = [
  { label: '주소', value: '주소' },
  { label: '글 제목', value: '글 제목' },
  { label: '글 내용', value: '글 내용' },
  { label: '작성자', value: '작성자' },
];
const Search = () => {
  // 이곳의 폼 데이터 관리도 useState, useRef, react-hook-form 등 기호에 맞게 사용하시면 됩니다
  const router = useRouter();
  const [token, setToken] = useState({ Authorization: '', Refresh: '' });
  const [targetCoord, setTargetCoord] = useState<any>({
    lat: 37.517331925853,
    lng: 127.047377408384,
    address: '서울 강남구',
  });
  const [isLoading, setIsLoading] = useState(false);

  const [isSearch, setIsSearch] = useState(false);

  const [center, setCenter] = useState<any>({
    lat: 37.517331925853,
    lng: 127.047377408384,
    address: '서울 강남구',
  });
  const [error, setError] = useState({ code: 0, message: '' });

  const { inputValue, onChange, setInputValue } = useInput({
    title: '',
    searchOption: '주소',
    category: '상품 쉐어링',
    //타입 에러 떄문에 추가된 value들입니다.
    //useInput을 addnew와 search가 같이 사용하다보니.. 아래 4개의 필드는 search에서는 필요 없습니다.
    productsLink: '',
    maxNum: 0,
    content: '',
    deadLine: '',
  });
  const [searchAddress, setSearchAddress] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedAddressBook, setSelectedAddressBook] = useState<any>({
    address: '',
    latitude: '',
    locationId: -1,
    locationName: '',
    longitude: '',
    memberId: 0,
    nickName: '',
  });
  const handleSearchAddress = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchAddress(e.target.value);
  };
  useEffect(() => {
    setToken({
      Authorization: Cookies.get('access_token') || '',
      Refresh: Cookies.get('refresh_token') || '',
    });
    getCurrentLocation(setCenter, setError);
    setIsSearch((prev) => !prev);
  }, []);
  useEffect(() => {
    exchangeCoordToAddress(center, setTargetCoord);
  }, [center.lat, center.lng, isSearch]);
  const { title, searchOption } = inputValue;
  /* const coordsByAddressBook = {
    lat: selectedAddressBook.latitude,
    lng: selectedAddressBook.longitude,
    address: selectedAddressBook.address,
  }; */
  const finalLocation = targetCoord.address ? targetCoord : center;

  const argumentOfLocation = {
    locationData: finalLocation,
    range: 1.5,
    category: 'product',
    page: 1,
    size: 10,
  };

  const argumentOfTitle = { keyword: title, page: 1, size: 300 };
  /* const { refetch } = useSearch({
    searchOption,
    argumentOfLocation,
    argumentOfTitle,
  }); */
  const { data } = useQuery({
    queryKey: ['addressBooks'],
    queryFn: () =>
      getAddressBooks({
        Authorization: Cookies.get('access_token') || '',
        Refresh: Cookies.get('refresh_token') || '',
      }),
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const addressInfo = targetCoord?.address?.split(' ');
    if (addressInfo?.length <= 1 && searchOption === '주소') {
      setIsLoading(false);
      return alert('주소는 시,구 까지 입력되어야 합니다. 지도를 클릭해주세요');
    }
    const {
      range,
      category,
      page,
      size,
      locationData: { lat, lng, address },
    } = argumentOfLocation;
    const { keyword, page: titlePage, size: titleSize } = argumentOfTitle;
    const type =
      searchOption === '글 제목' ? 1 : searchOption === '글 내용' ? 2 : 3;

    const query = {
      searchOption,
      type,
      keyword,
      page: page || titlePage,
      size: size || titleSize,
      lat,
      lng,
      address,
      range,
      category,
      selectedAddressBookId: selectedAddressBook?.locationId,
    };
    router.push({ pathname: '/nearby', query }, '/nearby');
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const selectAddress = (locationData: locationDataType) => {
    const coordsAndAddress = {
      lat: locationData.latitude,
      lng: locationData.longitude,
      address: locationData.address,
    };
    setInputValue({ ...inputValue, searchOption: '주소' });
    setTargetCoord(coordsAndAddress);
    setSelectedAddressBook(locationData);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="flex flex-col items-center ani_fadeIn">
      <Head>
        <title>검색</title>
        <meta
          name="description"
          content="실시간 위치로 주변 이웃들의 Ngether 모집 글을 찾아보세요! 실시간 위치 뿐만 아니라 원하는 위치 어디든 검색할 수 있습니다."
        />
      </Head>
      <div className="flex flex-col max-w-lg mt-3 w-[100%] relative screen-maxw672:max-w-full screen-maxw672:px-4 screen-maxw672:w-full">
        <div id="map" className="w-[100%] h-[350px] fadeIn"></div>
        <div
          className={`${
            searchOption !== '주소'
              ? 'bg-[gray] bg-none w-[100%] h-[350px] absolute left-0 z-[6] flex items-center justify-center ani_fadeIn'
              : ''
          }`}
        >
          {searchOption !== '주소'
            ? `${searchOption} 검색은 위치 검색 지원이 되지 않습니다. 자동으로 현재 위치로 이동합니다`
            : ''}
        </div>
        <p className="m-4">
          <em>지도를 클릭하면 더 정확한 주소를 검색할 수 있습니다</em>
          {error?.message && (
            <em className="text-[red] block">
              위치 권한 허용을 하지 않으신 경우 아래에서 주소 검색을 해주세요
            </em>
          )}
        </p>
        <div className="flex w-[100%] mb-4 screen-maxw430:block">
          <Input
            id="location"
            name="location"
            type="text"
            className="screen-maxw430:w-full"
            label="도로명•지번주소 검색"
            onKeyDown={(e: KeyboardEvent) => {
              setSelectedAddressBook({});
              setIsSearch((prev) => !prev);
              if (e.key === 'Enter') return searchMap(searchAddress, setCenter);
            }}
            onChange={handleSearchAddress}
            // helperText="ex) 강남, 이문로 (강남에 게시물이 집중되어 있습니다)"
          />
          <div className="screen-maxw430:mt-[0.3125rem]">
            <FormButton
              variant="contained"
              className="bg-[#63A8DA] text-[white] ml-[10px] h-[52px] screen-maxw672:px-[0.625rem] screen-maxw430:ml-0 screen-maxw430:w-[48%]"
              content="주소검색"
              onClick={() => {
                setSelectedAddressBook({});
                setIsSearch((prev) => !prev);
                searchMap(searchAddress, setCenter);
              }}
            ></FormButton>
            <FormButton
              aria-describedby={id}
              variant="contained"
              onClick={handleClick}
              content="나의 주소록"
              className="bg-[skyblue] text-[white] ml-[10px] h-[52px] screen-maxw672:px-[0.625rem] screen-maxw430:w-[48%]"
            ></FormButton>
          </div>
          <Popover
            id={id}
            open={open}
            slot="div"
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Typography component="div" sx={{ p: 2 }}>
              {data?.data[0] ? (
                <AddressBookList
                  addressBookList={data?.data}
                  content="선택"
                  buttonColor="skyblue"
                  selectAddress={selectAddress}
                />
              ) : (
                <>
                  <div className="mb-2">
                    등록된 주소록이 없습니다. 등록하시겠습니까?
                  </div>
                  <Link
                    href="/mypage"
                    className="bg-[skyblue] py-1 px-2 border-[0] border-indigo-500/100 border-solid rounded-md"
                  >
                    등록하러 가기
                  </Link>
                  {!token.Authorization && (
                    <Link
                      href="/login"
                      className="bg-[orange] ml-3 py-1 px-2 border-[0] border-indigo-500/100 border-solid rounded-md"
                    >
                      로그인하러 가기
                    </Link>
                  )}
                </>
              )}
            </Typography>
          </Popover>
        </div>

        <span className="ml-2 mb-4 text-[gray]">
          ex) 강남, 서초 (강남에 게시물이 집중되어 있습니다)
        </span>

        <FormControl
          fullWidth
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <DropdownInput
            dropDownOptions={SEARCH_OPTIONS}
            id="searchOption"
            name="searchOption"
            label="검색옵션"
            width="150px"
            value={searchOption}
            defaultValue="주소"
            onChange={onChange}
          />
          <Input
            className="ml-4"
            id="title-input"
            name="title"
            type="text"
            label="글 제목 • 주소 검색"
            fullWidth
            onChange={onChange}
            {...(searchOption === '주소' && { disabled: true })}
            value={
              searchOption === '주소'
                ? targetCoord.address || center.address
                : title
            }
          />
        </FormControl>
        <form onSubmit={handleSubmit}>
          <FormButton
            content="검색하기"
            className="h-14 mt-4 w-[100%]"
            variant="contained"
            type="submit"
          />
        </form>
      </div>
      <div>
        {isLoading && (
          <CircleLoading message="검색 중입니다 잠시만 기다려주세요" />
        )}
      </div>
    </div>
  );
};

export default Search;
