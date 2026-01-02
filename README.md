# Storylines

[![Deploy to GitHub Pages](https://github.com/haigpapa/STORYLINES/actions/workflows/deploy.yml/badge.svg)](https://github.com/haigpapa/STORYLINES/actions/workflows/deploy.yml)
[![Test and Build](https://github.com/haigpapa/STORYLINES/actions/workflows/test.yml/badge.svg)](https://github.com/haigpapa/STORYLINES/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**AI-Powered Literary Exploration Platform**

Storylines is a production-grade web application that transforms the way you explore literature through interactive graph visualization, semantic search, and AI-powered contextual enrichment. Discover hidden connections between books, authors, genres, themes, and literary movements in an immersive, visually stunning constellation interface.

## 🌐 Live Demo

**[View Live Demo →](https://haigpapa.github.io/storylines/)**

> **Automated Deployment:** This project automatically deploys to GitHub Pages on every push to main/master.

![Storylines Preview](https://via.placeholder.com/1200x600/0f172a/3b82f6?text=Storylines+Interactive+Graph)

## Features

### Core Functionality

- **Interactive Graph Visualization**: Force-directed graph canvas powered by D3.js with smooth canvas rendering
- **Semantic Search**: Unified search across OpenLibrary and Google Books APIs
- **Progressive Discovery**: Click nodes to view details, double-click to expand and discover related content
- **AI Contextual Enrichment**: Google Gemini API integration for intelligent insights and hidden connections
- **Visual Language System**: Distinct colors and icons for each node type (authors, books, genres, themes, characters, movements)

### User Experience

- **Reading Lists**: Save books to your personal reading list with status tracking
- **Bookmarks**: Mark interesting nodes for later exploration
- **Session Persistence**: Resume your exploration exactly where you left off
- **Export/Import**: Save and share your literary constellation maps
- **Dev Journal**: Built-in workflow logging showing your exploration process

### Technical Highlights

- **React + TypeScript**: Modern, type-safe component architecture
- **D3.js Force Simulation**: Physics-based graph layout with customizable forces
- **IndexedDB Caching**: Client-side storage for offline access and performance
- **Zustand State Management**: Efficient, minimal global state
- **Tailwind CSS**: Responsive, accessible design system
- **API Rate Limiting**: Smart request queuing and caching

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Google Gemini API key for AI insights

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/storylines.git
cd storylines

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### 1. Search & Seed

Start by searching for a book, author, or theme using the search panel. Click any result to add it as a node to your graph.

### 2. Expand & Explore

- **Click** a node to view detailed information in the info panel
- **Double-click** a node to expand and discover related content
- **Drag** nodes to rearrange the graph layout

### 3. AI Insights (Optional)

Enable AI insights by providing a Google Gemini API key. Get your free key at [Google AI Studio](https://makersuite.google.com/app/apikey).

### 4. Manage Your Collection

- Add books to your reading list
- Bookmark interesting discoveries
- Export your graph for sharing or backup

## Architecture

### Frontend Stack

```
React 19 + TypeScript
├── D3.js v7 - Force-directed graph visualization
├── Tailwind CSS - Styling and responsive design
├── Zustand - State management
└── Lucide React - Icon system
```

### API Integrations

- **OpenLibrary API**: Book and author metadata
- **Google Books API**: Enhanced book information and covers
- **Google Gemini API**: AI-powered contextual insights

### Data Storage

```
IndexedDB (via idb)
├── nodes - Graph nodes with metadata
├── edges - Relationships between nodes
├── sessions - User session snapshots
└── cache - API response caching
```

### Project Structure

```
src/
├── components/
│   ├── graph/          # Graph canvas and visualization
│   ├── search/         # Search interface
│   ├── nodes/          # Node detail panels
│   ├── journal/        # Dev journal
│   └── ui/             # Shared UI components
├── lib/
│   └── graphEngine.ts  # D3 graph simulation engine
├── services/
│   ├── openLibraryService.ts
│   ├── googleBooksService.ts
│   ├── geminiService.ts
│   └── storageService.ts
├── store/
│   └── useGraphStore.ts # Zustand state management
└── types/
    └── index.ts         # TypeScript definitions
```

## Node Types

| Type | Color | Description |
|------|-------|-------------|
| Author | Purple | Writers and creators |
| Book | Blue | Literary works |
| Genre | Green | Categories and styles |
| Theme | Orange | Concepts and motifs |
| Character | Red | Notable characters |
| Movement | Pink | Literary movements |

## Performance Optimizations

- Progressive node loading with depth limits
- Request caching and deduplication
- Canvas-based rendering for smooth 60fps
- Lazy loading of AI enrichment
- IndexedDB for persistent caching
- Debounced search queries

## Accessibility

- Keyboard navigation support
- High contrast mode
- Screen reader friendly
- Focus management
- ARIA labels

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/storylines)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify or connect via Git
```

## Configuration

Create a `.env` file for optional configuration:

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
```

## API Rate Limits

- OpenLibrary: No rate limit (be respectful)
- Google Books: 1000 requests/day (without API key)
- Gemini: 60 requests/minute (free tier)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] WebAssembly physics engine for larger graphs
- [ ] GPU-accelerated rendering with WebGL
- [ ] Collaborative exploration mode
- [ ] Custom visualization themes
- [ ] Export to various formats (PNG, SVG, PDF)
- [ ] Mobile app with React Native
- [ ] Graph analytics and statistics
- [ ] Advanced filtering and search

## Technical Appendix

### Graph Simulation Parameters

```typescript
{
  linkDistance: 100,      // Base distance between connected nodes
  chargeStrength: -300,   // Repulsion force strength
  nodeRadius: 8,          // Base node size
  enableCollision: true,  // Prevent node overlap
  centerForce: 0.05,      // Attraction to center
  radialForce: 0.3       // Depth-based positioning
}
```

### Edge Types

- `wrote`: Author → Book
- `influenced`: Author → Author
- `belongs_to`: Book → Genre
- `features`: Book → Theme
- `related_to`: Generic relationship
- `part_of`: Movement membership

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [D3.js](https://d3js.org/) - Data visualization
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenLibrary](https://openlibrary.org/) - Book data
- [Google Books](https://books.google.com/) - Book enrichment
- [Google Gemini](https://ai.google.dev/) - AI insights

## Support

For issues, questions, or feedback, please open an issue on GitHub.

---

**Made with ❤️ for literary explorers everywhere**

*Discovering the infinite connections of human storytelling*
