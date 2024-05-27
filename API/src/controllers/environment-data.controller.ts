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
import {EnvironmentData} from '../models';
import {
  ClusterRepository,
  EnvironmentDataRepository,
  HutRepository,
  UserRepository,
} from '../repositories';
import {inject} from '@loopback/core';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {request} from 'http';

export class EnvironmentDataController {
  constructor(
    @repository(EnvironmentDataRepository)
    public environmentDataRepository: EnvironmentDataRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ClusterRepository)
    public clusterRepository: ClusterRepository,
    @repository(HutRepository)
    public hutRepository: HutRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
      ],
    },
  })
  @post('/environment-data')
  @response(200, {
    description: 'EnvironmentData model instance',
    content: {'application/json': {schema: getModelSchemaRef(EnvironmentData)}},
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EnvironmentData, {
            title: 'NewEnvironmentData',
            exclude: ['id'],
          }),
        },
      },
    })
    environmentData: Omit<EnvironmentData, 'id'>,
  ): Promise<EnvironmentData> {
    const user = await this.userRepository.findById(currnetUser.id, {
      include: ['hut'],
    });
    if (!user.hut) {
      throw new HttpErrors.BadRequest('No hut is assigned to this user');
    }

    return this.environmentDataRepository.create({
      ...environmentData,
      hutId: user.hut.id,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
      ],
    },
  })
  @post('/environment-data')
  @response(200, {
    description: 'Array of EnvironmentData model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EnvironmentData, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @requestBody()
    environmentData: any,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(EnvironmentData) filter?: Filter<EnvironmentData>,
  ): Promise<EnvironmentData[]> {
    const currentUserPermission = currnetUser.permissions;
    if (currentUserPermission.includes('super_admin')) {
      return this.environmentDataRepository.find(filter);
    } else {
      // const user = await this.userRepository.findById(currnetUser.id, {
      //   include: ['hut'],
      // });
      // if (!user.hut) {
      //   throw new HttpErrors.BadRequest('No hut is assigned to this user');
      // }
      return this.environmentDataRepository.find({
        ...filter,
        where: {
          hutId: environmentData.hutId,
        },
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
      ],
    },
  })
  @get('/environment-data/{id}')
  @response(200, {
    description: 'EnvironmentData model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EnvironmentData, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EnvironmentData, {exclude: 'where'})
    filter?: FilterExcludingWhere<EnvironmentData>,
  ): Promise<EnvironmentData> {
    return this.environmentDataRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
      ],
    },
  })
  @patch('/environment-data/{id}')
  @response(204, {
    description: 'EnvironmentData PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EnvironmentData, {partial: true}),
        },
      },
    })
    environmentData: EnvironmentData,
  ): Promise<void> {
    await this.environmentDataRepository.updateById(id, environmentData);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
      ],
    },
  })
  @del('/environment-data/{id}')
  @response(204, {
    description: 'EnvironmentData DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.environmentDataRepository.deleteById(id);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.GROUP_ADMIN,
      ],
    },
  })
  @get('/missing-entries', {
    responses: {
      '200': {
        description:
          'Array of missing EnvironmentData entries with Hut details',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {type: 'string'},
                  hut: {
                    type: 'object',
                    properties: {
                      id: {type: 'number'},
                      name: {type: 'string'},
                      // Include other Hut properties as needed
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async findMissingEntries(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.query.string('startDate') startDate: string,
    @param.query.string('endDate') endDate: string,
  ): Promise<any> {
    const {startDate: defaultStartDate, endDate: defaultEndDate} =
      this.getDefaultDates();

    // Set default values if not provided
    if (!startDate) {
      startDate = defaultStartDate;
    }
    if (!endDate) {
      endDate = defaultEndDate;
    }
    let huts = [];
    if (currnetUser.permissions.includes('super_admin')) {
      huts = await this.hutRepository.find({include: ['user', 'cluster']});
    } else if (currnetUser.permissions.includes('cluster_admin')) {
      const userAssignedClusters = await this.clusterRepository.find({
        where: {
          userId: currnetUser.id,
        },
      });
      const userClusterIds: any = userAssignedClusters.map(
        cluster => cluster.id,
      );
      huts = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
        include: ['user', 'cluster'],
      });
    } else if (currnetUser.permissions.includes('group_admin')) {
      const userAssignedClusters = await this.clusterRepository.find({
        where: {
          groupUserId: currnetUser.id,
        },
      });
      const userClusterIds: any = userAssignedClusters.map(
        cluster => cluster.id,
      );
      huts = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
        include: ['user', 'cluster'],
      });
    } else {
      huts = await this.hutRepository.find({
        where: {
          userId: currnetUser.id,
        },
        include: ['user', 'cluster'],
      });
    }
    const missingEntries =
      await this.environmentDataRepository.findMissingEntries(
        startDate,
        endDate,
        huts,
      );

    return missingEntries;
  }

  getDefaultDates() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const lastMonthFirstDay = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    return {
      startDate: lastMonthFirstDay.toISOString().split('T')[0],
      endDate: yesterday.toISOString().split('T')[0],
    };
  }
}
