import PropTypes from 'prop-types';
import { sub } from 'date-fns';
import { useRef, useState, useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import uuidv4 from 'src/utils/uuidv4';
// api
import { sendMessage, createConversation } from 'src/api/chat';
// components
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function ChatMessageInput({ disabled, refreshMessages, selectedConversationId }) {
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const { user } = useAuthContext();

  const fileRef = useRef(null);

  const [filePreview, setFilePreview] = useState(null);

  const [message, setMessage] = useState('');

  const myContact = useMemo(
    () => ({
      id: user.id,
      email: user.email,
      address: user.fullAddress,
      name: user.firstName,
      lastActivity: new Date(),
      avatarUrl: user?.avatar?.fileUrl,
      phoneNumber: user.phoneNumber,
      status: 'online',
    }),
    [user]
  );

  const messageData = useMemo(
    () => ({
      attachments: [],
      content: message,
      contentType: 'text',
      senderId: myContact.id,
      ticketId: selectedConversationId,
    }),
    [message, myContact.id, selectedConversationId]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        if (message) {
          if (selectedConversationId) {
            console.log(messageData);
            await axiosInstance.post('/messages', messageData);
            refreshMessages();
          }
          setMessage('');
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar, message, messageData, refreshMessages, selectedConversationId]
  );

  return (
    <>
      <InputBase
        value={message}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        // startAdornment={
        //   // <IconButton>
        //   //   <Iconify icon="eva:smiling-face-fill" />
        //   // </IconButton>
        // }
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton onClick={handleSendMessage}>
              <Iconify icon="tabler:send" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />

      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axiosInstance.post('/files', formData);
            const { data } = response;
            console.log(data);
            setFilePreview(data?.files[0]);

            const inputMessage = {
              attachments: data.files,
              content: message,
              contentType: 'image',
              senderId: myContact.id,
              ticketId: selectedConversationId,
            };
            await axiosInstance.post('/messages', inputMessage);
            refreshMessages();
            setMessage('');
          }
        }}
      />
    </>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  selectedConversationId: PropTypes.any,
  refreshMessages: PropTypes.func,
};
