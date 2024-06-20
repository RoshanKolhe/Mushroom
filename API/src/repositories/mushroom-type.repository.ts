import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {MushroomType, MushroomTypeRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class MushroomTypeRepository extends TimeStampRepositoryMixin<
  MushroomType,
  typeof MushroomType.prototype.id,
  Constructor<
    DefaultCrudRepository<
      MushroomType,
      typeof MushroomType.prototype.id,
      MushroomTypeRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource) {
    super(MushroomType, dataSource);
  }
}
