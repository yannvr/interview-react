import axios from "axios";

import {
  GET_COUNTRY_STARTED,
  GET_COUNTRY_SUCCESS,
  GET_COUNTRY_FAIL
} from "../constants/messages";

import CONFIG from "../config/index";

export const getCountries = () => {
  return dispatch => {
    dispatch(getCountryStarted());

    axios
      .get(`${CONFIG.apiBaseUrl}/countries`)
      .then(res => {
        // console.log(res);
        dispatch(getCountrySuccess(res.data));
      })
      .catch(err => {
        // console.log(err);
        dispatch(getCountryFail(err.message));
      });
  };
};

const getCountryStarted = () => ({
  type: GET_COUNTRY_STARTED
});

const getCountrySuccess = data => ({
  type: GET_COUNTRY_SUCCESS,
  payload: data
});

const getCountryFail = error => ({
  type: GET_COUNTRY_FAIL,
  payload: error
});
