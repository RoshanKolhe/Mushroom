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
  user: string;

  @property({
    type: 'string',
    required: true,
  })
  date: string;

  @property({
    type: 'string',
    required: true,
  })
  noOfSales: string;

  @property({
    type: 'string',
    required: true,
  })
  totalPrice: string;

  @property({
    type: 'object',
    required: true,
  })
  invoice: object;

  @property({
    type: 'string',
    default: 'pending',
  })
  status: string;

  constructor(data?: Partial<SalesData>) {
    super(data);
  }
}

export interface SalesDataRelations {
  // describe navigational properties here
}

export type SalesDataWithRelations = SalesData & SalesDataRelations;
