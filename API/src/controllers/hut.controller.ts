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
import {Hut} from '../models';
import {HutRepository, UserRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class HutController {
  constructor(
    @repository(HutRepository)
    public hutRepository: HutRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @post('/huts')
  @response(200, {
    description: 'Hut model instance',
    content: {'application/json': {schema: getModelSchemaRef(Hut)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hut, {
            title: 'NewHut',
            exclude: ['id'],
          }),
        },
      },
    })
    hut: Omit<Hut, 'id'>,
  ): Promise<Hut> {
    const existingHut = await this.hutRepository.findOne({
      where: {userId: hut.userId},
    });
    if (existingHut) {
      throw new HttpErrors.BadRequest(
        'This user is already assigned to another hut',
      );
    }

    const user = await this.userRepository.findById(hut.userId);
    if (!user.permissions.includes('hut_admin')) {
      throw new HttpErrors.BadRequest(
        'only user with hut admin permission can be assign to this hut',
      );
    }
    return this.hutRepository.create(hut);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @get('/huts')
  @response(200, {
    description: 'Array of Hut model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hut, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Hut) filter?: Filter<Hut>): Promise<Hut[]> {
    return this.hutRepository.find({...filter, include: ['user', 'cluster']});
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @get('/huts/{id}')
  @response(200, {
    description: 'Hut model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hut, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Hut, {exclude: 'where'}) filter?: FilterExcludingWhere<Hut>,
  ): Promise<Hut> {
    return this.hutRepository.findById(id, {
      ...filter,
      include: ['user', 'cluster'],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @patch('/huts/{id}')
  @response(204, {
    description: 'Hut PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hut, {partial: true}),
        },
      },
    })
    hut: Hut,
  ): Promise<void> {
    await this.hutRepository.updateById(id, hut);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @del('/huts/{id}')
  @response(204, {
    description: 'Hut DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hutRepository.deleteById(id);
  }
}
