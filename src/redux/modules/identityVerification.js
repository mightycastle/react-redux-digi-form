import { bind } from 'redux-effects';
import { fetch } from 'redux-effects-fetch';
import { createAction, handleActions } from 'redux-actions';
import { assignDefaults } from 'redux/utils/request';
import _ from 'lodash';

// ------------------------------------
// Action type Constants
// ------------------------------------
export const RECEIVE_FORM = 'RECEIVE_FORM';
export const REQUEST_FORM = 'REQUEST_FORM';
export const DONE_FETCHING_FORM = 'DONE_FETCHING_FORM';
export const RECEIVE_PERSON = 'RECEIVE_PERSON';
export const REQUEST_PERSON = 'REQUEST_PERSON';
export const DONE_FETCHING_PERSON = 'DONE_FETCHING_PERSON';

export const INIT_IDENTITY_STATE = {
  isFetchingForm: false, // indicates the form request is being processed.
  isFetchingPerson: false, // indicates the person request is being fetched.
  form: null,
  person: null
};

// ------------------------------------
// Actions
// ------------------------------------

// ------------------------------------
// Action Helper: fetchForm
// ------------------------------------
export const processFetchForm = (id) => {
  var apiURL = `${API_URL}/form_document/api/form/${id}/`;
  const fetchParams = assignDefaults();

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receiveForm(_.merge(value, {id})));
      dispatch(doneFetchingForm()); // Hide loading spinner
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingForm()); // Hide loading spinner
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Action: requestForm
// ------------------------------------
export const requestForm = createAction(REQUEST_FORM);

// ------------------------------------
// Action: receiveForm
// ------------------------------------
export const receiveForm = createAction(RECEIVE_FORM, (data) => ({
  id: data.id,
  title: data.title,
  slug: data.slug
}));

// ------------------------------------
// Action: doneFetchingForm
// ------------------------------------
export const doneFetchingForm = createAction(DONE_FETCHING_FORM);

// ------------------------------------
// Action: fetchForm
// ------------------------------------
export const fetchForm = (id) => {
  return (dispatch, getState) => {
    dispatch(requestForm());
    dispatch(processFetchForm(id));
  };
};

// ------------------------------------
// Action Helper: processFetchPerson
// ------------------------------------
export const processFetchPerson = (id) => {
  var apiURL = `${API_URL}/contacts/api/person/${id}/`;
  const fetchParams = assignDefaults();

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receivePerson(value));
      dispatch(doneFetchingPerson()); // Hide loading spinner
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingPerson()); // Hide loading spinner
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Action: requestPerson
// ------------------------------------
export const requestPerson = createAction(REQUEST_PERSON);

// ------------------------------------
// Action: receivePerson
// ------------------------------------
export const receivePerson = createAction(RECEIVE_PERSON);

// ------------------------------------
// Action: doneFetchingPerson
// ------------------------------------
export const doneFetchingPerson = createAction(DONE_FETCHING_PERSON);

// ------------------------------------
// Action: fetchPerson
// ------------------------------------
export const fetchPerson = (id) => {
  return (dispatch, getState) => {
    dispatch(requestPerson());
    dispatch(processFetchPerson(id));
  };
};

// ------------------------------------
// Reducer
// ------------------------------------
const identityVerificationReducer = handleActions({
  RECEIVE_FORM: (state, { payload }) =>
    Object.assign({}, state, {
      form: payload
    }),

  REQUEST_FORM: (state, action) =>
    Object.assign({}, state, {
      isFetchingForm: true
    }),

  DONE_FETCHING_FORM: (state, action) =>
    Object.assign({}, state, {
      isFetchingForm: false
    }),

  RECEIVE_PERSON: (state, { payload }) =>
    Object.assign({}, state, {
      person: payload
    }),

  REQUEST_PERSON: (state, action) =>
    Object.assign({}, state, {
      isFetchingPerson: true
    }),

  DONE_FETCHING_PERSON: (state, action) =>
    Object.assign({}, state, {
      isFetchingPerson: false
    })

}, INIT_IDENTITY_STATE);

export default identityVerificationReducer;
