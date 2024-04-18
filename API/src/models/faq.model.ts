import {Entity, model, property} from '@loopback/repository';

@model()
export class Faq extends Entity {
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
  question: string;

  @property({
    type: 'string',
    required: true,
  })
  answer: string;

  @property({
    type: 'boolean',
    default: true,
  })
  status?: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;


  constructor(data?: Partial<Faq>) {
    super(data);
  }
}

export interface FaqRelations {
  // describe navigational properties here
}

export type FaqWithRelations = Faq & FaqRelations;
