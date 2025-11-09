# Literary Explorer 📚

<div align="center">

An AI-powered interactive 3D visualization engine that maps the complex relationships between books, authors, and literary themes.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.176.0-000000.svg)](https://threejs.org/)

[Live Demo](#) | [Features](#features) | [Getting Started](#getting-started) | [Documentation](#documentation)

</div>

---

## 🌟 Overview

Literary Explorer transforms the way you discover and explore literature. Using cutting-edge 3D visualization powered by Three.js and AI-driven insights from Google's Gemini, it creates an interactive universe where books, authors, and themes connect in meaningful, surprising ways.

### ✨ Key Features

#### 🎨 **Dual Visualization Modes**
- **Graph Mode**: Interactive 3D force-directed graph revealing literary connections
- **Book Grid Mode**: AI-powered recommendation wall (100-book curated collection)

#### 🤖 **AI-Powered Intelligence**
- **Smart Search**: Leverages Google Gemini 2.5 for deep literary analysis
- **Grounded Search**: Web-connected search for comprehensive results
- **Connection Finder**: Discover surprising paths between any two literary entities
- **Auto-Expansion**: Click any node to explore related works automatically

#### 🗺️ **Curated Journeys**
Pre-built thematic explorations:
- Magical Realism
- Experimental Fiction
- Autofiction
- Mythology
- The Beat Generation
- Gothic Literature
- Cyberpunk
- Existentialism

#### 📖 **Rich Data Integration**
- **Open Library API**: Real book metadata, covers, and author information
- **AI Summaries**: On-demand analysis and insights for any work
- **Timeline Filtering**: Explore literature across centuries
- **Theme Extraction**: Automatic discovery of literary themes and movements

#### 🎯 **Interactive Features**
- Physics-based 3D navigation with intuitive controls
- Node filtering by type (books, authors, themes)
- Visual connection paths with animated highlights
- Responsive design for desktop and tablet

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haigpapa/new-lit-engine.git
   cd new-lit-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 Usage Guide

### Basic Navigation

1. **Search**: Enter a book title, author name, or literary theme in the search bar
2. **Explore**: Click on any node to expand and discover connections
3. **Navigate**: Use mouse/trackpad to rotate, zoom, and pan the 3D space
4. **Filter**: Toggle node types (books/authors/themes) from the toolbar
5. **Timeline**: Activate timeline mode to filter by publication year

### Advanced Features

#### Find Connections
1. Click the "Connect" button in the toolbar
2. Select a starting node
3. Select an ending node
4. Watch as the AI finds and highlights a meaningful path between them

#### Book Grid Mode
1. Toggle to Grid Mode from the toolbar
2. Search for your favorite book to seed the grid
3. The AI will generate personalized recommendations
4. Lock books you love, dismiss ones you don't
5. Build your curated top-100 library

#### Journey Mode
- Click the sparkle icon to reveal journey suggestions
- Select a theme to load a pre-curated literary universe
- Great for discovery and education

---

## 🏗️ Architecture

### Tech Stack

**Frontend Framework**
- React 19.1.0 with hooks-based architecture
- TypeScript/JavaScript hybrid

**3D Graphics**
- Three.js 0.176.0 for 3D rendering
- React Three Fiber for React integration
- React Three Drei for utilities
- React Three Rapier for physics simulation

**State Management**
- Zustand 5.0 with Immer for immutable updates
- Auto-generated selector hooks for performance

**AI & APIs**
- Google Gemini 2.5 (Flash, Pro, Flash-Lite)
- Open Library API for book metadata
- Grounded search with web integration

**Build & Dev Tools**
- Vite 6.2 for blazing-fast builds
- ESM-based architecture
- Hot module replacement (HMR)

### Project Structure

```
new-lit-engine/
├── public/                 # Static assets and journey data
│   ├── initial-graph.json
│   ├── journey-*.json      # Pre-curated literary journeys
│   └── meta.json
├── src/
│   ├── App.jsx            # Main application component
│   ├── GraphViz.jsx       # 3D graph visualization
│   ├── BookGridViz.jsx    # Book grid recommendation wall
│   ├── LiteraryNode.jsx   # Individual node renderer
│   ├── SidePanel.jsx      # Details panel
│   ├── TopLeftToolbar.jsx # Main toolbar
│   ├── Intro.jsx          # Loading screen
│   ├── store.js           # Zustand state management
│   ├── actions.js         # State actions and business logic
│   ├── llm.js             # AI model integration
│   ├── libraryApi.js      # Open Library API client
│   ├── prompts.js         # AI prompt engineering
│   └── index.css          # Global styles
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

### Key Components

#### State Management (`store.js`)
- Global application state using Zustand
- Immutable updates via Immer
- Auto-generated selector hooks for optimal re-renders

#### Actions (`actions.js`)
- Business logic for all user interactions
- API orchestration (LLM + Open Library)
- Graph manipulation algorithms
- Background enrichment pipeline

#### Library API (`libraryApi.js`)
- Open Library integration
- API throttling (100ms between calls)
- Image fetching and caching
- Theme extraction from descriptions

#### LLM Integration (`llm.js`)
- Google Gemini API client
- Exponential backoff retry logic
- Rate limit handling
- Support for multiple model variants

---

## 🔧 Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional (coming soon)
# FIREBASE_API_KEY=...
# FIREBASE_PROJECT_ID=...
```

### Customization

#### Add Custom Journeys

Create a new JSON file in `/public/journey-your-theme.json`:

```json
{
  "nodes": [
    {
      "label": "Your Book Title",
      "type": "book",
      "description": "A compelling description",
      "publicationYear": 2024,
      "api_key": "/works/OL123W"
    }
  ],
  "edges": [
    {"source": "Author Name", "target": "Your Book Title"}
  ],
  "commentary": "Your journey description"
}
```

Then add it to the journey suggestions in `App.jsx`.

#### Modify AI Prompts

Edit `/prompts.js` to customize how the AI interprets queries and generates connections.

#### Adjust Graph Physics

In `GraphViz.jsx`, tune the force-directed layout parameters:
- Node repulsion strength
- Edge spring constants
- Damping factors

---

## 📊 Performance Considerations

### Optimization Strategies

1. **Background Enrichment**: Node images and metadata load progressively without blocking UI
2. **API Throttling**: Rate-limited requests to Open Library (100ms interval)
3. **Retry Logic**: Exponential backoff for API failures
4. **Memoization**: Cached computations for timeline ranges and filters
5. **Instance Culling**: Nodes outside viewport are optimized

### Known Limitations

- **Large Graphs**: Performance may degrade beyond 200+ nodes (consider filtering)
- **Mobile Support**: Touch controls work but experience is optimized for desktop
- **API Quotas**: Gemini has rate limits; heavy use may require paid tier

---

## 🐛 Troubleshooting

### Common Issues

**"API Key not found" error**
- Ensure `.env.local` exists with valid `GEMINI_API_KEY`
- Restart dev server after creating/modifying `.env.local`

**Blank screen on load**
- Check browser console for errors
- Verify WebGL support in your browser
- Try clearing browser cache

**Slow searches**
- Check network tab for failed API calls
- Verify API key quota hasn't been exceeded
- Disable "Grounded Search" for faster results

**3D visualization not rendering**
- Update graphics drivers
- Try a different browser (Chrome/Firefox recommended)
- Disable browser extensions that might block WebGL

---

## 🗺️ Roadmap

### Current Phase: MVP & Polish ✅
- [x] Core 3D graph visualization
- [x] AI-powered search and expansion
- [x] Open Library integration
- [x] Journey mode
- [x] Book grid recommendations

### Next Phase: Stability & Enhancement 🚧
- [ ] Comprehensive error handling
- [ ] Loading states and skeletons
- [ ] TypeScript migration (complete)
- [ ] Unit and E2E testing
- [ ] Performance monitoring
- [ ] Mobile responsiveness improvements

### Future Features 🔮
- [ ] User accounts and saved explorations
- [ ] Social sharing and collaboration
- [ ] Reading list integration (Goodreads, LibraryThing)
- [ ] Export graphs as images/SVG
- [ ] Custom journey builder
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Educational mode for teachers/students

---

## 🤝 Contributing

Contributions are welcome! This project is in active development.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR
- Keep commits atomic and well-described

### Areas Needing Help

- TypeScript type definitions
- Test coverage
- Mobile UX improvements
- Accessibility enhancements
- Documentation and tutorials
- Performance optimization

---

## 📝 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

```
Copyright 2024 Literary Explorer Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Open Library** for comprehensive book data
- **Three.js** community for incredible 3D tools
- **React Three Fiber** for seamless React integration
- All contributors and users of this project

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/haigpapa/new-lit-engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/haigpapa/new-lit-engine/discussions)
- **AI Studio**: [View Original App](https://ai.studio/apps/drive/1cqlwODkeU1JvEEHtP4L3tceedQMBQbpr)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! It helps others discover it too.

---

<div align="center">

**Built with ❤️ for book lovers and literary explorers**

[⬆ Back to Top](#literary-explorer-)

</div>
