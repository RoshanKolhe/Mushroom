import {
  Entity,
  model,
  property,
  belongsTo,
  hasMany,
} from '@loopback/repository';
import {Hut} from './hut.model';
import {User} from './user.model';
import {Messages} from './messages.model';

@model()
export class Ticket extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  ticketId: string;

  @property({
    type: 'string',
    required: true,
  })
  query: string;

  @property({
    type: 'string',
    required: true,
    length: 10000,
  })
  description: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  media: object[];

  @property({
    type: 'string',
    default: 'open',
  })
  status: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => Hut)
  hutId: number;

  @belongsTo(() => User)
  userId: number;

  @hasMany(() => Messages)
  messages: Messages[];

  constructor(data?: Partial<Ticket>) {
    super(data);
  }
}

export interface TicketRelations {
  // describe navigational properties here
}

export type TicketWithRelations = Ticket & TicketRelations;
