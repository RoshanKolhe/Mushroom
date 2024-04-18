import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {Faq, FaqRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class FaqRepository extends TimeStampRepositoryMixin<
  Faq,
  typeof Faq.prototype.id,
  Constructor<DefaultCrudRepository<Faq, typeof Faq.prototype.id, FaqRelations>>
>(DefaultCrudRepository) {
  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource) {
    super(Faq, dataSource);
  }
}
