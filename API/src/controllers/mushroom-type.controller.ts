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
import {MushroomType} from '../models';
import {MushroomTypeRepository} from '../repositories';

export class MushroomTypeController {
  constructor(
    @repository(MushroomTypeRepository)
    public mushroomTypeRepository : MushroomTypeRepository,
  ) {}

  @post('/mushroom-types')
  @response(200, {
    description: 'MushroomType model instance',
    content: {'application/json': {schema: getModelSchemaRef(MushroomType)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MushroomType, {
            title: 'NewMushroomType',
            exclude: ['id'],
          }),
        },
      },
    })
    mushroomType: Omit<MushroomType, 'id'>,
  ): Promise<MushroomType> {
    return this.mushroomTypeRepository.create(mushroomType);
  }

  @get('/mushroom-types/count')
  @response(200, {
    description: 'MushroomType model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(MushroomType) where?: Where<MushroomType>,
  ): Promise<Count> {
    return this.mushroomTypeRepository.count(where);
  }

  @get('/mushroom-types')
  @response(200, {
    description: 'Array of MushroomType model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MushroomType, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(MushroomType) filter?: Filter<MushroomType>,
  ): Promise<MushroomType[]> {
    return this.mushroomTypeRepository.find(filter);
  }

  @patch('/mushroom-types')
  @response(200, {
    description: 'MushroomType PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MushroomType, {partial: true}),
        },
      },
    })
    mushroomType: MushroomType,
    @param.where(MushroomType) where?: Where<MushroomType>,
  ): Promise<Count> {
    return this.mushroomTypeRepository.updateAll(mushroomType, where);
  }

  @get('/mushroom-types/{id}')
  @response(200, {
    description: 'MushroomType model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MushroomType, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(MushroomType, {exclude: 'where'}) filter?: FilterExcludingWhere<MushroomType>
  ): Promise<MushroomType> {
    return this.mushroomTypeRepository.findById(id, filter);
  }

  @patch('/mushroom-types/{id}')
  @response(204, {
    description: 'MushroomType PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MushroomType, {partial: true}),
        },
      },
    })
    mushroomType: MushroomType,
  ): Promise<void> {
    await this.mushroomTypeRepository.updateById(id, mushroomType);
  }

  @put('/mushroom-types/{id}')
  @response(204, {
    description: 'MushroomType PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() mushroomType: MushroomType,
  ): Promise<void> {
    await this.mushroomTypeRepository.replaceById(id, mushroomType);
  }

  @del('/mushroom-types/{id}')
  @response(204, {
    description: 'MushroomType DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.mushroomTypeRepository.deleteById(id);
  }
}
