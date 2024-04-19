import {Entity, model, property, hasOne, hasMany} from '@loopback/repository';
import {Hut} from './hut.model';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  fullName: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  phoneNumber: string;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property.array(String, {
    name: 'permissions',
  })
  permissions: String[];

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'string',
  })
  otpExpireAt: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @hasOne(() => Hut)
  hut: Hut;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
