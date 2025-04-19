# CodexGUI (Web Edition)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

CodexGUI is a powerful web application that provides Git repository analysis and manipulation, LLM conversation logs, and project meta management in a browser/PWA format.

## 🌟 Features

- **Git Integration**: Analyze and manipulate Git repositories directly from your browser
- **Conversation History**: Keep track of all your LLM interactions with persistent chat logs
- **Project Management**: Organize and manage multiple projects in one place
- **Avatar Personas**: Customize your assistant with different personas and visual representations
- **Offline Support**: Works offline with core functionality through PWA capabilities
- **Multi-language Support**: Available in English, Korean, Chinese (Simplified), Japanese, and Spanish

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ for frontend development
- Python 3.11+ for backend services
- Git installed on your system

### Installation

#### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/codexgui.git
   cd codexgui
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m app.main
   ```

4. Access the application at `http://localhost:5173` for frontend development or `http://localhost:8000` for the production build.

#### Using Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/codexgui.git
   cd codexgui
   ```

2. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost:8000`.

## 📖 Usage

1. **Launch Screen**: Enter your OpenAI API key when prompted
2. **Projects Screen**: Create or select a project to work with
3. **Project Info**: Use the chat interface to interact with the LLM assistant
   - View and access recently modified files from the left panel
   - The assistant will analyze your project structure and help with your development tasks

## 🛠️ Development Roadmap

CodexGUI is being developed in sprints, following this roadmap:

- [x] **S0**: Project setup with Vite, React, TailwindCSS, and basic i18n
- [x] **S1**: Launch screen with API key validation, improved UI and enhanced internationalization
- [ ] **S2**: Projects list screen with cards and favorites
- [ ] **S3**: Backend Git/FS API endpoints
- [ ] **S4**: Project info screen with chat logs
- [ ] **S5**: Structure Analyzer and Snapshot viewer
- [ ] **S6**: Persona status animations
- [x] **S7**: International languages support (Completed early in Sprint 1)
- [ ] **S8**: LAIOS Bridge α
- [ ] **S9**: QA and performance optimization
- [ ] **S10**: Beta release

## 🌐 Technology Stack

- **Frontend**: TypeScript, React 18, Zustand, Radix UI, TailwindCSS, React Router, Vite
- **Backend**: Python, FastAPI, SQLite, Dulwich (Git), JWT
- **Storage**: SQLite for app meta, NDJSON for chat logs, JSON for structure snapshots

## 🤝 Contributing

We welcome contributions to CodexGUI! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

For more detailed documentation, please visit our [Documentation](docs/) folder.
