import {Entity, model, property} from '@loopback/repository';

@model()
export class UserProfile extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property({
    type: 'string',
  })
  bio?: string;

  @property({
    type: 'object',
  })
  gallery: object;

  @property({
    type: 'object',
  })
  paymentInfo?: object;

  @property({
    type: 'object',
  })
  socials?: object;

  @property({
    type: 'object',
  })
  address?: object;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'number',
  })
  userId?: number;

  constructor(data?: Partial<UserProfile>) {
    super(data);
  }
}

export interface UserProfileRelations {
  // describe navigational properties here
}

export type UserProfileWithRelations = UserProfile & UserProfileRelations;
