import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {Ticket, TicketRelations, Hut, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HutRepository} from './hut.repository';
import {UserRepository} from './user.repository';

export class TicketRepository extends TimeStampRepositoryMixin<
  Ticket,
  typeof Ticket.prototype.id,
  Constructor<
    DefaultCrudRepository<Ticket, typeof Ticket.prototype.id, TicketRelations>
  >
>(DefaultCrudRepository) {

  public readonly hut: BelongsToAccessor<Hut, typeof Ticket.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Ticket.prototype.id>;

  constructor(@inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('HutRepository') protected hutRepositoryGetter: Getter<HutRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Ticket, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.hut = this.createBelongsToAccessorFor('hut', hutRepositoryGetter,);
    this.registerInclusionResolver('hut', this.hut.inclusionResolver);
  }
}
