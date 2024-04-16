import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
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

export class ClusterController {
  constructor(
    @repository(ClusterRepository)
    public clusterRepository: ClusterRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

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
    const user = await this.userRepository.findById(cluster.userId);
    if (!user.permissions.includes('cluster_admin')) {
      throw new HttpErrors.BadRequest(
        'only user with cluster admin permission can be assign to cluster',
      );
    }
    return this.clusterRepository.create(cluster);
  }

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
    @param.filter(Cluster) filter?: Filter<Cluster>,
  ): Promise<Cluster[]> {
    return this.clusterRepository.find({...filter, include: ['user']});
  }

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
    await this.clusterRepository.updateById(id, cluster);
  }

  @del('/clusters/{id}')
  @response(204, {
    description: 'Cluster DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clusterRepository.deleteById(id);
  }
}
