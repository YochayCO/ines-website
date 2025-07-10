# INES Website Architecture

## Overview

The INES (Israel National Election Studies) website is a static web application designed to help social science researchers better understand and control survey data. The project consists of a main frontend application and supporting data processing tools.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with Tailwind CSS (via Shadcn components)
- **Deployment**: Docker with Nginx
- **Data Processing**: Python scripts for survey data analysis
- **Package Management**: npm

## Project Structure

```
.
├── ines-website/                 # Main frontend application
│   ├── src/                      # Source code
│   │   ├── components/           # React components
│   │   │   ├── SmartChart/       # Graph plotting components
│   │   │   └── ...               # Other UI components
│   │   ├── context/              # React context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   ├── assets/               # Static assets (images, etc.)
│   │   ├── scripts/              # Utility scripts
│   │   ├── App.tsx               # Main application component
│   │   ├── main.tsx              # Application entry point
│   │   └── ...                   # Configuration files
│   ├── public/                   # Static assets
│   │   ├── surveys_data/         # Survey data files (CSV)
│   │   ├── surveys_meta/         # Survey metadata (JSON)
│   │   ├── question_items/       # Question definitions (JSON)
│   │   └── ines-logo.png         # Brand assets
│   ├── dist/                     # Build output
│   ├── Dockerfile                # Container configuration
│   ├── compose.yaml              # Docker Compose setup
│   ├── nginx.conf                # Nginx configuration
│   ├── package.json              # Dependencies and scripts
│   └── ...                       # Build and config files
├── playground/                   # Data processing scripts
│   ├── upsert_wxl_questions.py   # Question metadata processing
│   ├── upsert_question_instances.py # Question instance processing
│   ├── q_changes_extractor.py    # Change analysis tool
│   ├── question_index.xlsx       # Question mapping file
│   └── ...                       # Data files and outputs
├── codebooks/                    # Survey codebook files
├── codebooks_scripts/            # Codebook processing scripts
└── tests/                        # Test files
```

## Core Architecture Principles

### 1. Static Frontend Application
- Single-page application built with React and TypeScript
- Static assets served via Nginx
- No server-side rendering or dynamic backend
- Client-side data fetching from static JSON/CSV files

### 2. Component Organization
- **PascalCase** naming for React components
- Reusable components in `src/components/`
- Feature-specific components grouped in subdirectories
- SmartChart components for the main graph plotting functionality

### 3. Data Flow Architecture
```
Static Data Files (public/) → React Components → User Interface
     ↓
Survey Metadata (JSON)
Question Items (JSON)
Survey Data (CSV)
```

## Data Architecture

### Survey Data Structure
The application processes three main types of survey data:

1. **Survey Metadata** (`surveys_meta/`)
   ```json
   {
     "id": "survey_id",
     "weights": {
       "weightName": "weight_key"
     },
     "sectorFieldName": "sector_field_id",
     "dataLink": "https://socsci4.tau.ac.il/mu2/ines/data/our-data/"
   }
   ```

2. **Question Items** (`question_items/`)
   ```json
   [
     {
       "id": "1. שאלה בעברית",
       "questionHebrewDescription": "שאלה בעברית",
       "questionSurveyId": "a1",
       "type": "demography",
       "disabled": "true",
       "englishDescription": "respondent number"
     }
   ]
   ```

3. **Survey Data** (`surveys_data/`)
   - CSV files containing respondent answers
   - One file per survey
   - Structured data for analysis and visualization

### Database Schema (Playground)
The Python processing scripts work with a database containing:

- **Surveys**: Survey metadata and chronological ordering
- **wxl_questions**: Question metadata and category mapping
- **q_instances**: Individual question instances per survey
- **qi_changes**: Change tracking between question instances

## Frontend Architecture

### Component Hierarchy
```
App.tsx
├── Context Providers
├── Main Layout
├── SmartChart Components
│   ├── GraphHeader
│   ├── GraphFiltersMenu
│   └── Chart Visualization
└── Other UI Components
```

### State Management
- React Context for global state
- Local component state for UI interactions
- Custom hooks for data fetching and business logic

### File Organization Rules
- **Components**: `src/components/` with PascalCase naming
- **Hooks**: `src/hooks/` for reusable logic
- **Types**: `src/types/` for TypeScript definitions
- **Utils**: `src/utils/` for helper functions
- **Assets**: `src/assets/` for imported assets, `public/` for fetched assets

## Data Processing Pipeline

### Python Scripts (Playground)
1. **upsert_wxl_questions.py**: Processes question metadata from Excel files
2. **upsert_question_instances.py**: Links question instances to surveys
3. **q_changes_extractor.py**: Analyzes changes between question instances

### Data Flow
```
Excel Files (wxl) → Python Processing → Database → JSON/CSV Output → Frontend
```

## Deployment Architecture

### Docker Setup
- Multi-stage build for optimized production images
- Nginx for static file serving
- Environment-specific configurations

### Build Process
1. TypeScript compilation with Vite
2. Asset optimization and bundling
3. Static file generation
4. Docker image creation

## Development Guidelines

### Code Organization
- Feature-based component grouping
- Shared utilities in dedicated directories
- Type definitions for data structures
- Consistent naming conventions

### Data Handling
- Static file serving for performance
- Client-side data processing
- Responsive design for various screen sizes
- Accessibility considerations

### Performance Considerations
- Static asset optimization
- Lazy loading for large datasets
- Efficient data structures for survey analysis
- Minimal bundle size through code splitting

## Security Considerations

- Static file serving reduces attack surface
- No server-side code execution
- Client-side data validation
- Secure asset delivery via HTTPS

## Future Architecture Considerations

- Potential for server-side rendering if needed
- API integration for dynamic data
- Real-time data updates
- Advanced caching strategies
- Micro-frontend architecture for scalability 