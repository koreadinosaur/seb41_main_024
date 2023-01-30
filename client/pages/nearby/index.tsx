import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import {
  getAllSharingPosts,
  getPostsInSpecifiedLocation,
  searchPostsByTitle,
} from '../../api/post';
import { setMarkerCluster } from '../../api/kakaoMap';
import { useSearchPropsType } from '../../hooks/search/useSearch';
import BasicTabs from '../../components/molecules/tab/BasicTabs';
import TabPanel from '../../components/atoms/tabPanel/TabPanel';
import NearByList from '../../components/organisms/nearByList/NearByList';
import { ListItemPropsType } from '../../components/molecules/sharingListItem/sharingListItemType';
import ToggleButtons from '../../components/molecules/toggleButtonGroup/ToggleButtonGroup';
import { getCurrentLocation } from '../../api/location';
import Pagination from '@mui/material/Pagination';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DropdownInput from '../../components/molecules/dropdownInput/DropdownInput';
import useInput from '../../hooks/addNewHooks/useInput';
const TOGGLE_VALUES = [
  { value: 0.5, label: '0.5Km' },
  { value: 1, label: '1Km' },
  { value: 1.5, label: '1.5Km' },
];
const CATEGORY_OPTIONS = [
  { label: '상품 쉐어링', value: '상품 쉐어링' },
  { label: '배달음식 쉐어링', value: '배달음식 쉐어링' },
];

interface nearbyPropsType {
  dehydratedState: any;
  lat: number;
  lng: number;
  argumentOfLocation: useSearchPropsType['argumentOfLocation'];
  searchOption: string;
  address: string;
}
const LABEL = ['거리순', '최신순'];
const Index = ({
  dehydratedState,
  lat,
  lng,
  address,
  searchOption,
}: nearbyPropsType) => {
  const [mapCenter, setMapCenter] = useState({
    lat: lat || 37.517331925853,
    lng: lng || 127.047377408384,
    address: address || '서울 강남구',
  });
  const [currentMapCenter, setCurrentMapCenter] = useState({
    lat: 0,
    lng: 0,
    address: '',
  });

  const [category, setCategory] = useState('상품 쉐어링');

  const [locationError, setLocationError] = useState('');
  const [alignment, setAlignment] = useState<number>(1.5);
  const [page, setPage] = useState(1);
  const [isOpenOptions, setIsOpenOptions] = useState(false);

  useEffect(() => {
    const sharingListsInMap = dehydratedState?.queries[0]?.state.data.data;
    setMarkerCluster(mapCenter, sharingListsInMap, setCurrentMapCenter);
  }, [mapCenter.address]);
  useEffect(() => {
    //검색 옵션이 글 제목이거나 검색페이지를 거치지 않고 왔을 때
    !lat && getCurrentLocation(setMapCenter, setLocationError);
  }, []);

  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newCurrentTab: number) => {
    setCurrentTab(newCurrentTab);
  };

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: number
  ) => {
    setAlignment(newAlignment);
  };
  const handlePagination = (e: ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  const { status, data, error, isFetching, isPreviousData, refetch } = useQuery(
    {
      queryKey: ['projects', page],
      queryFn: () =>
        getPostsInSpecifiedLocation({
          locationData: currentMapCenter?.address
            ? currentMapCenter
            : mapCenter,
          range: alignment,
          category: category === '상품 쉐어링' ? 'product' : 'delivery',
          page: page || 1,
          size: 10,
          sortBy: currentTab === 0 ? 'distance' : 'time',
        }),
      keepPreviousData: true,
      staleTime: 5000,
      retry: false,
      refetchOnWindowFocus: false,
      onError: (data) => alert(data),
    }
  );

  useEffect(() => {
    refetch();
  }, [
    currentMapCenter.lat,
    currentMapCenter.lng,
    category,
    alignment,
    currentTab,
  ]);
  const handleOpenOptions = () => setIsOpenOptions((prev) => !prev);
  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto w-full h-fit">
        <div id="map" className="w-[100%] h-[350px]"></div>
        <p>
          <em className="text-gray-400">
            마우스를 드래그해서 지도를 이동해보세요 등록된 게시물이 나타납니다
          </em>
        </p>
        <p>
          <em className="text-gray-400">
            지도나 마커를 클릭해주세요! 주변에 게시물이 있다면 글 제목을 볼 수
            있습니다
          </em>
        </p>
        <p>{locationError && '현재 위치를 파악하지 못했습니다'}</p>
      </div>
      <BasicTabs
        currentTab={currentTab}
        handleChange={handleChange}
        tabLabels={LABEL}
        centered={false}
      />
      <div className="flex w-[100%] items-center">
        <div className="flex mt-2 justify-around px-2 w-[100%]">
          <p>
            <strong className="font-[500] whitespace-nowrap">
              주변 {category || ''} 게시물 수 :{' '}
              {data?.pageInfo.totalElements || 0}
            </strong>
          </p>
          <button
            onClick={handleOpenOptions}
            className="bg-[gray] text-white p-1"
          >
            검색 상세 옵션
          </button>
        </div>
      </div>
      {isOpenOptions && (
        <div className="flex flex-col w-[50%] items-start justify-end mt-4 p-2 border border-solid ">
          <div className="flex items-center">
            <span className="mr-4">카테고리</span>
            <DropdownInput
              dropDownOptions={CATEGORY_OPTIONS}
              id="category"
              name="category"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCategory(e.target.value)
              }
              defaultValue="상품 쉐어링"
              value={category}
            />
          </div>

          <div>
            <span className="mr-4">거리설정</span>
            <ToggleButtons
              alignment={alignment}
              handleAlignment={handleAlignment}
              toggleValues={TOGGLE_VALUES}
            />
          </div>
        </div>
      )}
      <TabPanel currentTab={currentTab} index={0}>
        <NearByList sharingLists={data?.data} />
      </TabPanel>
      <TabPanel currentTab={currentTab} index={1}>
        <NearByList sharingLists={data?.data} />
      </TabPanel>
      <Pagination
        count={data?.pageInfo.totalPages || 1}
        page={data?.pageInfo.page || 1}
        color="primary"
        onChange={handlePagination}
      />
    </div>
  );
};
export default Index;

export async function getServerSideProps(context: any) {
  const { lat, lng, address, searchOption } = context?.query;

  const requestData = {
    lat: Number(lat),
    lng: Number(lng),
    address: decodeURIComponent(address),
  };

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['sharingListInMap'], getAllSharingPosts);

  return {
    props: {
      dehydratedState: dehydrate(queryClient) || '',
      lat: requestData.lat || 0,
      lng: requestData.lng || 0,
      address: requestData.address || '',
      searchOption: searchOption || '주소',
    },
  };
}
