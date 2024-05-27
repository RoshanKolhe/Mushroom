import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {User, UserRelations, Hut, Cluster} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HutRepository} from './hut.repository';
import {ClusterRepository} from './cluster.repository';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends TimeStampRepositoryMixin<
  User,
  typeof User.prototype.id,
  Constructor<
    DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  >
>(DefaultCrudRepository) {

  public readonly hut: HasOneRepositoryFactory<Hut, typeof User.prototype.id>;

  public readonly groupClusters: HasManyRepositoryFactory<Cluster, typeof User.prototype.id>;

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('HutRepository') protected hutRepositoryGetter: Getter<HutRepository>, @repository.getter('ClusterRepository') protected clusterRepositoryGetter: Getter<ClusterRepository>,) {
    super(User, dataSource);
    this.groupClusters = this.createHasManyRepositoryFactoryFor('groupClusters', clusterRepositoryGetter,);
    this.registerInclusionResolver('groupClusters', this.groupClusters.inclusionResolver);
    this.hut = this.createHasOneRepositoryFactoryFor('hut', hutRepositoryGetter);
    this.registerInclusionResolver('hut', this.hut.inclusionResolver);
  }
}
