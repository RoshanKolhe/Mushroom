import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {MushroomDataSource} from '../datasources';
import {EnvironmentData, EnvironmentDataRelations, Hut} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {HutRepository} from './hut.repository';

export class EnvironmentDataRepository extends TimeStampRepositoryMixin<
  EnvironmentData,
  typeof EnvironmentData.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EnvironmentData,
      typeof EnvironmentData.prototype.id,
      EnvironmentDataRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly hut: BelongsToAccessor<
    Hut,
    typeof EnvironmentData.prototype.id
  >;

  constructor(
    @inject('datasources.mushroom') dataSource: MushroomDataSource,
    @repository.getter('HutRepository')
    protected hutRepositoryGetter: Getter<HutRepository>,
    @repository(HutRepository) protected hutRepository: HutRepository,
  ) {
    super(EnvironmentData, dataSource);
    this.hut = this.createBelongsToAccessorFor('hut', hutRepositoryGetter);
    this.registerInclusionResolver('hut', this.hut.inclusionResolver);
  }

  async findMissingEntries(
    startDate: string,
    endDate: string,
    huts: any,
  ): Promise<{date: string; hutId: number}[]> {
    const dateRange = this.getDateRange(startDate, endDate);
    const missingEntries: {date: string; hutId: any; hutDetails: any}[] = [];

    for (const hut of huts) {
      for (const date of dateRange) {
        const count = await this.count({
          hutId: hut.id,
          date,
        });

        if (count.count === 0) {
          missingEntries.push({date, hutId: hut.id, hutDetails: hut});
        }
      }
    }

    return missingEntries;
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);

    while (currentDate <= stopDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}
