import React, { useEffect } from 'react';
import Img from '../../components/atoms/image/Image';
import DetailBottom from '../../components/molecules/detailBottom/DetailBottom';
import PostMeta from '../../components/molecules/postMeta/PostMeta';
import UserMetaInfo from '../../components/molecules/userMetaInfo/UserMetaInfo';
import DetailPageTab from '../../components/organisms/tab/detailPageTab/DetailPageTab';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  deleteProductDetail,
  getProductDetail,
  likeProduct,
  reportProduct,
  getMyFavorite,
  goChatroom,
  completeSharing,
} from '../../api/detail';
import { getIsWriter } from '../../api/isWriter';
import { useState } from 'react';
import Cookies from 'js-cookie';
import CircleLoading from '../../components/organisms/circleLoading/CircleLoading';
import Image from 'next/image';
// import base from '../../public/imageBox/base-box.svg';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';

import StateBadge from '../../components/organisms/stateBadge/StateBadge';
import useAdminRole from '../../hooks/common/useAdminRole';
import { handleBlockUser } from '../../api/admin';

export async function getServerSideProps(context: any) {
  const { id } = context.params;
  return {
    props: {
      id,
    },
  };
}

export default function ProductDetail({ id }: any) {
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

  const handleClose = () => {
    setIsLoginAlertOpen(false);
    router.push('/login');
  };

  const loginChecker = () => {
    if (Cookies.get('access_token')) {
      return true;
    }
    return false;
  };

  const isLogin = loginChecker();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isReported, setIsReported] = useState<boolean>(false);
  const [productData, setProductData] = useState<any>([]);
  const [isWriter, setIsWriter] = useState<any>(false);
  const router = useRouter();
  const {isAdmin} = useAdminRole();

  console.log('isLiked', isReported);
  console.log('isReported', isReported);
  // const res = useQueries({
  //   queries: [
  //     {
  //       queryKey: ['productDetail'],
  //       queryFn: () => getProductDetail(id),
  //       onSuccess: (res: any) => {
  //         console.log(res);
  //         setProductData(res.data);

  //         const openStatus =
  //           res?.data?.boardStatus === 'BOARD_COMPLETE' ? false : true;
  //         setIsOpen(openStatus);

  //         const reportStatus =
  //           res?.data?.boardStatus === 'BOARD_NOT_DELETE' ? true : false;
  //         console.log();
  //         setIsReported(reportStatus);
  //       },
  //       retry: false,
  //     },
  //     {
  //       queryKey: ['isWriter'],
  //       queryFn: () => getIsWriter(id),
  //     },
  //   ],
  // });

  useEffect(() => {
    getProductDetail(id).then((res) => {
      setProductData(res.data);

      const openStatus =
        res.data.boardStatus === 'BOARD_COMPLETE' ? false : true;
      setIsOpen(openStatus);

      const reportStatus =
        res.data.boardStatus === 'BOARD_NOT_DELETE' ? true : false;
      console.log();
      setIsReported(reportStatus);
    });

    getIsWriter(id).then((res) => {
      console.log(res.data);
      setIsWriter(res.data);
    });

    if (isLogin) {
      getMyFavorite().then((res) => {
        const isMyFavorite: any =
          res.data.data.filter((item: any) => item.boardId === Number(id))
            .length > 0;

        setIsLiked(isMyFavorite);
      });
    }
  }, []);

  const reportForm = {
    reportedId: id,
    reportType: 'board',
  };

  // 삭제하기
  const handleDelete = () => {
    deleteProductDetail(id).then((res) => router.push('/'));
  };

  // 찜하기
  const handleLike = () => {
    if (!isLogin) {
      setIsLoginAlertOpen(true);
    } else {
      setIsLiked(!isLiked);
      likeProduct(id);
    }
  };

  // 신고하기
  const handleReport = () => {
    if (!isLogin) {
      setIsLoginAlertOpen(true);
    } else {
      reportProduct(reportForm);
      alert('신고가 접수되었습니다');
    }
  };

  // 참여하기
  const handleGether = () => {
    if (!isLogin) {
      setIsLoginAlertOpen(true);
    } else {
      goChatroom(id).then((res) => router.push(`/chatroom/${id}`));
    }
  };

  // 모집 완료하기
  const handleComplete = () => {
    setIsOpen(false);
    completeSharing(id).then((res) => {
      console.log(res.data);
    });
  };

  // 유저 정지하기
  const handleUserBlock = () => {
    handleBlockUser(productData?.nickname);
    router.push('/admin')
  }
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const handleReportModalOpen = () => setIsReportModalOpen(true);
  const handleReportModalClose = () => setIsReportModalOpen(false);
  const [isGetherModalOpen, setGetherModalOpen] = useState(false);
  const handleGetherModalOpen = () => setGetherModalOpen(true);
  const handleGetherModalClose = () => setGetherModalOpen(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const handleIsCompleteModalOpen = () => setIsCompleteModalOpen(true);
  const handleIsCompleteModalClose = () => setIsCompleteModalOpen(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleIsDeleteModalOpen = () => setIsDeleteModalOpen(true);
  const handleIsDeleteModalClose = () => setIsDeleteModalOpen(false);
  const handleGoEdit = (id: any) => {
    router.push(`/edit/${id}`);
  };

  return (
    <div>
      <div>
        <div className="relative pb-[70%]">
          <div className="absolute left-2/4 top-2/4 translate-x-[-50%] translate-y-[-50%] w-[100%] h-[90%] pb-[59%]">
            <Image
              className="p-8"
              src={productData.imageLink || '/chatItem/productImg.svg'}
              alt={'물고기'}
              fill
            />
            {!isOpen && (
              <StateBadge stateText={'모집 완료'} usedDetail={true} />
            )}
          </div>
        </div>
        <DetailBottom
          isOpen={isOpen}
          isLiked={isLiked}
          isWriter={isWriter}
          isAdmin={isAdmin}
          handleUserBlock={handleUserBlock}
          handleLike={handleLike}
          handleReport={handleReport}
          handleGether={handleGether}
          handleComplete={handleComplete}
          isReportModalOpen={isReportModalOpen}
          handleReportModalOpen={handleReportModalOpen}
          handleReportModalClose={handleReportModalClose}
          isGetherModalOpen={isGetherModalOpen}
          handleGetherModalOpen={handleGetherModalOpen}
          handleGetherModalClose={handleGetherModalClose}
          isCompleteModalOpen={isCompleteModalOpen}
          handleIsCompleteModalOpen={handleIsCompleteModalOpen}
          handleIsCompleteModalClose={handleIsCompleteModalClose}
        />

        <UserMetaInfo
          isOpen={isOpen}
          productData={productData}
          handleDelete={handleDelete}
          isWriter={isWriter}
          id={id}
          handleComplete={handleComplete}
          handleGoEdit={handleGoEdit}
          isDeleteModalOpen={isDeleteModalOpen}
          handleIsDeleteModalOpen={handleIsDeleteModalOpen}
          handleIsDeleteModalClose={handleIsDeleteModalClose}
          isCompleteModalOpen={isCompleteModalOpen}
          handleIsCompleteModalOpen={handleIsCompleteModalOpen}
          handleIsCompleteModalClose={handleIsCompleteModalClose}
        />

        <Divider variant="middle" sx={{ my: 1 }} />
        <PostMeta
          productData={productData}
          isLiked={isLiked}
          handleLike={handleLike}
        />
        <DetailPageTab productData={productData} />
        <LoginAlert
          isLoginAlertOpen={isLoginAlertOpen}
          handleClose={handleClose}
        />
      </div>
    </div>
  );
}

interface LoginAlertPropsType {
  isLoginAlertOpen: boolean;
  handleClose: () => void;
}

const LoginAlert = ({ isLoginAlertOpen, handleClose }: LoginAlertPropsType) => {
  return (
    <div>
      <Dialog
        open={isLoginAlertOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle color="primary" id="alert-dialog-title">
          {'N게더 회원만 가능한 기능입니다'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            로그인 후 이용해주세요😀
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
