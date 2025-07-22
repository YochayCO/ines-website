# Multi-Survey View Feature Implementation

A feature to allow users to view and compare response distributions across multiple surveys, aggregating and aligning data from different survey datasets. This enables longitudinal analysis and visualization of trends over time.

## Completed Tasks

- [x] Analyze existing graph plotter architecture and data flow
- [x] Identify gaps and requirements for multi-year support
- [x] Create entry point component: `MultiSurveyPlotter.tsx`
- [x] Set up project structure for multi-year components and utilities
- [x] Integrate with existing plotter components (reuse or extend as needed)

## In Progress Tasks

- [ ] Design data model for multi-survey aggregation
- [ ] Implement question selector for multi-select view
- [ ] Implement a surveys selection slider
- [ ] Implement grouping toggle logic and connect to plot components
- [ ] Implement `MultiSurveyBarPlot` and `MultiSurveyLinePlot` and connect them to real data

## Future Tasks

- [ ] Implement utility to fetch multiple surveys in parallel (`fetchMultiSurveys.ts`)
- [ ] Handle missing surveys and incomplete data gracefully
- [ ] Create aggregation logic for multi-survey data (`aggregateMultiSurveyData.ts`)

## Implementation Plan

The Multi-Survey View feature will be implemented in several stages:

1. **Project Structure**: Create dedicated directories for multi-survey components and utilities to keep code modular and maintainable.
2. **Data Layer**: Develop utilities to fetch, normalize, and aggregate data from multiple surveys. This includes handling differences in answer codes, missing surveys, and metadata alignment.
3. **Aggregation Logic**: Implement logic to combine and align responses for the same question across surveys, supporting all relevant plot types (bar, bubble, matrix).
4. **UI/UX**: Build user interface components for selecting surveys, displaying aggregated results, and visualizing trends. Ensure seamless integration with existing plotter UI.

### Relevant Files

- `src/components/MultiSurveyPlotter/MultiSurveyPlotter.tsx` - Entry point for the multi-survey view feature
- `src/utils/multiSurvey/fetchQuestionInstances.ts` - Utility for fetching multiple question instances in parallel
- `src/components/MultiSurveyPlotter/SurveySelector.tsx` - UI component for selecting surveys
- `src/components/MultiSurveyPlotter/MultiSurveyBarPlot.tsx` - Visualization component for multi-survey bar plots
- `src/components/MultiSurveyPlotter/MultiSurveyBubblePlot.tsx` - Visualization component for multi-survey bubble/matrix plots
