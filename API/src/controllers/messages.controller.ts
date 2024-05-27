import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import { MessagesRepository } from '../repositories';
import { Messages } from '../models';

export class MessagesController {
  constructor(
    @repository(MessagesRepository)
    public messageRepository: MessagesRepository,
  ) {}

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
  ): Promise<Messages[]> {
    return this.messageRepository.find({
      where: {ticketId: ticketId},
      include: ['sender'],
    });
  }
}
