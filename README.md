# Blessibles.com - Christian Family Printables E-commerce Platform

Blessibles.com is a modern e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Supabase, offering Christian family printables and resources.

## 🚀 Features

- **Modern Tech Stack**
  - Next.js 14 with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Supabase for backend services
  - Stripe for payment processing

- **User Features**
  - User authentication and authorization
  - Newsletter subscription system
  - Product browsing and filtering
  - Shopping cart functionality
  - Secure checkout process
  - User dashboard for purchased items

- **Admin Features**
  - Admin dashboard for site management
  - Product management (CRUD operations)
  - User management
  - Newsletter subscriber management
  - Order management
  - Analytics and reporting

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blessibles.git
cd blessibles
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 🏗️ Project Structure

```
blessibles/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (marketing)/       # Marketing/public routes
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the following tables:
   - users
   - products
   - orders
   - newsletter_subscribers
   - admin_users

### Stripe Setup
1. Create a Stripe account
2. Set up webhook endpoints
3. Configure payment methods

## 🚀 Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For any questions or concerns, please contact [your-email@example.com]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase team for the backend services
- Tailwind CSS team for the utility-first CSS framework
