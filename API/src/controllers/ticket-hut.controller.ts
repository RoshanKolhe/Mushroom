import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Ticket,
  Hut,
} from '../models';
import {TicketRepository} from '../repositories';

export class TicketHutController {
  constructor(
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
  ) { }

  @get('/tickets/{id}/hut', {
    responses: {
      '200': {
        description: 'Hut belonging to Ticket',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Hut),
          },
        },
      },
    },
  })
  async getHut(
    @param.path.number('id') id: typeof Ticket.prototype.id,
  ): Promise<Hut> {
    return this.ticketRepository.hut(id);
  }
}
