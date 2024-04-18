import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {Hut, HutRelations, Cluster, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ClusterRepository} from './cluster.repository';
import {UserRepository} from './user.repository';

export class HutRepository extends TimeStampRepositoryMixin<
  Hut,
  typeof Hut.prototype.id,
  Constructor<DefaultCrudRepository<Hut, typeof Hut.prototype.id, HutRelations>>
>(DefaultCrudRepository) {

  public readonly cluster: BelongsToAccessor<Cluster, typeof Hut.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Hut.prototype.id>;

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('ClusterRepository') protected clusterRepositoryGetter: Getter<ClusterRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Hut, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.cluster = this.createBelongsToAccessorFor('cluster', clusterRepositoryGetter,);
    this.registerInclusionResolver('cluster', this.cluster.inclusionResolver);
  }
}
