import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {User, UserRelations, Hut} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HutRepository} from './hut.repository';

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

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('HutRepository') protected hutRepositoryGetter: Getter<HutRepository>,) {
    super(User, dataSource);
    this.hut = this.createHasOneRepositoryFactoryFor('hut', hutRepositoryGetter);
    this.registerInclusionResolver('hut', this.hut.inclusionResolver);
  }
}
