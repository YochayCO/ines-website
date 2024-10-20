import { SurveyMetadata } from '../assets/2022_web_meta';
import { PersonData } from '../assets/2022_web_people';


interface SurveyState {
    titles?: {
        x: string;
        y: string;
    }
    isLoaded: boolean;
    peopleData?: PersonData[];
    metadata?: SurveyMetadata;
}

interface Action { 
    type: string; 
    payload: SurveyState
}

// Handles survey fetching
export default function surveysReducer(state: SurveyState, action: Action): SurveyState {
    switch (action.type) {
      case 'survey/fetchStarted': {
        return {
            titles: action.payload.titles,
            isLoaded: false,
        };
      }
      case 'survey/fetchDone': {
        // Should not happen
        if (state.titles !== action.payload.titles) {
            return state
        }

        return {
            ...state,
            peopleData: action.payload.peopleData,
            metadata: action.payload.metadata,
            isLoaded: true,
        };
      }
      default: {
        return {
            titles: undefined,
            isLoaded: false,
        }
      }
    }
  }