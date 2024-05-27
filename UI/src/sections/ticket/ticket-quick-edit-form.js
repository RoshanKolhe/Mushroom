import PropTypes from 'prop-types';
import * as Yup from 'yup';
import Card from '@mui/material/Card';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { Stack } from '@mui/material';
import ChatMessageList from '../chat/chat-message-list';
import ChatMessageInput from '../chat/chat-message-input';
// ----------------------------------------------------------------------

const dummyMessages = [
  {
    id: '92336b8e-39d5-4afe-af31-779b446d0019',
    body: 'She eagerly opened the gift, her eyes sparkling with excitement.',
    contentType: 'text',
    attachments: [
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
        name: 'cover-2.jpg',
        path: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_3.jpg',
        preview: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_3.jpg',
        size: 48000000,
        createdAt: '2024-05-27T14:01:06.142Z',
        modifiedAt: '2024-05-27T14:01:06.142Z',
        type: 'jpg',
      },
    ],
    createdAt: '2024-05-27T04:08:34.666Z',
    senderId: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
  },
  {
    id: 'd3c91a28-ce8b-43ce-9ae7-cd34c1e06e45',
    body: 'The old oak tree stood tall and majestic, its branches swaying gently in the breeze.',
    contentType: 'text',
    attachments: [
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
        name: 'design-suriname-2015.mp3',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/design_suriname_2015.mp3',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/design_suriname_2015.mp3',
        size: 24000000,
        createdAt: '2024-05-26T13:01:06.142Z',
        modifiedAt: '2024-05-26T13:01:06.142Z',
        type: 'mp3',
      },
    ],
    createdAt: '2024-05-27T12:08:34.666Z',
    senderId: '8864c717-587d-472a-929a-8e5f298024da-0',
  },
  {
    id: 'b8577fac-a0af-4b91-8c3e-7add5dce358a',
    body: 'The aroma of freshly brewed coffee filled the air, awakening my senses.',
    contentType: 'text',
    attachments: [
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
        name: 'expertise-2015-conakry-sao-tome-and-principe-gender.mp4',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/expertise_2015_conakry_sao-tome-and-principe_gender.mp4',
        preview:
          'https://www.cloud.com/s/c218bo6kjuqyv66/expertise_2015_conakry_sao-tome-and-principe_gender.mp4',
        size: 16000000,
        createdAt: '2024-05-25T12:01:06.142Z',
        modifiedAt: '2024-05-25T12:01:06.143Z',
        type: 'mp4',
      },
    ],
    createdAt: '2024-05-27T14:00:34.666Z',
    senderId: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
  },
  {
    id: 'dcafbf6d-6a6b-4efe-8dea-d3d76ada8cee',
    body: 'The children giggled with joy as they ran through the sprinklers on a hot summer day.',
    contentType: 'text',
    attachments: [
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
        name: 'money-popup-crack.pdf',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/money-popup-crack.pdf',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/money-popup-crack.pdf',
        size: 12000000,
        createdAt: '2024-05-24T11:01:06.143Z',
        modifiedAt: '2024-05-24T11:01:06.143Z',
        type: 'pdf',
      },
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5',
        name: 'cover-4.jpg',
        path: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_4.jpg',
        preview: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_4.jpg',
        size: 9600000,
        createdAt: '2024-05-23T10:01:06.143Z',
        modifiedAt: '2024-05-23T10:01:06.143Z',
        type: 'jpg',
      },
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6',
        name: 'cover-6.jpg',
        path: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_6.jpg',
        preview: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_6.jpg',
        size: 8000000,
        createdAt: '2024-05-22T09:01:06.143Z',
        modifiedAt: '2024-05-22T09:01:06.143Z',
        type: 'jpg',
      },
    ],
    createdAt: '2024-05-27T14:02:34.666Z',
    senderId: '8864c717-587d-472a-929a-8e5f298024da-0',
  },
  {
    id: '8e7f4362-54ea-43d7-87ef-e9bccff7b351',
    body: 'He carefully crafted a beautiful sculpture out of clay, his hands skillfully shaping the intricate details.',
    contentType: 'text',
    attachments: [
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7',
        name: 'large-news.txt',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/large_news.txt',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/large_news.txt',
        size: 6857142.857142857,
        createdAt: '2024-05-21T08:01:06.143Z',
        modifiedAt: '2024-05-21T08:01:06.143Z',
        type: 'txt',
      },
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b8',
        name: 'nauru-6015-small-fighter-left-gender.psd',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/nauru-6015-small-fighter-left-gender.psd',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/nauru-6015-small-fighter-left-gender.psd',
        size: 6000000,
        createdAt: '2024-05-20T07:01:06.143Z',
        modifiedAt: '2024-05-20T07:01:06.143Z',
        type: 'psd',
      },
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b9',
        name: 'tv-xs.doc',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/tv-xs.doc',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/tv-xs.doc',
        size: 5333333.333333333,
        createdAt: '2024-05-19T06:01:06.143Z',
        modifiedAt: '2024-05-19T06:01:06.143Z',
        type: 'doc',
      },
      {
        id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b10',
        name: 'gustavia-entertainment-productivity.docx',
        path: 'https://www.cloud.com/s/c218bo6kjuqyv66/gustavia-entertainment-productivity.docx',
        preview: 'https://www.cloud.com/s/c218bo6kjuqyv66/gustavia-entertainment-productivity.docx',
        size: 4800000,
        createdAt: '2024-05-18T05:01:06.143Z',
        modifiedAt: '2024-05-18T05:01:06.143Z',
        type: 'docx',
      },
    ],
    createdAt: '2024-05-27T14:04:34.666Z',
    senderId: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
  },
  {
    id: 'c663e304-c2c4-4ee5-96cb-ce9dcd6cc58b',
    attachments: [],
    contentType: 'image',
    body: 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_5.jpg',
    createdAt: '2024-05-27T14:06:34.666Z',
    senderId: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
  },
  {
    id: '88c77a68-4db8-4b16-ae3b-6898a73c68f8',
    contentType: 'text',
    attachments: [],
    body: 'The concert was a mesmerizing experience, with the music filling the venue and the crowd cheering in delight.',
    createdAt: '2024-05-27T14:06:34.666Z',
    senderId: '8864c717-587d-472a-929a-8e5f298024da-0',
  },
  {
    id: 'fd0bacaa-7ffd-4aae-81ee-a3c6a5ac4d39',
    body: 'The waves crashed against the shore, creating a soothing symphony of sound.',
    contentType: 'text',
    attachments: [],
    createdAt: '2024-05-27T14:06:34.666Z',
    senderId: '8864c717-587d-472a-929a-8e5f298024da-0',
  },
];

