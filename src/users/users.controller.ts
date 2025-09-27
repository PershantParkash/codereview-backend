import { Controller, Get, Put, Body, Req, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersService.findOne(req.user.userId);
    const stats = await this.usersService.getUserStats(req.user.userId);
    
    return {
      success: true,
      data: {
        ...user,
        ...stats,
      },
    };
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    
    return {
      success: true,
      data: user,
    };
  }
}