/* eslint-disable @typescript-eslint/naming-convention */
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
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
import {User} from '../models';
import {
  Credentials,
  UserProfileRepository,
  UserRepository,
} from '../repositories';
import {EmailManager} from '../services/email.service';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {JWTService} from '../services/jwt-service';
import {TwilioService} from '../services/twilio.service';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator';
import generateOtpTemplate from '../templates/otp.template';
import SITE_SETTINGS from '../utils/config';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import { MushroomDataSource } from '../datasources';

export class UserController {
  constructor(
    @inject('datasources.fanseb')
    public dataSource: MushroomDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserProfileRepository)
    public userProfileRepository: UserProfileRepository,
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
          or: [{email: userData.email}, {userName: userData.userName}],
        },
      });
      if (user) {
        throw new HttpErrors.BadRequest('User Name or Email Already Exists');
      }

      validateCredentials(_.pick(userData, ['email', 'password']));
      // userData.permissions = [PermissionKeys.ADMIN];
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData, {
        transaction: tx,
      });
      const savedUserData = _.omit(savedUser, 'password');
      tx.commit();
      return Promise.resolve({
        success: true,
        userData: savedUserData,
        message: `User with mail ${userData.email} is registered successfully`,
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
    const allUserData = await this.userRepository.findById(userData.id, {
      include: [{relation: 'userProfile'}, {relation: 'influencerBalances'}],
    });
    return Promise.resolve({
      accessToken: token,
      user: allUserData,
    });
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
      include: [{relation: 'userProfile'}, {relation: 'influencerBalances'}],
    });
    const userData = _.omit(user, 'password');
    return Promise.resolve({
      ...userData,
      displayName: userData?.name,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
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
      include: ['brands'],
      fields: {password: false, otp: false, otpExpireAt: false},
    };
    return this.userRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
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
      include: ['brands'],
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
          schema: {
            type: 'object',
            properties: {
              // Include properties from the User model
              user: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  contactNo: {type: 'string'},
                  isActive: {type: 'boolean'},
                },
              },
              // Include properties from the UserProfile model
              userProfile: {
                type: 'object',
                properties: {
                  avatar: {type: 'object'},
                  bio: {type: 'string'},
                  paymentInfo: {type: 'object'},
                  socials: {type: 'object'},
                  address: {type: 'array'},
                  // Include other properties from UserProfile if needed
                },
              },
            },
          },
        },
      },
    })
    user: {
      user: {
        name: string;
        email: string;
        password: string;
        contactNo: string;
        permissions: string[];
        isActive: boolean;
        otp?: string;
        otpExpireAt: string;
      };
      userProfile?: {
        avatar?: object;
        bio?: string;
        contact?: string;
        contact_verified_at?: string;
        gallery: object;
        paymentInfo?: object;
        socials?: object;
        address?: object[];
        // Include other properties from UserProfile if needed
      };
    },
  ): Promise<any> {
    // Fetch the user information before updating
    const existingUser = await this.userRepository.findById(id, {
      include: [{relation: 'userProfile'}],
    });
    if (!existingUser) {
      // Handle the case where the user doesn't exist
      // You may want to return an error response or handle it based on your requirements
      return;
    }

    // Update user information
    if (user.user) {
      await this.userRepository.updateById(id, user.user);
    }

    // Update or create user profile information
    if (user.userProfile) {
      if (existingUser.userProfile) {
        // If user already has a profile, update it
        await this.userProfileRepository.updateById(
          existingUser.userProfile.id,
          user.userProfile,
        );
      } else {
        // If user doesn't have a profile, create a new one
        await this.userProfileRepository.create({
          userId: id,
          ...user.userProfile,
        });
      }
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


  @post('/send-otp-guest-checkout')
  async sendOTP(
    @requestBody() requestBody: {phoneNumber: string},
  ): Promise<any> {
    const {phoneNumber} = requestBody;
    try {
      const result = await this.twilioService.startVerification(phoneNumber);
      return {
        success: true,
        message: 'OTP sent successfully',
        verificationSid: result.sid,
      };
    } catch (error) {
      return {success: false, message: error.message};
    }
  }

  @post('/verify-otp-guest-checkout')
  async verifyOTP(
    @requestBody() requestBody: {id: string; code: string; phoneNumber: string},
  ): Promise<any> {
    const {id, code, phoneNumber} = requestBody;
    try {
      const result = await this.twilioService.checkVerification(
        id,
        code,
        phoneNumber,
      );
      return {
        success: true,
        message: 'OTP verified successfully',
        verificationSid: result.sid,
      };
    } catch (error) {
      return {success: false, message: error.message};
    }
  }
}
