# Alwahid Project

**Note:** This project is not yet complete. It is a personal hobby project built for learning purposes and with the belief that society could benefit from a way to better manage social media content, especially related to religious topics, to help guide people on the right path.

## Project Overview

The **Alwahid Project** is a platform designed to support the Muslim community, focusing on religious content and guidance. The application defines three user roles, each with its own unique responsibilities.

### User Roles

1. **Admin**
   - Multiple admins are responsible for managing application data.
   - Admins are appointed by the application owner, referred to as BOG.
   - Admins have the authority to delete or remove any content or user.
   - They can approve manager applications and assign them to manage content.

2. **Managers**
   - Managers can create and upload posts, add events, and map new mosques.

3. **Special User**
   - These users are scholars or Ulama. Regular users can ask them questions or arrange meetings.

4. **Normal User**
   - Standard users with the ability to like, comment, and view posts.
   - They can arrange meetings with special users.
   - They may also apply for approval to upgrade their role to Manager.

## Key Features

- **Social Media Posting:** 
   - Users can like, comment on, and share posts, similar to a Facebook-style interaction.
- **Map Integration:** 
   - Users can locate nearby mosques or special users to meet in person.
   - Only admins and managers can add locations or events to the map.
- **User Upgrades:** 
   - Normal users can apply to be special users, subject to admin approval.
- **Chat Functionality:**
   - Users can chat with others as long as the recipient permits it.
   - Normal users can only send messages and cannot delete messages.
   - Priority users have the ability to delete messages.
   - **Note:** Currently, chats are not end-to-end encrypted.
- **Following System:**
   - Users can follow other users across all three roles.
   - The feed is generated based on the user’s following network.

## Technology Stack

- **Client Side:** Built using React Native and Expo.
- **Server Side:** Powered by Nest.js with a monorepo microservices architecture. Each service is independently deployed.
- **Real-time Data:** Managed with Redis.
- **Database:** PostgreSQL for structured data.
- **File Storage:** AWS S3 for file management.

## Project Design

The application design and UI concepts will be uploaded soon. Stay tuned for updates on the visual structure and user flow of the platform.