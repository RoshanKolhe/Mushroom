import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Cluster} from './cluster.model';
import {User} from './user.model';

@model()
export class Hut extends Entity {
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
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => Cluster)
  clusterId: number;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<Hut>) {
    super(data);
  }
}

export interface HutRelations {
  // describe navigational properties here
}

export type HutWithRelations = Hut & HutRelations;
