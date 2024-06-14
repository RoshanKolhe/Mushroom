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
import {Notification} from '../models';
import {NotificationRepository, UserRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {NotificationService} from '../services/notification.service';

export class NotificationController {
  constructor(
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.NotificationService')
    protected notificationService: NotificationService,
  ) {}

  @post('/notifications')
  @response(200, {
    description: 'Notification model instance',
    content: {'application/json': {schema: getModelSchemaRef(Notification)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {
            title: 'NewNotification',
            exclude: ['id'],
          }),
        },
      },
    })
    notification: Omit<Notification, 'id'>,
  ): Promise<Notification> {
    return this.notificationRepository.create(notification);
  }

  @get('/notifications/count')
  @response(200, {
    description: 'Notification model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.count(where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.HUT_USER,
        PermissionKeys.CLUSTER_ADMIN,
        PermissionKeys.GROUP_ADMIN,
      ],
    },
  })
  @get('/notifications')
  @response(200, {
    description: 'Array of Notification model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notification, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Notification) filter?: Filter<Notification>,
  ): Promise<Notification[]> {
    const user = await this.userRepository.findById(currnetUser.id);
    if (user.permissions.includes('super_admin')) {
      return this.notificationRepository.find({
        ...filter,
        include: ['user'],
        order: ['createdAt DESC'],
      });
    } else {
      return this.notificationRepository.find({
        ...filter,
        where: {
          userId: currnetUser.id,
        },
        include: ['user'],
        order: ['createdAt DESC'],
      });
    }
  }

  @patch('/notifications')
  @response(200, {
    description: 'Notification PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Notification,
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.updateAll(notification, where);
  }

  @get('/notifications/{id}')
  @response(200, {
    description: 'Notification model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notification, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Notification, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notification>,
  ): Promise<Notification> {
    return this.notificationRepository.findById(id, filter);
  }

  @patch('/notifications/{id}')
  @response(204, {
    description: 'Notification PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Notification,
  ): Promise<any> {
    try {
      await this.notificationRepository.updateById(id, notification);
      return Promise.resolve({
        success: true,
        messsage: 'notification updated successfully',
      });
    } catch (err) {
      throw err;
    }
  }

  @put('/notifications/{id}')
  @response(204, {
    description: 'Notification PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() notification: Notification,
  ): Promise<void> {
    await this.notificationRepository.replaceById(id, notification);
  }

  @del('/notifications/{id}')
  @response(204, {
    description: 'Notification DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.notificationRepository.deleteById(id);
  }

  @post('/send-notification', {
    responses: {
      '200': {
        description: 'Notification sent',
      },
    },
  })
  async sendNotification(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['userIds', 'title', 'message'],
            properties: {
              userIds: {
                type: 'array',
                items: {
                  type: 'number', // Updated to string to handle "all" and numbers as strings
                },
              },
              title: {type: 'string'},
              message: {type: 'string'},
            },
          },
        },
      },
    })
    requestData: {
      userIds: number[];
      title: string;
      message: string;
    },
  ): Promise<object> {
    const {userIds, title, message} = requestData;

    if (!title || !message) {
      throw new HttpErrors.BadRequest('title, and message are required');
    }

    let users;
    if (userIds && userIds.length === 0) {
      users = await this.userRepository.find();
    } else {
      const numericUserIds = userIds
        .filter(id => typeof id === 'number' || !isNaN(Number(id)))
        .map(Number);
      users = await this.userRepository.find({
        where: {id: {inq: numericUserIds}},
      });
    }

    const responses = [];
    for (const user of users) {
      try {
        const userToken = user.fcmToken;
        if (!userToken) {
          responses.push({
            userId: user.id,
            success: false,
            error: `User with ID ${user.id} does not have a valid FCM token`,
          });
          continue;
        }

        const response = await this.notificationService.sendNotification(
          userToken,
          title,
          message,
        );
        responses.push({userId: user.id, success: true, response});
      } catch (error) {
        responses.push({
          userId: user.id,
          success: false,
          error: error.message,
        });
      }
    }

    return {results: responses};
  }
}
