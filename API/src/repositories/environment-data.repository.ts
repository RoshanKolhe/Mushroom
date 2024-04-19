import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {EnvironmentData, EnvironmentDataRelations, Hut} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HutRepository} from './hut.repository';

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

  public readonly hut: BelongsToAccessor<Hut, typeof EnvironmentData.prototype.id>;

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('HutRepository') protected hutRepositoryGetter: Getter<HutRepository>,) {
    super(EnvironmentData, dataSource);
    this.hut = this.createBelongsToAccessorFor('hut', hutRepositoryGetter,);
    this.registerInclusionResolver('hut', this.hut.inclusionResolver);
  }
} 
