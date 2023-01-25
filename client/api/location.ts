import { setDefaultCoordsAndAddress } from './kakaoMap';

interface getCurrentLocationPropsType {
  setLocation: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
      address: string;
    }>
  >;
  setLocationError: React.Dispatch<React.SetStateAction<string>>;
}
export const getCurrentLocation = (
  setLocation: getCurrentLocationPropsType['setLocation'],
  setLocationError: getCurrentLocationPropsType['setLocationError']
) => {
  const geoLocationOptions = { enableHighAccuracy: true };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        const center = { lat, lng };
        // setLocation(center);
        setDefaultCoordsAndAddress(center, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            let detailAddr = !!result[0].address.address_name
              ? result[0].address.address_name
              : result[0].road_address.address_name;
            setLocation({ ...center, address: detailAddr });
          }
        });
      },
      setLocationError,
      geoLocationOptions
    );
  }
};
