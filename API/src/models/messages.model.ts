import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Ticket} from './ticket.model';

@model()
export class Messages extends Entity {
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
  content: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => User)
  senderId: number;

  @belongsTo(() => Ticket)
  ticketId: number;

  constructor(data?: Partial<Messages>) {
    super(data);
  }

}

export interface MessagesRelations {
  // describe navigational properties here
}

export type MessagesWithRelations = Messages & MessagesRelations;
