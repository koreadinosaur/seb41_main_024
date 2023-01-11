import Image from 'next/image';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { createTheme } from '@mui/material/styles';

type spotPropsType = {
  spot: string;
};

const Spot = ({ spot }: spotPropsType) => {
  return (
    <div className="flex flex-col justify-center items-center w-fit">
      <LocationOnOutlinedIcon color="primary" />
      <span className="text-xs text-primary">{spot}</span>
    </div>
  );
};

export default Spot;
