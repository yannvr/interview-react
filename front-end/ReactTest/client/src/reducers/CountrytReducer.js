import {
  GET_COUNTRY_SUCCESS,
  GET_COUNTRY_STARTED,
  GET_COUNTRY_FAIL
} from "../constants/messages";

const initialState = {
  loading: false,
  countries: "",
  error: null
};

export default function CountrytReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COUNTRY_STARTED:
      return {
        ...state,
        loading: true
      };
    case GET_COUNTRY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        countries: action.payload
      };
    case GET_COUNTRY_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
}
