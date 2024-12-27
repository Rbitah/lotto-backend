import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async submitContact(createContactDto: CreateContactDto) {
    // Send email notification to admin
    await this.notificationsService.sendEmail(
      process.env.ADMIN_EMAIL,
      'New Contact Form Submission',
      `
        Name: ${createContactDto.name}
        Email: ${createContactDto.email}
        Message: ${createContactDto.message}
      `
    );

    // Send confirmation email to user
    await this.notificationsService.sendEmail(
      createContactDto.email,
      'Thank you for contacting us',
      'We have received your message and will get back to you soon.'
    );

    return { message: 'Contact form submitted successfully' };
  }
} 