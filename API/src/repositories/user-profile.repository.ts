import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {UserProfile, UserProfileRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class UserProfileRepository extends TimeStampRepositoryMixin<
  UserProfile,
  typeof UserProfile.prototype.id,
  Constructor<
    DefaultCrudRepository<
      UserProfile,
      typeof UserProfile.prototype.id,
      UserProfileRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource) {
    super(UserProfile, dataSource);
  }
}
