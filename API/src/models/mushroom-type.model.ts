import {Entity, model, property} from '@loopback/repository';

@model()
export class MushroomType extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  minimumHumidity: string;

  @property({
    type: 'string',
    required: true,
  })
  maximumHumidity: string;

  @property({
    type: 'string',
    required: true,
  })
  minimumMoisture: string;

  @property({
    type: 'string',
    required: true,
  })
  maximumMoisture: string;

  @property({
    type: 'string',
    required: true,
  })
  minimumTemprature: string;

  @property({
    type: 'string',
    required: true,
  })
  maximumTemprature: string;

  @property({
    type: 'string',
    required: true,
  })
  maxRow: string;

  @property({
    type: 'string',
    required: true,
  })
  maxColumn: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  colors?: string[];

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<MushroomType>) {
    super(data);
  }
}

export interface MushroomTypeRelations {
  // describe navigational properties here
}

export type MushroomTypeWithRelations = MushroomType & MushroomTypeRelations;
