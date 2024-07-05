import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  EnvironmentData,
  MushroomType,
} from '../models';
import {EnvironmentDataRepository} from '../repositories';

export class EnvironmentDataMushroomTypeController {
  constructor(
    @repository(EnvironmentDataRepository)
    public environmentDataRepository: EnvironmentDataRepository,
  ) { }

  @get('/environment-data/{id}/mushroom-type', {
    responses: {
      '200': {
        description: 'MushroomType belonging to EnvironmentData',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MushroomType),
          },
        },
      },
    },
  })
  async getMushroomType(
    @param.path.number('id') id: typeof EnvironmentData.prototype.id,
  ): Promise<MushroomType> {
    return this.environmentDataRepository.mushroomType(id);
  }
}
