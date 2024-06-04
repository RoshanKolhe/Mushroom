import {Entity, model, property} from '@loopback/repository';

@model()
export class SalesData extends Entity {
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
  orderId: string;

  @property({
    type: 'string',
    required: true,
  })
  hsn: string;

  @property({
    type: 'string',
    required: true,
  })
  date: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  quantity: string;

  @property({
    type: 'string',
    required: true,
  })
  amount: string;

  @property({
    type: 'string',
    required: true,
  })
  rate: string;

  @property({
    type: 'string',
    required: true,
  })
  gstPercentage: string;

  @property({
    type: 'object',
  })
  invoice?: object;

  @property({
    type: 'string',
    default: 'pending',
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

  constructor(data?: Partial<SalesData>) {
    super(data);
  }
}

export interface SalesDataRelations {
  // describe navigational properties here
}

export type SalesDataWithRelations = SalesData & SalesDataRelations;