const dummyParticipants = [
  {
    status: 'online',
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    role: 'admin',
    email: 'demo@minimals.cc',
    name: 'Jaydon Frankie',
    lastActivity: '2024-05-27T14:08:34.665Z',
    address: '90210 Broadway Blvd',
    avatarUrl: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_25.jpg',
    phoneNumber: '+40 777666555',
  },
  {
    status: 'online',
    id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
    role: 'Data Analyst',
    email: 'ashlynn_ohara62@gmail.com',
    name: 'Lucian Obrien',
    lastActivity: '2024-05-26T13:08:34.666Z',
    address: '1147 Rohan Drive Suite 819 - Burlington, VT / 82021',
    avatarUrl: 'https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_2.jpg',
    phoneNumber: '904-966-2836',
  },
];
export default function TicketQuickEditForm({ currentTicket, open, onClose, onRefreshTickets }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewTicketSchema = Yup.object().shape({
    query: Yup.string().required('Query is required'),
    description: Yup.string().required('Description is required'),
    status: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      query: currentTicket?.query || '',
      description: currentTicket?.description || '',
      status: currentTicket?.status || '',
    }),
    [currentTicket]
  );

  const methods = useForm({
    resolver: yupResolver(NewTicketSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        query: data.query,
        description: data.description,
        status: data.status,
      };
      await axiosInstance.patch(`/tickets/${currentTicket.id}`, inputData);
      // reset();
      onRefreshTickets();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const renderMessages = (
    <Stack component={Card} direction="row" sx={{ height: '52vh' }}>
      <Stack
        sx={{
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
            borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Stack
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
            }}
          >
            <ChatMessageList messages={dummyMessages} participants={dummyParticipants} />

            <ChatMessageInput
              recipients={[]}
              onAddRecipients={() => {}}
              //
              selectedConversationId={1}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            mt={2}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              {[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'rejected', label: 'Rejected' },
              ].map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <RHFTextField name="query" label="Query" disabled />

            <RHFTextField name="description" label="Description" disabled />
          </Box>

          <Box style={{margin:"16px 0px"}}>{renderMessages}</Box>
        </DialogContent>

        {/* <DialogActions sx={{ display: 'flex', justifyContent: 'center !important' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            style={{
              backgroundColor: '#00554E',
              width: '160px',
              height: '40px',
            }}
          >
            Update
          </LoadingButton>
          <Button
            variant="outlined"
            onClick={onClose}
            style={{
              width: '160px',
              height: '40px',
            }}
          >
            Cancel
          </Button>
        </DialogActions> */}
      </FormProvider>
    </Dialog>
  );
}

TicketQuickEditForm.propTypes = {
  currentTicket: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshTickets: PropTypes.func,
  open: PropTypes.bool,
};
