# High School Athletics Website

A modern, responsive athletics website built with Next.js for showcasing your high school's sports programs, schedules, and news.

## 🚀 Getting Started for Beginners

### Prerequisites
You need to have Node.js installed on your computer. Download it from [nodejs.org](https://nodejs.org/)

### Running the Development Server

1. Open your terminal/command prompt
2. Navigate to this project folder:
   ```bash
   cd school-athletics
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to: `http://localhost:3000`

You should see your athletics website running!

## 📁 Project Structure

```
school-athletics/
├── app/
│   ├── page.tsx          # Homepage (what you see at /)
│   ├── layout.tsx        # Overall layout wrapper
│   └── globals.css       # Global styles
├── public/               # Static files (images, etc.)
└── package.json          # Project dependencies
```

## 🎨 Customizing Your Website

### Changing Colors
The website uses a blue color scheme. To change colors:
- Look for `bg-blue-900`, `bg-blue-800`, `text-blue-600` in `app/page.tsx`
- Replace with other Tailwind colors like `bg-red-900`, `bg-green-800`, etc.

### Changing School Name
Replace "Lancaster Catholic High School Athletics" with your school's name:
1. Open `app/page.tsx`
2. Find "Lancaster Catholic High School Athletics" 
3. Replace all occurrences with your school name

### Adding Your School Logo
1. Add your logo image to the `public/` folder (e.g., `logo.png`)
2. In the header section, add:
   ```tsx
   import Image from "next/image";
   // Then in the header:
   <Image src="/logo.png" alt="School Logo" width={50} height={50} />
   ```

### Updating Sports Programs
In `app/page.tsx`, find the `sports` array and modify:
```tsx
const sports = [
  { name: "Your Sport", season: "Season", icon: "emoji" },
  // Add or remove sports as needed
];
```

### Adding Real Game Schedules
Update the `upcomingGames` array with your actual games:
```tsx
const upcomingGames = [
  { 
    sport: "Football", 
    opponent: "Rival High", 
    date: "Feb 1, 2026", 
    time: "7:00 PM", 
    location: "Home" 
  },
  // Add more games
];
```

### Updating News
Modify the `news` array to add your school's actual news:
```tsx
const news = [
  {
    title: "Your News Title",
    date: "Date",
    excerpt: "Brief description...",
  },
  // Add more news items
];
```

## 📱 Features

- ✅ Fully responsive (works on phones, tablets, desktops)
- ✅ Clean, modern design
- ✅ Easy to customize
- ✅ Sports programs showcase
- ✅ Upcoming games schedule
- ✅ News section
- ✅ Contact information

## 🛠️ Next Steps

### Create Additional Pages
You can add more pages like:
- Sports detail pages
- Full schedule page
- News detail pages
- Contact form page

To create a new page, create a new folder in `app/` with a `page.tsx` file.

### Deploy Your Website
When ready to publish:
1. Sign up for a free account at [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Deploy with one click!

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Tutorial](https://react.dev/learn)

## 🎓 Understanding the Code

### What is Next.js?
Next.js is a framework for building websites with React. It handles routing, optimization, and makes your site fast.

### What is Tailwind CSS?
Tailwind is a CSS framework that lets you style elements using class names like `bg-blue-900` (blue background) or `text-white` (white text).

### What is TypeScript?
TypeScript adds type checking to JavaScript. The `.tsx` extension means it's a TypeScript + React file.

## 💡 Tips

- Save your files to see changes automatically
- Press `Ctrl+C` in terminal to stop the dev server
- Use browser DevTools (F12) to inspect elements
- Experiment! You can't break anything permanently

## 🆘 Getting Help

If something doesn't work:
1. Check the terminal for error messages
2. Make sure you saved your files
3. Try stopping the server (`Ctrl+C`) and restarting it (`npm run dev`)
4. Check the [Next.js documentation](https://nextjs.org/docs)

## 📝 Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code quality
```

---

Good luck with your athletics website! 🏆
