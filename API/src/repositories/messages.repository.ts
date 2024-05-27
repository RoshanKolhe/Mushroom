import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {Messages, MessagesRelations, User, Ticket} from '../models';
import {UserRepository} from './user.repository';
import {TicketRepository} from './ticket.repository';

export class MessagesRepository extends DefaultCrudRepository<
  Messages,
  typeof Messages.prototype.id,
  MessagesRelations
> {

  public readonly sender: BelongsToAccessor<User, typeof Messages.prototype.id>;

  public readonly ticket: BelongsToAccessor<Ticket, typeof Messages.prototype.id>;

  constructor(
    @inject('datasources.mushroom') dataSource: MushroomDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('TicketRepository') protected ticketRepositoryGetter: Getter<TicketRepository>,
  ) {
    super(Messages, dataSource);
    this.ticket = this.createBelongsToAccessorFor('ticket', ticketRepositoryGetter,);
    this.registerInclusionResolver('ticket', this.ticket.inclusionResolver);
    this.sender = this.createBelongsToAccessorFor('sender', userRepositoryGetter,);
    this.registerInclusionResolver('sender', this.sender.inclusionResolver);
  }
}
