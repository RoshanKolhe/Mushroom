/* eslint-disable @typescript-eslint/naming-convention */
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
  WhereBuilder,
  repository,
} from '@loopback/repository';
import {
  HttpErrors,
  get,
  getJsonSchemaRef,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {EmailManagerBindings} from '../keys';
import {EnvironmentData, User} from '../models';
import {
  ClusterRepository,
  Credentials,
  EnvironmentDataRepository,
  HutRepository,
  UserRepository,
} from '../repositories';
import {EmailManager} from '../services/email.service';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {JWTService} from '../services/jwt-service';
import {TwilioService} from '../services/twilio.service';
import {MyUserService} from '../services/user-service';
import {
  validateCredentials,
  validateCredentialsForPhoneLogin,
} from '../services/validator';
import generateOtpTemplate from '../templates/otp.template';
import SITE_SETTINGS from '../utils/config';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import {MushroomDataSource} from '../datasources';
import {all} from 'axios';
import {getStartAndEndDateOfWeek} from '../utils/constants';

export class UserController {
  constructor(
    @inject('datasources.mushroom')
    public dataSource: MushroomDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ClusterRepository)
    public clusterRepository: ClusterRepository,
    @repository(HutRepository)
    public hutRepository: HutRepository,
    @repository(EnvironmentDataRepository)
    public environmentDataRepository: EnvironmentDataRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject('services.TwilioService')
    private twilioService: TwilioService,
  ) {}

  @post('/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<User, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const user = await this.userRepository.findOne({
        where: {
          or: [{phoneNumber: userData.phoneNumber}],
        },
      });
      if (user) {
        throw new HttpErrors.BadRequest('User Already Exists');
      }

      validateCredentialsForPhoneLogin(userData.phoneNumber);
      // userData.permissions = [PermissionKeys.ADMIN];
      const savedUser = await this.userRepository.create(userData, {
        transaction: tx,
      });
      tx.commit();
      return Promise.resolve({
        success: true,
        userData: savedUser,
        message: `User registered successfully`,
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const userData = _.omit(user, 'password');
    const token = await this.jwtService.generateToken(userProfile);
    const allUserData = await this.userRepository.findById(userData.id);
    return Promise.resolve({
      accessToken: token,
      user: allUserData,
    });
  }

  @post('/send-otp-login')
  async sendOTPForMoblileUser(
    @requestBody({
      description: 'Request body description',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phoneNumber: {
                type: 'string',
                description: 'User phone number',
              },
            },
          },
        },
      },
    })
    requestBody: {
      phoneNumber: string;
    },
  ): Promise<any> {
    const {phoneNumber} = requestBody;
    try {
      const user = await this.userRepository.findOne({
        where: {
          or: [{phoneNumber: phoneNumber}],
        },
      });
      if (!user) {
        throw new HttpErrors.BadRequest("User doesn't exists");
      }
      if (!user.isActive) {
        throw new HttpErrors.BadRequest('User is Inactive');
      }
      validateCredentialsForPhoneLogin(phoneNumber);
      if (phoneNumber === '+918928470503') {
        return {
          success: true,
          message: 'OTP sent successfully',
          verificationSid: 'testverificationsid',
        };
      } else {
        const result = await this.twilioService.startVerification(phoneNumber);
        return {
          success: true,
          message: 'OTP sent successfully',
          verificationSid: result.sid,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  @post('/verify-otp-login')
  async verifyOTPForMoblileUser(
    @requestBody({
      description: 'Request body description',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Verification ID',
              },
              code: {
                type: 'string',
                description: 'Verification code',
              },
              phoneNumber: {
                type: 'string',
                description: 'User phone number',
              },
            },
          },
        },
      },
    })
    requestBody: {
      id: string;
      code: string;
      phoneNumber: string;
    },
  ): Promise<any> {
    const {id, code, phoneNumber} = requestBody;
    try {
      if (id === 'testverificationsid' && phoneNumber === '+918928470503') {
        if (code !== '000000') {
          return {
            success: false,
            message:
              'Verification check failed: Verification check failed: Invalid code.',
          };
        }

        const allUserData = await this.userRepository.findOne({
          where: {
            phoneNumber: phoneNumber,
          },
        });
        if (allUserData) {
          const userProfile =
            this.userService.convertToUserProfile(allUserData);
          const userData = _.omit(userProfile, 'password');
          const token = await this.jwtService.generateToken(userProfile);
          return {
            success: true,
            accessToken: token,
            user: allUserData,
            verificationSid: 'testverificationsid',
          };
        }
        throw new HttpErrors.BadRequest(
          `User with phone number ${phoneNumber} not found`,
        );
      } else {
        const result = await this.twilioService.checkVerification(
          id,
          code,
          phoneNumber,
        );
        const allUserData = await this.userRepository.findOne({
          where: {
            phoneNumber: phoneNumber,
          },
        });
        if (allUserData) {
          const userProfile =
            this.userService.convertToUserProfile(allUserData);
          const userData = _.omit(userProfile, 'password');
          const token = await this.jwtService.generateToken(userProfile);
          return {
            success: true,
            accessToken: token,
            user: allUserData,
            verificationSid: result.sid,
          };
        }
        throw new HttpErrors.BadRequest(
          `User with phone number ${phoneNumber}} not found`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @get('/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    const user = await this.userRepository.findOne({
      where: {
        id: currnetUser.id,
      },
    });
    const userData = _.omit(user, 'password');
    return Promise.resolve({
      ...userData,
      displayName: userData?.firstName,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/api/users/list')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    filter = {
      ...filter,
      fields: {password: false, otp: false, otpExpireAt: false},
    };
    return this.userRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/api/users/{id}', {
    responses: {
      '200': {
        description: 'User Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getSingleUser(@param.path.number('id') id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      fields: {
        password: false,
        otp: false,
        otpExpireAt: false,
      },
    });
    return Promise.resolve({
      ...user,
    });
  }

  @authenticate({
    strategy: 'jwt',
  })
  @patch('/api/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<any> {
    // Fetch the user information before updating
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return;
    }

    // Update user information
    if (user) {
      await this.userRepository.updateById(id, user);
    }

    return Promise.resolve({
      success: true,
      message: `User profile updated successfully`,
    });
  }

  @post('/sendOtp')
  async sendOtp(
    @requestBody({})
    userData: any,
  ): Promise<object> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const template = generateOtpTemplate({...userData, otp: otp || '000000'});
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      const now = new Date();
      await this.userRepository.updateById(user.id, {
        otp: `${otp}`,
        otpExpireAt: `${this.addMinutesToDate(now, 10)}`,
      });
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
    const mailOptions = {
      from: SITE_SETTINGS.fromMail,
      to: userData.email,
      subject: template.subject,
      html: template.html,
    };
    await this.emailManager
      .sendMail(mailOptions)
      .then(function (res: any) {
        return Promise.resolve({
          success: true,
          message: `Successfully sent otp mail to ${userData.email}`,
        });
      })
      .catch(function (err: any) {
        throw new HttpErrors.UnprocessableEntity(err);
      });
    return Promise.resolve({
      success: true,
      message: `Successfully sent otp mail to ${userData.email}`,
    });
  }

  @post('/verifyOtp')
  async verifyOtp(
    @requestBody({})
    otpOptions: any,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: {
        email: otpOptions.email,
      },
    });
    if (user) {
      const now = new Date();
      const expire_date = new Date(user.otpExpireAt);
      const encryptedPassword = await this.hasher.hashPassword(
        otpOptions.password,
      );
      if (now <= expire_date && otpOptions.otp === user.otp) {
        await this.userRepository.updateById(user.id, {
          password: encryptedPassword,
        });
        return {
          success: true,
          message: 'otp verification successfull',
        };
      } else {
        return {
          success: false,
          error: 'otp verification failed',
        };
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
  }

  @post('/setPassword')
  async setPassword(
    @requestBody({})
    passwordOptions: any,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: {
        email: passwordOptions.email,
      },
    });
    if (user) {
      const passswordCheck = await this.hasher.comparePassword(
        passwordOptions.oldPassword,
        user.password,
      );
      if (passswordCheck) {
        const encryptedPassword = await this.hasher.hashPassword(
          passwordOptions.newPassword,
        );
        await this.userRepository.updateById(user.id, {
          password: encryptedPassword,
        });
        return {
          success: true,
          message: 'password change successful',
        };
      } else {
        throw new HttpErrors.BadRequest("Old password doesn't match");
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
  }

  addMinutesToDate(date: any, minutes: any) {
    return new Date(date.getTime() + minutes * 60000);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/getDashboardCounts')
  async getDashboardCounts(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<any> {
    let totalClusters = 0;
    let totalHuts = 0;
    let totalCultivation = 0;
    let todaysCultivation = 0;
    // Construct a filter to select today's records
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000); // Next day
    const todayFilter = {
      where: {
        date: {
          between: [startOfDay.toISOString(), endOfDay.toISOString()] as [
            string,
            string,
          ],
        },
      },
    };
    const user = await this.userRepository.findById(currnetUser.id);
    if (user.permissions.includes('super_admin')) {
      totalClusters = (await this.clusterRepository.count()).count;
      totalHuts = (await this.hutRepository.count()).count;

      // Retrieve today's cultivation records
      const todaysCultivationRecords =
        await this.environmentDataRepository.find(todayFilter);

      // Calculate the total quantity from today's records
      todaysCultivation = todaysCultivationRecords.reduce(
        (total, record) => total + parseFloat(record.quantity),
        0,
      );
      console.log(todaysCultivation);

      const allCultivationRecords = await this.environmentDataRepository.find();

      totalCultivation = allCultivationRecords.reduce(
        (total, record) => total + parseFloat(record.quantity),
        0,
      );
    } else if (user.permissions.includes('cluster_admin')) {
      const userAssignedClusters = await this.clusterRepository.find({
        where: {
          userId: currnetUser.id,
        },
      });
      totalClusters = userAssignedClusters.length;
      const userClusterIds: any = userAssignedClusters.map(
        cluster => cluster.id,
      );
      const userAssignedHuts = await this.hutRepository.find({
        where: {
          clusterId: {
            inq: userClusterIds,
          },
        },
      });
      const hutIds: any = userAssignedHuts.map(hut => hut.id);
      totalHuts = userAssignedHuts.length;

      // Retrieve today's cultivation records
      const todaysCultivationRecords =
        await this.environmentDataRepository.find({
          where: {
            ...todayFilter.where,
            hutId: {
              inq: hutIds,
            },
          },
        });
      todaysCultivation = todaysCultivationRecords.reduce(
        (total, record) => total + parseFloat(record.quantity),
        0,
      );
      const allCultivationRecords = await this.environmentDataRepository.find({
        where: {
          hutId: {
            inq: hutIds,
          },
        },
      });

      totalCultivation = allCultivationRecords.reduce(
        (total, record) => total + parseFloat(record.quantity),
        0,
      );
    }
    return Promise.resolve({
      success: true,
      totalClusters,
      totalHuts,
      todaysCultivation,
      totalCultivation,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CLUSTER_ADMIN],
    },
  })
  @post('/getDayWiseCultivationData')
  async getDayWiseCultivationData(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({})
    clusterData: any,
  ): Promise<any> {
    const cluster = await this.clusterRepository.findById(clusterData.cluster);
    const hut = await this.hutRepository.findById(clusterData.hut);
    const dates = getStartAndEndDateOfWeek(clusterData.date);
    const selectedDate = new Date(clusterData.date);
    console.log(dates);
    let avgMoisture = 0;
    let avgHumidity = 0;
    let totalCultivation = 0;
    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000); // Next day
    const hutEnvironmentData = await this.environmentDataRepository.find({
      where: {
        hutId: clusterData.hut,
        date: {
          between: [startOfDay.toISOString(), endOfDay.toISOString()] as [
            string,
            string,
          ],
        },
      },
    });
    hutEnvironmentData.forEach(res => {
      avgMoisture += Number(res.moisture);
      avgHumidity += Number(res.humidity);
      totalCultivation += Number(res.quantity);
    });
    if (hutEnvironmentData.length > 0) {
      avgMoisture /= hutEnvironmentData.length;
      avgHumidity /= hutEnvironmentData.length;
    }

    const weeksHutEnvironmentData = await this.environmentDataRepository.find({
      where: {
        hutId: clusterData.hut,
        date: {
          between: [
            dates.startDate.toISOString(),
            dates.endDate.toISOString(),
          ] as [string, string],
        },
      },
    });

    console.log(JSON.stringify(weeksHutEnvironmentData));

    const allWeeklyData = this.calculateData(weeksHutEnvironmentData, dates);

    return {
      avgMoisture,
      avgHumidity,
      totalCultivation,
      ...allWeeklyData,
    };
  }

  calculateData(
    data: any[],
    dateRange: any,
  ): {
    weeklyAverageMoisture: number[];
    weeklyAverageHumidity: number[];
    totalWeeklyCultivation: number[];
  } {
    const {startDate, endDate} = dateRange;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Initialize arrays to store daily averages and total cultivation
    const dailyAverageMoisture: number[] = [];
    const dailyAverageHumidity: number[] = [];
    const dailyTotalCultivation: number[] = [];

    // Iterate through each day within the date range
    while (start <= end) {
      // Filter environment data for the current day
      const dailyData = data.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === start.getFullYear() &&
          entryDate.getMonth() === start.getMonth() &&
          entryDate.getDate() === start.getDate()
        );
      });

      // Calculate the average moisture and humidity for the current day
      const totalMoisture = dailyData.reduce(
        (sum, entry) => sum + Number(entry.moisture),
        0,
      );
      const totalHumidity = dailyData.reduce(
        (sum, entry) => sum + Number(entry.humidity),
        0,
      );
      const totalCultivation = dailyData.reduce(
        (sum, entry) => sum + Number(entry.quantity),
        0,
      );
      const averageMoisture =
        dailyData.length > 0 ? totalMoisture / dailyData.length : 0;
      const averageHumidity =
        dailyData.length > 0 ? totalHumidity / dailyData.length : 0;

      // Add the daily averages and total cultivation to the result arrays
      dailyAverageMoisture.push(averageMoisture);
      dailyAverageHumidity.push(averageHumidity);
      dailyTotalCultivation.push(totalCultivation);

      // Move to the next day
      start.setDate(start.getDate() + 1);
    }

    return {
      weeklyAverageMoisture: dailyAverageMoisture,
      weeklyAverageHumidity: dailyAverageHumidity,
      totalWeeklyCultivation: dailyTotalCultivation,
    };
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/latestEnvironmentData', {
    responses: {
      '200': {
        description: 'Latest entry',
      },
    },
  })
  async findLatest(): Promise<any> {
    const latestEntry = await this.environmentDataRepository.findOne({
      order: ['createdAt DESC'],
    });
    return latestEntry;
  }

  // @authenticate({
  //   strategy: 'jwt',
  // })
  @post('/totalMushroomQuantity', {
    responses: {
      '200': {
        description: 'Array of total mushroom quantities for each month',
      },
    },
  })
  async getTotalMushroomQuantity(
    @requestBody() payload: any,
  ): Promise<number[]> {
    const mushroomQuantities: number[] = [];

    // Loop through each month
    for (let i = 1; i <= 12; i++) {
      const startDateString = `${payload.year}-${String(i).padStart(2, '0')}-01 00:00:00`;
      const endDateString = `${payload.year}-${String(i).padStart(2, '0')}-31 23:59:59`;

      console.log('startDateString:', startDateString);
      console.log('endDateString:', endDateString);

      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);

      console.log('startDate:', startDate);
      console.log('endDate:', endDate);

      // Find all entries within the current month
      const entriesInMonth = await this.environmentDataRepository.find({
        where: {
          and: [{createdAt: {gte: startDate}}, {createdAt: {lte: endDate}}],
        },
      });

      // Calculate total mushroom quantity for the month
      const totalQuantity = entriesInMonth.reduce(
        (total, entry) => total + Number(entry.quantity),
        0,
      );

      mushroomQuantities.push(totalQuantity);
    }

    return mushroomQuantities;
  }
}
