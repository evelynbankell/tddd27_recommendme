import {
  FETCH_RECOMMENDATIONS_BEGIN,
  FETCH_RECOMMENDATIONS_SUCCESS,
  FETCH_GROUP_RECOMMENDATIONS_SUCCESS,
  FETCH_RECOMMENDATIONS_FAILURE,
  ADD_RECOMMENDATION, DELETE_GROUP
} from "../actionTypes";


const initialState = {
  pending: false,
  recommendations: [],
  recommendations_current_group: [],
  recommendation_group: 0,
  error: null
}


export default function recommendationsReducer(state = initialState, action) {
  switch (action.type) {


    case FETCH_RECOMMENDATIONS_BEGIN:
      return {
        ...state,
        pending: true
      }

    case FETCH_RECOMMENDATIONS_SUCCESS:
      return {
        ...state,
        pending: false,
        recommendations: action.payload.recommendations
      }

    case FETCH_GROUP_RECOMMENDATIONS_SUCCESS:
      return {
        ...state,
        pending: false,
        recommendations_current_group: action.payload.recommendations_current_group,
        recommendation_group: action.payload.recommendations_current_group.groupId
      }

    case FETCH_RECOMMENDATIONS_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.error
      }

      case ADD_RECOMMENDATION:
        return {
          ...state,
          pending: false,
          recommendations: {
            category: action.recommendations.category,
            title: action.recommendations.title,
            description: action.recommendations.description,
            rate: action.recommendations.rate,
            source: action.recommendations.source,
            who: action.recommendations.who,
            year: action.recommendations.year,
            imageUrl: action.recommendations.imageUrl
          }
        }

      case DELETE_GROUP:
        return {
          ...state,
          pending: false,
        }

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}

export const getRecommendationGroup = state => state.recommendations.recommendations_current_group.groupId;
export const getGroupRecommendations = state => state.recommendations.recommendations_current_group;
export const getRecommendations = state => state.recommendations.recommendations;
export const getRecommendationsPending = state => state.pending;
export const getRecommendationsError = state => state.error;
