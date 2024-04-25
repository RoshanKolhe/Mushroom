import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {SalesData, SalesDataRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class SalesDataRepository extends TimeStampRepositoryMixin<
  SalesData,
  typeof SalesData.prototype.id,
  Constructor<
    DefaultCrudRepository<
      SalesData,
      typeof SalesData.prototype.id,
      SalesDataRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource) {
    super(SalesData, dataSource);
  }
}
