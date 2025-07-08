#  PromptBetter

**AI Prompt Enhancement Tool** - Transform your casual prompts into professional, optimized prompts for different AI platforms and use cases.

![PromptBetter](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4.17-blue)
![License](https://img.shields.io/badge/License-MIT-green)

##  **Features**

### **Multi-Platform Prompt Enhancement**
- ** AI Coding Assistant** - Optimize prompts for Cursor, Augment, Windsurf IDEs
- ** Image Generation** - Enhance prompts for general image generation models  
- ** JuggernautXL Specialized** - Advanced features with weight modifiers and dual prompts

### **Advanced JuggernautXL Support**
-  **Positive & Negative Prompts** - Generate both enhancement and avoidance prompts
-  **Weight Modifier Syntax** - Support for `(keyword:1.2)`, `((keyword:1.5))` syntax
-  **Professional Quality Terms** - Automatic addition of quality modifiers

### **Modern Chat Interface**
-  **Real-time Chat** - Modern, futuristic UI with chat bubbles
-  **Responsive Design** - Works on desktop and mobile devices
-  **Auto-scroll** - Automatically scrolls to latest messages
-  **Smart Copy** - Copy individual sections or complete prompt sets
-  **Persistent History** - Save and manage conversation history

### **Powered by Google Gemini 2.0 Flash**
-  **Advanced AI** - Google latest Gemini 2.0 Flash model
-  **Fast Processing** - Quick prompt enhancement
-  **Rate Limiting** - Built-in protection (15/min, 1500/day)
-  **Error Handling** - Robust error management and recovery

##  **Tech Stack**

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v3 with custom design system
- **Icons**: Lucide React
- **AI API**: Google Gemini 2.0 Flash
- **State Management**: React Context + useReducer
- **Storage**: localStorage for persistence
- **Build Tool**: Create React App

##  **Installation**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Modern web browser

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/gazzycodes/PromptBetter.git
cd PromptBetter

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
```

### **Build for Production**
```bash
# Create production build
npm run build

# Serve build locally (optional)
npx serve -s build
```

##  **Usage**

### **1. Select Enhancement Mode**
Choose from three specialized modes:
- **AI Coding Assistant** - For development prompts
- **Image Generation** - For creative prompts  
- **JuggernautXL** - For advanced image generation with weight modifiers

### **2. Enter Your Prompt**
Type your casual or rough prompt in the chat interface

### **3. Get Enhanced Results**
Receive professionally formatted prompts optimized for your chosen platform

##  **Project Structure**

```
src/
 components/          # React components
 contexts/            # React Context providers
 services/            # Business logic and API calls
 types/               # TypeScript type definitions
 App.tsx             # Main application component
```

##  **Deployment**

### **Vercel (Recommended)**
```bash
npm i -g vercel
vercel --prod
```

##  **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m Add amazing feature`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  **License**

This project is licensed under the MIT License.

##  **Support**

- **Issues**: [GitHub Issues](https://github.com/gazzycodes/PromptBetter/issues)
- **Email**: gazzyjuruj1@gmail.com

---

**Made with  by [GazzyCodes](https://github.com/gazzycodes)**