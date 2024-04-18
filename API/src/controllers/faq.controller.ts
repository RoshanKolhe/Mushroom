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
import {Faq} from '../models';
import {FaqRepository} from '../repositories';
import { PermissionKeys } from '../authorization/permission-keys';
import { authenticate } from '@loopback/authentication';

export class FaqController {
  constructor(
    @repository(FaqRepository)
    public faqRepository : FaqRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/faqs')
  @response(200, {
    description: 'Faq model instance',
    content: {'application/json': {schema: getModelSchemaRef(Faq)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Faq, {
            title: 'NewFaq',
            exclude: ['id'],
          }),
        },
      },
    })
    faq: Omit<Faq, 'id'>,
  ): Promise<Faq> {
    return this.faqRepository.create(faq);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/faqs')
  @response(200, {
    description: 'Array of Faq model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Faq, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Faq) filter?: Filter<Faq>,
  ): Promise<Faq[]> {
    return this.faqRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/faqs/{id}')
  @response(200, {
    description: 'Faq model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Faq, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Faq, {exclude: 'where'}) filter?: FilterExcludingWhere<Faq>
  ): Promise<Faq> {
    return this.faqRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/faqs/{id}')
  @response(204, {
    description: 'Faq PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Faq, {partial: true}),
        },
      },
    })
    faq: Faq,
  ): Promise<void> {
    await this.faqRepository.updateById(id, faq);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/faqs/{id}')
  @response(204, {
    description: 'Faq DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.faqRepository.deleteById(id);
  }
}
