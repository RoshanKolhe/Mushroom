import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {
  EnvironmentDataRepository,
  HutRepository,
  NotificationRepository,
  TicketRepository,
  UserRepository,
} from '../repositories';
import {generateUniqueId} from '../utils/constants';

@cronJob()
export class CheckDailyEntriesAtNoon extends CronJob {
  constructor(
    @repository(HutRepository)
    public hutRepository: HutRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(EnvironmentDataRepository)
    public environmentDataRepository: EnvironmentDataRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
  ) {
    super({
      cronTime: '0 12 * * *', // Every 30 seconds
      onTick: async () => {
        await this.runJob();
      },
      start: true,
    });
  }

  async runJob() {
    console.log('Cron job everyday at 12 is running at', new Date());
    const date = new Date();
    const currentDate = date.toISOString().split('T')[0];

    const huts = await this.hutRepository.find();
    for (const hut of huts) {
      const hutId = hut.id;
      const entries = await this.environmentDataRepository.find({
        where: {
          hutId: hutId,
          createdAt: {
            gte: new Date(currentDate),
            lt: new Date(currentDate + 'T23:59:59.999Z'),
          },
        },
      });
      console.log(entries);
      const hasNoonEntry = entries.some((entry: any) => {
        const entryTime = new Date(entry.createdAt);
        const hours = entryTime.getUTCHours(); // Ensure UTC hours are used for comparison
        return hours >= 10 && hours < 12;
      });

      console.log(hasNoonEntry);

      if (!hasNoonEntry) {
        const user = await this.userRepository.findById(hut.userId);

        // Create notification
        await this.notificationRepository.create({
          message: `You have missed an entry for your hut (ID: ${hutId},Name:${hut.name}) on ${currentDate}.`,
          userId: user.id,
          isRead: false,
        });

        // Create ticket
        await this.ticketRepository.create({
          query: 'Missed Environment Data Entry',
          description: `User with ID ${user.id} has missed an entry for hut (ID: ${hutId} , Name:${hut.name}) on ${currentDate}.`,
          userId: user.id,
          hutId: hutId,
          ticketId: generateUniqueId(),
          media: [],
        });
      }
    }
  }
}

@cronJob()
export class CheckDailyEntriesAtEvening extends CronJob {
  constructor(
    @repository(HutRepository)
    public hutRepository: HutRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(EnvironmentDataRepository)
    public environmentDataRepository: EnvironmentDataRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
  ) {
    super({
      cronTime: '0 18 * * *', // At 6 PM daily
      onTick: async () => {
        await this.runJob();
      },
      start: true,
    });
  }

  async runJob() {
    console.log('Cron job at 6 PM is running at', new Date());
    const date = new Date();
    const currentDate = date.toISOString().split('T')[0];

    const huts = await this.hutRepository.find();
    for (const hut of huts) {
      const hutId = hut.id;
      const entries = await this.environmentDataRepository.find({
        where: {
          hutId: hutId,
          createdAt: {
            gte: new Date(currentDate),
            lt: new Date(currentDate + 'T23:59:59.999Z'),
          },
        },
      });
      console.log(entries);

      const hasEveningEntry = entries.some((entry: any) => {
        const entryTime = new Date(entry.createdAt);
        const hours = entryTime.getUTCHours(); // Ensure UTC hours are used for comparison
        return hours >= 16 && hours < 18;
      });

      console.log(hasEveningEntry);

      if (!hasEveningEntry) {
        const user = await this.userRepository.findById(hut.userId);

        // Create notification
        await this.notificationRepository.create({
          message: `You have missed an entry for your hut (ID: ${hutId},Name:${hut.name}) on ${currentDate}.`,
          userId: user.id,
          isRead: false,
        });

        // Create ticket
        await this.ticketRepository.create({
          query: 'Missed Environment Data Entry',
          description: `User with ID ${user.id} has missed an entry for hut (ID: ${hutId} , Name:${hut.name}) on ${currentDate}.`,
          userId: user.id,
          hutId: hutId,
          ticketId: generateUniqueId(),
          media: [],
        });
      }
    }
  }
}
