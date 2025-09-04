# لا يطوفك - Arabic E-commerce Website

A responsive Arabic e-commerce/classifieds website built with React and Tailwind CSS, featuring RTL (Right-to-Left) layout support.

## Features

- 🚗 **Hero Banner**: Eye-catching car banner with call-to-action
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🏷️ **Category Browsing**: Circular category cards with product counts
- 📦 **Product Listings**: Clean product cards with images, prices, and details
- 🎨 **Modern UI**: Clean, modern design with smooth animations
- 🌐 **RTL Support**: Full Arabic language support with proper RTL layout
- ⚡ **Performance**: Optimized for fast loading and smooth interactions

## Tech Stack

- **React 19** - Modern React with functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **RTL Support** - Arabic language and layout support

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd laytofak
```

2. Install dependencies:
```bash
npm install
```

3. Install Tailwind CSS (if not already installed):
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header with login/publish buttons
│   ├── Hero.js            # Hero banner with car image
│   ├── Categories.js      # Category browsing section
│   ├── ProductListing.js  # Product listing component
│   └── Footer.js          # Footer with repeated banner
├── assets/
│   └── images/            # Image assets
├── App.js                 # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles with Tailwind imports
```

## Components

### Header
- Login and "Publish Ad" buttons
- Brand logo with Arabic text
- Responsive navigation menu
- Mobile hamburger menu

### Hero
- Full-width car banner
- "بيع سيارتك القديمه" (Sell your old car) headline
- Call-to-action button
- Pagination dots

### Categories
- Circular category cards
- Product counts for each category
- "View All" button with arrow

### ProductListing
- Reusable component for different product categories
- Product cards with images, prices, and details
- Featured product badges
- Location and time information

### Footer
- Repeated hero banner
- Company information and links
- Contact details
- Copyright information

## Customization

### Colors
The project uses a custom color palette defined in `tailwind.config.js`:
- Primary: Blue shades
- Purple: For buttons and accents
- Teal: For gradients and highlights

### RTL Support
The website is fully configured for Arabic RTL layout:
- `dir="rtl"` attribute on the main container
- Right-aligned text and elements
- Proper spacing and margins for RTL
- Custom scrollbar styling

### Adding New Products
To add new product categories, update the data in `App.js`:

```javascript
const newProducts = [
  {
    icon: "🖥️",
    price: "500 د.ك",
    name: "اسم المنتج",
    location: "الموقع",
    time: "الوقت",
    featured: false
  }
];
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Push your code to GitHub
2. Connect your repository to Netlify or Vercel
3. Deploy automatically on push

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
