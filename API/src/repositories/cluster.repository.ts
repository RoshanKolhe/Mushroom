import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {Cluster, ClusterRelations, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';

export class ClusterRepository extends TimeStampRepositoryMixin<
  Cluster,
  typeof Cluster.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Cluster,
      typeof Cluster.prototype.id,
      ClusterRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly user: BelongsToAccessor<User, typeof Cluster.prototype.id>;

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Cluster, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
