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
} from '@loopback/rest';
import {SalesData} from '../models';
import {SalesDataRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class SalesDataController {
  constructor(
    @repository(SalesDataRepository)
    public salesDataRepository: SalesDataRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/sales-data')
  @response(200, {
    description: 'SalesData model instance',
    content: {'application/json': {schema: getModelSchemaRef(SalesData)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SalesData, {
            title: 'NewSalesData',
            exclude: ['id'],
          }),
        },
      },
    })
    salesData: Omit<SalesData, 'id'>,
  ): Promise<SalesData> {
    return this.salesDataRepository.create(salesData);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/sales-data')
  @response(200, {
    description: 'Array of SalesData model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(SalesData, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(SalesData) filter?: Filter<SalesData>,
  ): Promise<SalesData[]> {
    return this.salesDataRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/sales-data/{id}')
  @response(200, {
    description: 'SalesData model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(SalesData, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(SalesData, {exclude: 'where'})
    filter?: FilterExcludingWhere<SalesData>,
  ): Promise<SalesData> {
    return this.salesDataRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/sales-data/{id}')
  @response(204, {
    description: 'SalesData PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SalesData, {partial: true}),
        },
      },
    })
    salesData: SalesData,
  ): Promise<void> {
    await this.salesDataRepository.updateById(id, salesData);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/sales-data/{id}')
  @response(204, {
    description: 'SalesData DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.salesDataRepository.deleteById(id);
  }
}
