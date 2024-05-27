import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {UserProfile} from '@loopback/security';

import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Ticket} from '../models';
import {
  ClusterRepository,
  HutRepository,
  TicketRepository,
  UserRepository,
} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {generateUniqueId} from '../utils/constants';

export class TicketController {
  constructor(
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
    @repository(HutRepository)
    public hutRepository: HutRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ClusterRepository)
    public clusterRepository: ClusterRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.CLUSTER_ADMIN,
      ],
    },
  })
  @post('/create-tickets')
  @response(200, {
    description: 'Ticket model instance',
    content: {'application/json': {schema: getModelSchemaRef(Ticket)}},
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ticket, {
            title: 'NewTicket',
            exclude: ['id', 'ticketId'],
          }),
        },
      },
    })
    ticket: Omit<Ticket, 'id'>,
  ): Promise<Ticket> {
    const inptData: any = {
      ...ticket,
      ticketId: generateUniqueId(),
      hutId: ticket.hutId,
      userId: currnetUser.id,
    };
    return this.ticketRepository.create(inptData);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.GROUP_ADMIN,
      ],
    },
  })
  @post('/tickets')
  @response(200, {
    description: 'Array of Ticket model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Ticket, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @requestBody() ticketData:any,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Ticket) filter?: Filter<Ticket>,
  ): Promise<Ticket[]> {
    const user = await this.userRepository.findById(currnetUser.id);
    console.log(user);
    if (user.permissions.includes('super_admin')) {
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        order: ['createdAt DESC'],
      });
    } else if (user.permissions.includes('hut_user')) {
      return this.ticketRepository.find({
        ...filter,
        where: {
          ...((filter && filter.where) || {}),
          hutId: ticketData.hutId,
        },
        include: ['user'],
        order: ['createdAt DESC'],
      });
    } else if (user.permissions.includes('group_admin')) {
      const userClusters = await this.clusterRepository.find({
        where: {
          groupUserId: currnetUser.id,
        },
      });
      const userClusterIds: any = userClusters.map(cluster => cluster.id);
      const hutsAssignToClusters = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
      });
      const hutIds: any = hutsAssignToClusters.map(hut => hut.id);
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        where: {
          ...((filter && filter.where) || {}),
          hutId: {
            inq: hutIds,
          },
        },
        order: ['createdAt DESC'],
      });
    } else {
      const userClusters = await this.clusterRepository.find({
        where: {
          userId: currnetUser.id,
        },
      });
      const userClusterIds: any = userClusters.map(cluster => cluster.id);
      const hutsAssignToClusters = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
      });
      const hutIds: any = hutsAssignToClusters.map(hut => hut.id);
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        where: {
          ...((filter && filter.where) || {}),
          hutId: {
            inq: hutIds,
          },
        },
        order: ['createdAt DESC'],
      });
    }
  }


  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.GROUP_ADMIN,
      ],
    },
  })
  @get('/tickets-with-filter')
  @response(200, {
    description: 'Array of Ticket model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Ticket, {includeRelations: true}),
        },
      },
    },
  })
  async findAllTickets(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Ticket) filter?: Filter<Ticket>,
  ): Promise<Ticket[]> {
    const user = await this.userRepository.findById(currnetUser.id);
    if (user.permissions.includes('super_admin')) {
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        order: ['createdAt DESC'],
      });
    } else if (user.permissions.includes('group_admin')) {
      const userClusters = await this.clusterRepository.find({
        where: {
          groupUserId: currnetUser.id,
        },
      });
      const userClusterIds: any = userClusters.map(cluster => cluster.id);
      const hutsAssignToClusters = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
      });
      const hutIds: any = hutsAssignToClusters.map(hut => hut.id);
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        where: {
          ...((filter && filter.where) || {}),
          hutId: {
            inq: hutIds,
          },
        },
        order: ['createdAt DESC'],
      });
    } else {
      const userClusters = await this.clusterRepository.find({
        where: {
          userId: currnetUser.id,
        },
      });
      const userClusterIds: any = userClusters.map(cluster => cluster.id);
      const hutsAssignToClusters = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
      });
      const hutIds: any = hutsAssignToClusters.map(hut => hut.id);
      return this.ticketRepository.find({
        ...filter,
        include: ['user'],
        where: {
          ...((filter && filter.where) || {}),
          hutId: {
            inq: hutIds,
          },
        },
        order: ['createdAt DESC'],
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.CLUSTER_ADMIN,
      ],
    },
  })
  @get('/tickets/{id}')
  @response(200, {
    description: 'Ticket model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Ticket, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Ticket, {exclude: 'where'})
    filter?: FilterExcludingWhere<Ticket>,
  ): Promise<Ticket> {
    return this.ticketRepository.findById(id, filter);
  }

  @patch('/tickets/{id}')
  @response(204, {
    description: 'Ticket PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ticket, {partial: true}),
        },
      },
    })
    ticket: Ticket,
  ): Promise<void> {
    await this.ticketRepository.updateById(id, ticket);
  }

  @del('/tickets/{id}')
  @response(204, {
    description: 'Ticket DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.ticketRepository.deleteById(id);
  }
}
