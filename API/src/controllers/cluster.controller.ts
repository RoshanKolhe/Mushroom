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
import {Cluster} from '../models';
import {ClusterRepository, UserRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';

export class ClusterController {
  constructor(
    @repository(ClusterRepository)
    public clusterRepository: ClusterRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/clusters')
  @response(200, {
    description: 'Cluster model instance',
    content: {'application/json': {schema: getModelSchemaRef(Cluster)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cluster, {
            title: 'NewCluster',
            exclude: ['id'],
          }),
        },
      },
    })
    cluster: Omit<Cluster, 'id'>,
  ): Promise<Cluster> {
    const existingCluster = await this.clusterRepository.findOne({
      where: {userId: cluster.userId},
    });
    if (existingCluster) {
      throw new HttpErrors.BadRequest(
        'This user is already assigned to another cluster',
      );
    }
    const user = await this.userRepository.findById(cluster.userId);
    if (!user.permissions.includes('cluster_admin')) {
      throw new HttpErrors.BadRequest(
        'only user with cluster admin permission can be assign to cluster',
      );
    }
    return this.clusterRepository.create(cluster);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.GROUP_ADMIN,
      ],
    },
  })
  @get('/clusters')
  @response(200, {
    description: 'Array of Cluster model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Cluster, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Cluster) filter?: Filter<Cluster>,
  ): Promise<Cluster[]> {
    const currentUserPermission = currnetUser.permissions;
    if (currentUserPermission.includes('super_admin')) {
      return this.clusterRepository.find({...filter, include: ['user']});
    } else if (currentUserPermission.includes('group_admin')) {
      return this.clusterRepository.find({
        ...filter,
        include: ['user'],
        where: {groupUserId: currnetUser.id},
      });
    } else {
      return this.clusterRepository.find({
        ...filter,
        include: ['user'],
        where: {userId: currnetUser.id},
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/clusters/{id}')
  @response(200, {
    description: 'Cluster model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Cluster, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Cluster, {exclude: 'where'})
    filter?: FilterExcludingWhere<Cluster>,
  ): Promise<Cluster> {
    return this.clusterRepository.findById(id, {...filter, include: ['user']});
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/clusters/{id}')
  @response(204, {
    description: 'Cluster PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cluster, {partial: true}),
        },
      },
    })
    cluster: Cluster,
  ): Promise<void> {
    const existingCluster = await this.clusterRepository.findOne({
      where: {
        and: [{id: {neq: id}}, {userId: cluster.userId}],
      },
    });
    if (existingCluster) {
      throw new HttpErrors.BadRequest(
        'This user is already assigned to another cluster',
      );
    }
    await this.clusterRepository.updateById(id, cluster);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/clusters/{id}')
  @response(204, {
    description: 'Cluster DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clusterRepository.deleteById(id);
  }
}
