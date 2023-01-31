import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const useLongPolling = () => {
  const [isUnReadMessage, setIsUnReadMessage] = useState(false);
  const token = Cookies.get('access_token');

  useEffect(() => {
    const longPoll = async (token: string | undefined) => {
      try {
        const response = await axios.get(
          'https://ngether.site/chat/room/findNewMessages',
          { headers: { Authorization: token } }
        );

        if (response.status === 200) {
          await setIsUnReadMessage(true);
          setTimeout(async () => {
            await longPoll(token);
          }, 5000);
        } 

        if (response.status === 421) {
          await setIsUnReadMessage(false);
          await longPoll(token);
        }
      }
      catch (error) {
        setTimeout(async () => {
          await longPoll(token);
        }, 10000);
      }
    };
    token &&
    longPoll(token);
  }, []);

  return {isUnReadMessage, setIsUnReadMessage};
};

export default useLongPolling;