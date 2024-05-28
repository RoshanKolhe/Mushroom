import {repository} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, requestBody} from '@loopback/rest';
import {MessagesRepository} from '../repositories';
import {Messages} from '../models';
import {authenticate} from '@loopback/authentication';

export class MessagesController {
  constructor(
    @repository(MessagesRepository)
    public messageRepository: MessagesRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
  })
  @post('/messages', {
    responses: {
      '200': {
        description: 'Messages model instance',
        content: {'application/json': {schema: getModelSchemaRef(Messages)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Messages, {
            title: 'NewMessage',
            exclude: ['id'],
          }),
        },
      },
    })
    message: Omit<Messages, 'id'>,
  ): Promise<Messages> {
    return this.messageRepository.create(message);
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/tickets/{id}/messages', {
    responses: {
      '200': {
        description: 'Array of Messages model instances for a specific ticket',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Messages, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findMessagesByTicketId(
    @param.path.number('id') ticketId: number,
  ): Promise<any> {
    const messages = await this.messageRepository.find({
      where: {ticketId: ticketId},
      include: ['sender'],
    });
    const participantsMap = new Map<number, object>();

    messages.forEach((message: any) => {
      if (message.sender && !participantsMap.has(message.sender.id)) {
        participantsMap.set(message.sender.id, message.sender);
      }
    });

    const participants = Array.from(participantsMap.values()).map(sender => ({
      ...sender,
    }));

    return Promise.resolve({
      messages: messages,
      participants: participants,
    });
  }
}
