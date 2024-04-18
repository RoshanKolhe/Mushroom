import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {EnvironmentData, EnvironmentDataRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class EnvironmentDataRepository extends TimeStampRepositoryMixin<
  EnvironmentData,
  typeof EnvironmentData.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EnvironmentData,
      typeof EnvironmentData.prototype.id,
      EnvironmentDataRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource) {
    super(EnvironmentData, dataSource);
  }
} 
