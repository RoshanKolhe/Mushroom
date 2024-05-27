import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model()
export class Cluster extends Entity {
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
  noOfHuts: string;

  @property({
    type: 'string',
    required: true,
  })
  totalCultivation: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => User)
  userId: number;

  @property({
    type: 'number',
  })
  groupUserId?: number;

  constructor(data?: Partial<Cluster>) {
    super(data);
  }
}

export interface ClusterRelations {
  // describe navigational properties here
}

export type ClusterWithRelations = Cluster & ClusterRelations;
