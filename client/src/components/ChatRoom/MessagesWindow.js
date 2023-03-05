import { useState, useEffect, forwardRef } from 'react';

// components
import { MessagesContainer } from './MessagesWindow.styled';
import Message from './Message';
import MessageLoadingSkeleton from '../Loader/MessageLoadingSkeleton';

// context
import { useAuthContext } from '../../context/AuthContext';
import { useMessageContext, MSG_ACTIONS } from '../../context/MessagesContext';
import { useThemeContext } from '../../context/ThemeContext';

// api
import { API_URL } from '../../services/api';

const MessageWindow = forwardRef(
   ({ socket, setChatWindowHeight, setShowNewestBtn }, ref) => {
      const { user } = useAuthContext();
      const { messages, dispatch } = useMessageContext();
      const { themeColors } = useThemeContext();
      const [loading, setLoading] = useState(false);

      const fetchMessages = async () => {
         setLoading(true);

         const response = await fetch(API_URL.GET_MESSAGES, {
            headers: { Authorization: `Bearer ${user.token}` },
         });
         const result = await response.json();

         if (response.ok) {
            dispatch({
               type: MSG_ACTIONS.SET,
               payload: result,
            });
         } else if (!response.ok) {
            console.error(result);
         }
         setLoading(false);
      };

      const handleScroll = () => {
         if (Math.abs(ref.current.scrollTop) > 2000) {
            setShowNewestBtn(true);
         } else {
            setShowNewestBtn(false);
         }
      };

      useEffect(() => {
         if (user) {
            fetchMessages();
         }
         // eslint-disable-next-line
      }, [user, dispatch]);

      useEffect(() => {
         socket.on('resend_messages', () => {
            fetchMessages();
            setChatWindowHeight(ref.current.scrollHeight);
         });
         // eslint-disable-next-line
      }, [socket]);

      return (
         <MessagesContainer
            ref={ref}
            roomColor={themeColors.roomBgColor}
            onScroll={() => handleScroll()}
         >
            {messages?.map((message, index, array) => (
               <Message
                  key={message._id}
                  message={message}
                  nextId={array[index + 1]?.user_id ?? false}
                  nextDay={array[index + 1]?.createdAt ?? false}
               />
            )) ||
               (!loading && (
                  <div
                     style={{
                        display: 'flex',
                        justifySelf: 'end',
                        alignSelf: 'center',
                        paddingBottom: '10rem',
                     }}
                  >
                     Actually there aren't any messages for now ¯\_(ツ)_/¯
                  </div>
               ))}
            {loading &&
               [...Array(10).keys()].map(i => {
                  return <MessageLoadingSkeleton key={i} index={i} />;
               })}
         </MessagesContainer>
      );
   }
);

export default MessageWindow;
