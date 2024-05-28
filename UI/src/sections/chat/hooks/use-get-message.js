// ----------------------------------------------------------------------

export default function useGetMessage({ message, participants, currentUserId }) {
  const sender = participants.find((participant) => participant.id === message.senderId);

  const senderDetails =
    message.senderId === currentUserId
      ? {
          type: 'me',
        }
      : {
          avatarUrl: sender?.avatar?.fileUrl,
          firstName: sender?.firstName,
        };

  const me = senderDetails.type === 'me';

  const hasImage = message.contentType === 'image';

  return {
    hasImage,
    me,
    senderDetails,
  };
}
