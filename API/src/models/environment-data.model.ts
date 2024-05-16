import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Hut} from './hut.model';

@model()
export class EnvironmentData extends Entity {
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
  date: string;

  @property({
    type: 'string',
    required: true,
  })
  time: string;

  @property({
    type: 'string',
    required: true,
  })
  longitude: string;

  @property({
    type: 'string',
    required: true,
  })
  latitude?: string;

  @property({
    type: 'string',
    required: true,
  })
  temprature: string;

  @property({
    type: 'string',
    required: true,
  })
  moisture: string;

  @property({
    type: 'string',
    required: true,
  })
  humidity: string;

  @property({
    type: 'string',
    required: true,
  })
  mushroomType: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isColorChanged?: boolean;

  @property({
    type: 'string',
  })
  changedColor?: string;

  @property({
    type: 'string',
  })
  changedColorRow?: string;

  @property({
    type: 'string',
  })
  changedColorColumn?: string;

  @property({
    type: 'string',
    required: true,
  })
  quantity: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  files?: object[];

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

  constructor(data?: Partial<EnvironmentData>) {
    super(data);
  }
}

export interface EnvironmentDataRelations {
  // describe navigational properties here
}

export type EnvironmentDataWithRelations = EnvironmentData &
  EnvironmentDataRelations;
