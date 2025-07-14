# INES Survey Data Analysis System - Comprehensive Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Python Data Processing Scripts](#python-data-processing-scripts)
3. [React Web Interface Components](#react-web-interface-components)
4. [Utility Functions](#utility-functions)
5. [TypeScript Types and Interfaces](#typescript-types-and-interfaces)
6. [Custom React Hooks](#custom-react-hooks)
7. [Setup and Development](#setup-and-development)
8. [Examples and Usage](#examples-and-usage)

## Project Overview

The INES (Israel National Election Studies) system consists of two main parts:

1. **Data Processing Pipeline** (`playground/`): Python scripts for processing survey data from Excel files and STATA files, managing a database of questions and question instances
2. **Web Visualization Interface** (`ines-website/`): React-based interactive interface for visualizing survey data with bar plots and bubble plots

### Key Concepts

- **Question**: A survey question that may appear across multiple surveys with slight variations
- **Question Instance (q_instance)**: A specific appearance of a question in a particular survey
- **Category**: Grouping of related questions
- **Survey**: Data collection for a specific year, with chronological ordering
- **qi_change**: Entity tracking differences between consecutive question instances

---

## Python Data Processing Scripts

### 1. Question Instance Management (`upsert_question_instances.py`)

Main script for processing survey data and managing question instances in the database.

#### Key Functions

##### `download_file(url: str, output_folder: str) -> str`
Downloads files from URLs if not already cached locally.

**Parameters:**
- `url`: URL of the file to download
- `output_folder`: Local folder to save the file

**Returns:** Path to the downloaded file

**Example:**
```python
file_path = download_file(
    "https://example.com/survey_data.dta", 
    "./data/"
)
```

##### `format_to_wxl_survey_name(column_name: str) -> str`
Converts survey column names to working Excel (WXL) format.

**Parameters:**
- `column_name`: Original column name from Excel

**Returns:** Formatted survey name

##### `parse_question_instances(surveys: list[dict[str, str]])`
Parses question instances from the working Excel file.

**Parameters:**
- `surveys`: List of survey dictionaries

**Workflow:**
1. Reads `question_index.xlsx`
2. Processes each category sheet
3. Extracts question instances with their metadata
4. Maps questions to surveys

##### `enrich_q_instance_from_dta(survey: dict[str, str])`
Enriches question instances with metadata from STATA files.

**Parameters:**
- `survey`: Survey dictionary containing file information

**Process:**
1. Downloads STATA file
2. Extracts variable labels and value labels
3. Updates question instances with detailed metadata

##### `save_question_instances(unique_question_instances: list[dict[str, str]])`
Saves processed question instances to the database.

**Parameters:**
- `unique_question_instances`: List of processed question instances

##### `find_duplicates_within_category(question_instances: list) -> list[tuple]`
Identifies duplicate questions within the same category.

**Returns:** List of tuples containing duplicate information

##### `create_question_instances()`
Main orchestration function that:
1. Fetches survey data
2. Parses question instances
3. Enriches with STATA metadata
4. Saves to database
5. Handles duplicates and mismatches

**Usage:**
```python
# Run the complete question instance creation process
create_question_instances()
```

### 2. Question Management (`upsert_wxl_questions.py`)

Manages the creation and updating of base questions from the working Excel file.

#### Key Functions

##### `create_questions()`
Creates question records from the working Excel file structure.

**Process:**
1. Reads category sheets from `question_index.xlsx`
2. Creates unique question IDs
3. Handles Hebrew descriptions and categories
4. Manages duplicate detection

### 3. Change Detection (`q_changes_extractor.py`)

Analyzes differences between consecutive question instances to track survey evolution.

#### Key Classes

##### `Survey(BaseModel)`
Represents a survey with metadata.

**Attributes:**
- `wxl_survey_id`: Survey identifier from working Excel
- `serial_num`: Chronological order number

##### `QuestionInstance(BaseModel)`
Represents a specific question appearance in a survey.

**Attributes:**
- `id`: Unique identifier
- `qid_s`: Question ID string
- `wxl_survey`: Associated survey
- `dta_description`: Description from STATA file
- `dta_answers`: Answer options mapping

##### `Question(BaseModel)`
Represents a base question with all its instances.

**Attributes:**
- `id`: Unique identifier
- `heb_title`: Hebrew title
- `category`: Question category
- `q_instances`: List of question instances

##### `QuestionChange(BaseModel)`
Represents detected changes between question instances.

**Attributes:**
- `wxl_question`: The question being analyzed
- `main_change_type`: Primary type of change detected
- `ratio`: Similarity ratio between instances
- `changes`: Detailed list of specific changes
- `pre_qi`: Previous question instance
- `post_qi`: Current question instance

#### Key Functions

##### `fetch_questions()`
Retrieves questions and their instances from the database.

##### `split_ordinal_and_other(answers: dict) -> tuple[dict, dict]`
Separates ordinal (numbered) answers from other answer types.

**Parameters:**
- `answers`: Dictionary of answer codes to labels

**Returns:** Tuple of (ordinal_answers, other_answers)

##### `identify_changes()`
Main function that compares consecutive question instances and identifies changes.

**Change Types Detected:**
- Description changes
- Answer option additions/removals
- Answer label modifications
- Structural changes

##### `get_main_change_type(changes: list) -> str | None`
Determines the primary change type from a list of detected changes.

**Priority Order:**
1. Description changes
2. Answer additions
3. Answer removals
4. Answer label changes

##### `get_diff(old_text: str, new_text: str) -> str`
Generates unified diff between two text strings.

**Usage:**
```python
# Run change detection analysis
fetch_questions()
identify_changes()
```

### 4. Codebook Processing (`codebooks_scripts/codebooks_parser.py`)

Processes codebook files to extract survey metadata and question information.

#### Key Functions

##### `download_file(url: str, output_folder: str) -> str`
Downloads codebook files from remote URLs.

##### `parse_codebook(file_path: str)`
Parses codebook text files to extract:
- Survey metadata
- Variable definitions
- Value labels
- Question descriptions

**File Format Expected:**
```
Survey Information
==================
Variable definitions and value labels
```

---

## React Web Interface Components

### 1. Main Application (`App.tsx`)

The root component that sets up the application layout and main navigation.

#### Structure
```tsx
function App() {
  return (
    <div className='app'>
      <div className='app-header'>
        {/* Logos and branding */}
        {/* Welcome message and description */}
        {/* Help information */}
        {/* Mobile warning */}
      </div>
      <Plotter />
    </div>
  )
}
```

#### Features
- Responsive layout with mobile device warning
- Institutional branding (INES and CARRD logos)
- Contextual help information
- Integration with main plotting interface

### 2. Main Plotter (`components/Plotter/Plotter.tsx`)

Central component for survey selection and visualization orchestration.

#### Props
None (standalone component)

#### State
- `surveyId`: Currently selected survey identifier
- `survey`: Loaded survey data and metadata

#### Key Functions

##### `updateSurvey(surveyId: string)`
Asynchronously loads survey data when selection changes.

**Process:**
1. Validates survey ID
2. Fetches survey data using `fetchSurvey` utility
3. Updates component state

#### Usage
```tsx
<Plotter />
```

#### Child Components
- `CustomSelect`: Survey selection dropdown
- `InnerPlotter`: Main visualization interface (rendered when survey is selected)

### 3. Custom Select (`components/CustomSelect/CustomSelect.tsx`)

Reusable dropdown component for user selections.

#### Props
```tsx
interface CustomSelectProps {
  inputLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}
```

#### Features
- Material-UI integration
- Keyboard navigation support
- Customizable styling
- Loading states

#### Example
```tsx
<CustomSelect 
  inputLabel="Select survey"
  value={selectedSurvey}
  onChange={setSurveyId}
  options={surveyOptions}
/>
```

### 4. Smart Chart (`components/SmartChart/SmartChart.tsx`)

Intelligent chart component that automatically selects appropriate visualization based on data characteristics.

#### Props
```tsx
interface SmartChartProps {
  survey: Survey;
  questionItems: QuestionItem[];
  selectedQuestions: string[];
}
```

#### Logic
- **Single Question**: Renders bar chart
- **Two Questions**: Renders bubble plot
- **Invalid Selection**: Shows error message

#### Features
- Automatic chart type detection
- Responsive design
- Loading states
- Error handling

### 5. Bar Plot (`components/BarPlot/BarPlot.tsx`)

Specialized component for single-variable frequency visualization.

#### Props
```tsx
interface BarPlotProps {
  data: BarGraphDatum[];
  xAxis: QuestionAxis;
  graphMeta: GraphMeta;
}
```

#### Features
- Nivo bar chart integration
- Custom styling and themes
- Responsive design
- Tooltip customization
- Accessibility compliance

#### Data Format
```tsx
interface BarGraphDatum {
  id: string;
  label: string;
  value: number;
  percentage: number;
}
```

### 6. Bubble Plot (`components/BubblePlot/BubblePlot.tsx`)

Advanced component for two-variable cross-tabulation visualization.

#### Props
```tsx
interface BubblePlotProps {
  data: BubbleGraphSerie[];
  xAxis: QuestionAxis;
  yAxis: QuestionAxis;
  graphMeta: GraphMeta;
}
```

#### Features
- Interactive bubble sizing based on frequency
- Custom color schemes
- Zoom and pan capabilities
- Advanced tooltip information
- Legend with statistical information

#### Data Format
```tsx
interface BubbleGraphSerie {
  id: string;
  data: BubbleGraphDatum[];
}

interface BubbleGraphDatum {
  x: string;
  y: string;
  v: number; // bubble size value
  percentage: number;
}
```

### 7. Info Expander (`components/InfoExpander/InfoExpander.tsx`)

Collapsible component for displaying help and documentation.

#### Props
```tsx
interface InfoExpanderProps {
  children: React.ReactNode;
  title?: string;
}
```

#### Features
- Smooth expand/collapse animations
- Icon state indicators
- Keyboard accessibility
- Customizable content

### 8. Screenshot Button (`components/ScreenshotButton/ScreenshotButton.tsx`)

Component for capturing and downloading chart visualizations.

#### Features
- High-quality PNG export
- Automatic filename generation
- Progress indicators
- Error handling for unsupported browsers

#### Usage
```tsx
<ScreenshotButton 
  targetElementId="chart-container"
  filename="survey-visualization"
/>
```

---

## Utility Functions

### 1. Survey Utilities (`utils/survey.ts`)

Core functions for survey data processing and analysis.

#### Key Functions

##### `fetchSurvey(surveyId: string): Promise<Survey | null>`
Loads complete survey data including CSV data and JSON metadata.

**Parameters:**
- `surveyId`: Unique survey identifier

**Returns:** Promise resolving to Survey object or null if error

**Process:**
1. Validates survey ID
2. Parallel fetch of CSV data and JSON metadata
3. Combines into unified Survey object
4. Error handling and logging

**Example:**
```tsx
const survey = await fetchSurvey('2022_panel1');
if (survey) {
  // Process survey data
  console.log(`Loaded ${survey.data.length} responses`);
}
```

##### `fetchSurveyDataById(id: string): Promise<SurveyRows>`
Fetches and parses CSV survey data.

**Parameters:**
- `id`: Survey identifier

**Returns:** Promise resolving to parsed CSV data

##### `getSurveyMetaById(id: string): Promise<SurveyMeta>`
Fetches survey metadata and question items.

**Parameters:**
- `id`: Survey identifier

**Returns:** Promise resolving to survey metadata

##### `sortByRate(ansA: string, ansB: string): number`
Sorts answer options by numerical rate when available.

**Logic:**
1. Extracts numerical rates from answer strings
2. Falls back to alphabetical sorting for non-numerical answers
3. Handles mixed numerical/text scenarios

##### `isCellAValidAnswer(ans: unknown): boolean`
Validates whether a cell contains a valid survey response.

**Validation Rules:**
- Must be a string
- Must not be empty after trimming
- Excludes null/undefined values

##### `getBubbleGraphAnswers(props: SmartBubblePlotProps)`
Extracts unique answer sets for two-variable analysis.

**Returns:**
```tsx
{
  xAnswers: string[];
  yAnswers: string[];
}
```

##### `getBarGraphAnswers(props: SmartBarPlotProps): string[]`
Extracts unique answers for single-variable analysis.

##### `getQuestionTitle(english: string, hebrew: string): string`
Formats bilingual question titles.

**Format:** `"English Description / Hebrew Description"`

### 2. Graph Utilities (`utils/graph.ts`)

Functions for graph data processing and formatting.

#### Key Functions

##### `getRateAndLabel(answer: string): [string, string]`
Separates numerical rates from descriptive labels in answer strings.

**Examples:**
- `"1. Strongly agree"` → `["1", "Strongly agree"]`
- `"Don't know"` → `["Don't know", ""]`

##### `getLabel(answer: string): string`
Extracts the descriptive label portion of an answer.

##### `getNormalValues(answers: string[]): string[]`
Filters answers to include only "normal" responses (excludes special values like "Don't know", "Refused").

##### `getWeight(row: SurveyRow, weightName: string): number`
Extracts survey weight for a response row.

**Parameters:**
- `row`: Survey response row
- `weightName`: Weight variable name

**Returns:** Numerical weight value (defaults to 1.0)

### 3. File Utilities (`utils/files.ts`)

Functions for file operations and data fetching.

#### Key Functions

##### `fetchCSV(path: string): Promise<string>`
Fetches CSV file content from public directory.

##### `fetchJson(path: string): Promise<object>`
Fetches and parses JSON files from public directory.

##### `downloadFile(content: string, filename: string, mimeType: string)`
Triggers browser download of generated content.

### 4. Screen Utilities (`utils/screen.ts`)

Functions for screen capture and image generation.

#### Key Functions

##### `captureElement(elementId: string): Promise<string>`
Captures DOM element as base64 image using html2canvas.

##### `downloadImage(base64: string, filename: string)`
Downloads captured image to user's device.

### 5. Bar Graph Utilities (`utils/barGraph.ts`)

Specialized functions for bar chart data processing.

#### Key Functions

##### `getBarGraphData(props: SmartBarPlotProps, config: BubbleGraphConfig)`
Processes survey data into bar chart format.

**Returns:**
```tsx
{
  graphData: BarGraphDatum[];
  numOfEffectiveResponses: number;
}
```

**Process:**
1. Aggregates response frequencies
2. Calculates percentages
3. Applies weighting if specified
4. Filters invalid responses

### 6. Bubble Graph Utilities (`utils/bubbleGraph.ts`)

Advanced functions for bubble plot data processing and cross-tabulation.

#### Key Functions

##### `getBubbleGraphData(props: SmartBubblePlotProps, config: BubbleGraphConfig)`
Main function for bubble plot data generation.

**Returns:**
```tsx
{
  data: BubbleGraphSerie[];
  meta: GraphMeta;
}
```

**Process:**
1. Builds initial cross-tabulation
2. Applies filtering and cleaning
3. Calculates percentages and weights
4. Formats for Nivo bubble chart

##### `buildInitialGraphData(props, config): InitialBubbleGraphSerie[]`
Creates raw cross-tabulation from survey responses.

##### `cleanBubbleGraphData(data, config, answers): InitialBubbleGraphSerie[]`
Filters and standardizes cross-tabulation data.

**Cleaning Steps:**
- Removes disabled answer combinations
- Adds missing cells with zero values
- Standardizes answer ordering

##### `enrichBubbleGraphData(data, config, answers): BubbleGraphSerie[]`
Adds calculated fields and formatting.

**Enrichment:**
- Percentage calculations
- Weight normalization
- Answer type classification
- Total row generation

---

## TypeScript Types and Interfaces

### 1. Survey Types (`types/survey.ts`)

Core data structures for survey representation.

#### `QuestionItem`
Represents a survey question with metadata.

```tsx
interface QuestionItem {
  id: string;                      // Unique identifier
  questionHebrewDescription: string; // Hebrew question text
  englishDescription: string;       // English question text
  questionSurveyId: string;        // Survey-specific question ID
  type: QuestionType;              // "demography" | "category"
  disabled?: boolean;              // Whether question is available for analysis
}
```

#### `SurveyMeta`
Survey metadata and configuration.

```tsx
interface SurveyMeta extends SurveyMetaBase {
  questionItems: QuestionItem[];
}

interface SurveyMetaBase {
  id: string;                              // Survey identifier
  dataLink: string;                        // Link to raw data
  weights?: Record<WeightName, string>;    // Available weight variables
  sectorFieldName?: string;                // Field for sector identification
}
```

#### `Survey`
Complete survey object with data and metadata.

```tsx
type Survey = {
  data: SurveyRows;    // Response data
  meta: SurveyMeta;    // Survey metadata
}

type SurveyRows = SurveyRow[];
interface SurveyRow {
  [columnTitle: string]: string;
}
```

### 2. Graph Types (`types/graph.ts`)

Data structures for visualization components.

#### Bar Graph Types

```tsx
interface BarGraphDatum {
  id: string;          // Answer identifier
  label: string;       // Display label
  value: number;       // Frequency count
  percentage: number;  // Percentage of total
}

interface SmartBarPlotProps {
  survey: Survey;
  x: QuestionItem;
}
```

#### Bubble Graph Types

```tsx
interface BubbleGraphDatum {
  x: string;           // X-axis answer
  y: string;           // Y-axis answer  
  v: number;           // Bubble size value
  percentage: number;  // Percentage of total
}

interface BubbleGraphSerie {
  id: string;                    // Serie identifier
  data: BubbleGraphDatum[];      // Data points
}

interface SmartBubblePlotProps {
  survey: Survey;
  x: QuestionItem;
  y: QuestionItem;
}
```

#### Configuration Types

```tsx
interface BubbleGraphConfig {
  showPercentages: boolean;      // Display percentages vs. counts
  useWeights: boolean;           // Apply survey weights
  weightName: WeightName;        // Which weight to use
  showOnlyNormalAnswers: boolean; // Exclude special values
  selectedSector: string;        // Filter by sector
}

interface GraphMeta {
  numOfEffectiveResponses: number; // Valid response count
}
```

#### Axis Configuration

```tsx
interface QuestionAxis {
  question: QuestionItem;        // Question metadata
  answers: string[];             // Available answers
  normalAnswers: string[];       // Normal (non-special) answers
}
```

---

## Custom React Hooks

### 1. Graph Data Hooks

#### `useBarGraph(props: SmartBarPlotProps): BarGraphHook`
Manages bar chart data processing and state.

**Returns:**
```tsx
interface BarGraphHook {
  xAxis: QuestionAxis;
  graphData: BarGraphDatum[];
  graphMeta: GraphMeta;
  graphCommons: GraphCommons;
}
```

**Features:**
- Memoized data processing
- Automatic recalculation on prop changes
- Integration with graph commons

**Example:**
```tsx
function BarChart({ survey, question }) {
  const { xAxis, graphData, graphMeta } = useBarGraph({ survey, x: question });
  
  return (
    <ResponsiveBar
      data={graphData}
      // ... other props
    />
  );
}
```

#### `useBubbleGraph(props: SmartBubblePlotProps): BubbleGraphHook`
Manages bubble plot data processing and state.

**Returns:**
```tsx
interface BubbleGraphHook {
  xAxis: QuestionAxis;
  yAxis: QuestionAxis;
  graphData: BubbleGraphSerie[];
  graphMeta: GraphMeta;
  graphCommons: GraphCommons;
}
```

### 2. Utility Hooks

#### `useGraphCommons(): GraphCommons`
Provides shared graph configuration and state.

**Returns:**
```tsx
interface GraphCommons {
  showPercentages: boolean;
  setShowPercentages: (value: boolean) => void;
  useWeights: boolean;
  setUseWeights: (value: boolean) => void;
  weightName: WeightName;
  setWeightName: (name: WeightName) => void;
  showOnlyNormalAnswers: boolean;
  setShowOnlyNormalAnswers: (value: boolean) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
}
```

#### `useQuestionAxis(answers: string[], question: QuestionItem): QuestionAxis`
Processes question data for axis configuration.

**Parameters:**
- `answers`: Available answer options
- `question`: Question metadata

**Returns:** Formatted axis configuration

#### `useGraphHeader(survey: Survey, questions: QuestionItem[]): string`
Generates formatted graph titles and descriptions.

#### `useScreenshotHandler(elementId: string): ScreenshotHandler`
Manages screenshot capture functionality.

**Returns:**
```tsx
interface ScreenshotHandler {
  capture: () => Promise<void>;
  isCapturing: boolean;
  error: string | null;
}
```

#### `useIsFirstSession(): boolean`
Tracks whether this is the user's first visit for onboarding.

---

## Setup and Development

### Prerequisites

**Python Environment:**
- Python 3.8+
- pip or conda for package management

**Node.js Environment:**
- Node.js 16+
- npm or yarn

### Installation

#### Python Dependencies
```bash
cd playground
pip install -r requirements.txt
```

**Key packages:**
- `pandas`: Data manipulation
- `pyreadstat`: STATA file reading
- `supabase`: Database connectivity
- `python-dotenv`: Environment management
- `pydantic`: Data validation
- `Levenshtein`: String similarity

#### Node.js Dependencies
```bash
cd ines-website
npm install
```

**Key packages:**
- `react`: UI framework
- `typescript`: Type safety
- `vite`: Build tool
- `@nivo/bar`, `@nivo/circle-packing`: Visualization
- `@mui/material`: UI components
- `papaparse`: CSV parsing

### Development Workflow

#### Python Scripts
```bash
cd playground

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run question processing
python upsert_wxl_questions.py
python upsert_question_instances.py
python q_changes_extractor.py
```

#### React Development
```bash
cd ines-website

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

#### Required Environment Variables
```bash
# .env file in playground/
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

#### Database Schema
The system expects these Supabase tables:
- `surveys`: Survey metadata
- `wxl_questions`: Questions from working Excel
- `q_instances`: Question instances
- `qi_changes`: Question changes (deprecated)

### Docker Deployment

#### Build and Run
```bash
cd ines-website

# Build application
npm run build

# Build Docker image
docker build -t ines-website-app .

# Run container
docker run -d -p 80:80 ines-website-app:latest
```

---

## Examples and Usage

### 1. Basic Data Processing Workflow

```python
# Complete question processing pipeline
from upsert_wxl_questions import create_questions
from upsert_question_instances import create_question_instances
from q_changes_extractor import fetch_questions, identify_changes

# Step 1: Create base questions
create_questions()

# Step 2: Process question instances
create_question_instances()

# Step 3: Analyze changes
fetch_questions()
identify_changes()
```

### 2. Survey Data Analysis

```python
# Analyze specific survey
import pandas as pd
from supabase import create_client

# Connect to database
supabase = create_client(url, key)

# Get survey questions
response = supabase.table('q_instances') \
  .select('*') \
  .eq('wxl_survey_id', '2022') \
  .execute()

questions = response.data
print(f"Found {len(questions)} questions in 2022 survey")
```

### 3. React Component Usage

#### Simple Bar Chart
```tsx
import { useState, useEffect } from 'react';
import { fetchSurvey } from '../utils/survey';
import BarPlot from '../components/BarPlot/BarPlot';
import useBarGraph from '../hooks/useBarGraph';

function SurveyVisualization({ surveyId, questionId }) {
  const [survey, setSurvey] = useState(null);
  
  useEffect(() => {
    fetchSurvey(surveyId).then(setSurvey);
  }, [surveyId]);
  
  if (!survey) return <div>Loading...</div>;
  
  const question = survey.meta.questionItems.find(q => q.id === questionId);
  const { graphData, xAxis, graphMeta } = useBarGraph({ survey, x: question });
  
  return (
    <BarPlot
      data={graphData}
      xAxis={xAxis}
      graphMeta={graphMeta}
    />
  );
}
```

#### Advanced Bubble Plot
```tsx
import BubblePlot from '../components/BubblePlot/BubblePlot';
import useBubbleGraph from '../hooks/useBubbleGraph';

function CrossTabAnalysis({ survey, xQuestionId, yQuestionId }) {
  const xQuestion = survey.meta.questionItems.find(q => q.id === xQuestionId);
  const yQuestion = survey.meta.questionItems.find(q => q.id === yQuestionId);
  
  const { graphData, xAxis, yAxis, graphMeta } = useBubbleGraph({
    survey,
    x: xQuestion,
    y: yQuestion
  });
  
  return (
    <BubblePlot
      data={graphData}
      xAxis={xAxis}
      yAxis={yAxis}
      graphMeta={graphMeta}
    />
  );
}
```

### 4. Custom Data Processing

#### Extract Question Changes
```python
from q_changes_extractor import QuestionChange, get_diff

def analyze_question_evolution(question_id):
    """Analyze how a specific question changed over time."""
    
    # Get question instances chronologically
    instances = get_question_instances_by_id(question_id)
    changes = []
    
    for i in range(1, len(instances)):
        prev_qi = instances[i-1]
        curr_qi = instances[i]
        
        # Detect description changes
        if prev_qi.dta_description != curr_qi.dta_description:
            diff = get_diff(prev_qi.dta_description, curr_qi.dta_description)
            changes.append({
                'type': 'description_change',
                'survey': curr_qi.wxl_survey.wxl_survey_id,
                'diff': diff
            })
    
    return changes
```

#### Custom Survey Analysis
```typescript
// Custom hook for survey filtering
function useFilteredSurvey(survey: Survey, filters: SurveyFilters) {
  return useMemo(() => {
    if (!survey) return null;
    
    let filteredData = survey.data;
    
    // Apply sector filter
    if (filters.sector && survey.meta.sectorFieldName) {
      filteredData = filteredData.filter(
        row => row[survey.meta.sectorFieldName] === filters.sector
      );
    }
    
    // Apply weight
    if (filters.useWeights && survey.meta.weights) {
      const weightField = survey.meta.weights[filters.weightName];
      // Weight application logic here
    }
    
    return {
      ...survey,
      data: filteredData
    };
  }, [survey, filters]);
}
```

### 5. Error Handling Patterns

#### Python Error Handling
```python
import logging

def safe_process_survey(survey_id):
    """Process survey with comprehensive error handling."""
    try:
        # Download survey data
        survey_path = download_file(survey_url, output_folder)
        
        # Process with pyreadstat
        df, meta = pyreadstat.read_dta(survey_path)
        
        # Validate data
        if df.empty:
            raise ValueError(f"No data found in survey {survey_id}")
            
        return df, meta
        
    except requests.RequestException as e:
        logging.error(f"Failed to download survey {survey_id}: {e}")
        return None, None
        
    except Exception as e:
        logging.error(f"Error processing survey {survey_id}: {e}")
        return None, None
```

#### React Error Handling
```tsx
// Error boundary for chart components
class ChartErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-error">
          <h3>Chart could not be rendered</h3>
          <p>Please try selecting different questions or refreshing the page.</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ChartErrorBoundary>
  <SmartChart survey={survey} questions={questions} />
</ChartErrorBoundary>
```

---

## Performance Considerations

### Data Processing Optimization
- Use pandas vectorized operations
- Implement caching for frequently accessed surveys
- Process data in chunks for large datasets
- Use database indexing for fast queries

### React Performance
- Memoize expensive calculations with `useMemo`
- Use `React.memo` for pure components
- Implement virtual scrolling for large question lists
- Lazy load chart components

### Memory Management
- Clear large datasets after processing
- Use streaming for file downloads
- Implement proper cleanup in useEffect hooks
- Monitor bundle size and code splitting

This comprehensive documentation covers all major functions and components in the INES system. Each section provides detailed explanations, examples, and usage patterns to help developers understand and extend the system effectively.