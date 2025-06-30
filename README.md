# Fashion Fusion Management (FFM)

Fashion Fusion Management (FFM) is a modern web application designed to help tailor shops and fashion businesses efficiently manage customers, orders, payments, and notifications. Built with Next.js, Clerk authentication, and integrated email/notification services, FFM streamlines day-to-day operations for small businesses.

## Features
- Customer management (add, view, update, delete)
- Order management with due date tracking
- Payment recording and history
- Measurement tracking for customers
- Automated email and notification reminders for due orders
- Secure authentication with Clerk

## Tech Stack
- Next.js (React)
- TypeScript
- Clerk (Authentication)
- MongoDB (via Mongoose)
- Brevo/Sendinblue (Transactional Emails)
- Resend (Notifications)
- Tailwind CSS (UI)

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/AryaShah07/Fashion-Fusion-Management.git
cd Fashion-Fusion-Management
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory. Example:
```env
# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Email/Notification Services
BREVO_API_KEY=your_brevo_api_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_admin_email@example.com
```
**Note:** Never commit your `.env` file. It is already included in `.gitignore`.

### 4. Run the Development Server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app/` - Next.js app directory (pages, API routes, dashboard)
- `lib/` - Database models, services, and utilities
- `components/` - Reusable UI components
- `.env` - Environment variables (not committed)

## Contributing
We welcome contributions! To add features or fix bugs:

1. **Fork the repository** and clone your fork.
2. **Create a new branch** for your feature or fix:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them with clear messages.
4. **Push to your fork** and open a Pull Request (PR) to the `main` branch.
5. **Describe your changes** clearly in the PR and reference any related issues.

### Contribution Guidelines
- Follow the existing code style and structure.
- Write clear, concise commit messages.
- Test your changes before submitting a PR.
- Do not commit secrets or sensitive data.

## License
This project is licensed under the MIT License.

---

**Questions or Suggestions?**
Open an issue or start a discussion in the repository! 
