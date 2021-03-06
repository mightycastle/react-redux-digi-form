import { bind } from 'redux-effects';
import { fetch } from 'redux-effects-fetch';
import { assignDefaults } from 'redux/utils/request';
import { createAction, handleActions } from 'redux-actions';
import load from 'load-stripe';

const NEXT_STEP = 'NEXT_STEP';
const PREVIOUS_STEP = 'PREVIOUS_STEP';

export const SET_PAYMENT_METHOD = 'SET_PAYMENT_METHOD';
export const SET_SELECTED_PLAN_CONFIG = 'SET_SELECTED_PLAN_CONFIG';
export const SET_EMAIL = 'SET_EMAIL';

export const RECEIVE_VERIFY_SUBDOMAIN = 'RECEIVE_VERIFY_SUBDOMAIN';
export const RECEIVE_PURCHASE_RESULT = 'RECEIVE_PURCHASE_RESULT';

const REQUEST_PURCHASE_BUSINESS_PLAN = 'REQUEST_PURCHASE_BUSINESS_PLAN';
const DONE_FETCHING_PLANS = 'DONE_FETCHING_PLANS';
const DONE_PURCHASING_BUSINESS_PLAN = 'DONE_PURCHASING_BUSINESS_PLAN';

const DISPLAY_SUBDOMAIN_HINT = 'DISPLAY_SUBDOMAIN_HINT';

export const INIT_BUSINESS_PLAN_STATE = {
  stepIndex: 0,
  currentlySelectedPlan: {
    subdomain: ''
  },
  validations: {
    displaySubdomainHint: false,
    displaySubdomainVerified: false,
    isSubdomainVerified: false,
    subdomainErrorMessage: ''
  },
  email: '',
  paymentMethod: {
    cardNumber: '',
    expiry: '',
    cvc: ''
  },
  purchaseErrorMessages: [],
  isPageBusy: true
};

export const nextStep = createAction(NEXT_STEP);
export const previousStep = createAction(PREVIOUS_STEP);

export const setPaymentMethod = createAction(SET_PAYMENT_METHOD);
export const setEmail = createAction(SET_EMAIL);
export const setSelectedPlanConfig = createAction(SET_SELECTED_PLAN_CONFIG);

export const requestPurchaseBusinessPlan = createAction(REQUEST_PURCHASE_BUSINESS_PLAN);
export const doneFetchingPlans = createAction(DONE_FETCHING_PLANS);
export const donePurchasingBusinessPlan = createAction(DONE_PURCHASING_BUSINESS_PLAN);
export const receiveVerifySubdomain = createAction(RECEIVE_VERIFY_SUBDOMAIN);

const requestStripeCardToken = function (number, month, year, cvc, cb) {
  // Async load stripe when you need it.
  load(`${STRIPE_PUBLISHABLE_KEY}`).then((stripe) => {
    stripe.card.createToken({
      number: number.trim(),
      exp_month: month,
      exp_year: year,
      cvc: cvc
    }, cb);
  });
};

export const displaySubdomainHint = createAction(DISPLAY_SUBDOMAIN_HINT);

export const changeSubdomain = (subdomain) => {
  return (dispatch, getState) => {
    dispatch(setSelectedPlanConfig({
      subdomain: subdomain
    }));
    dispatch(receiveVerifySubdomain({
      displaySubdomainVerified: false,
      isSubdomainVerified: false,
      subdomainErrorMessage: ''
    }));
    if (subdomain.length < 4) {
      dispatch(receiveVerifySubdomain({
        subdomainErrorMessage: 'Subdomain must be longer than four characters'
      }));
    }
  };
};
export const verifySubdomain = (subdomain) => {
  return (dispatch, getState) => {
    dispatch(processVerifySubdomain(subdomain));
  };
};

export const goToNextStep = () => {
  return (dispatch, getState) => {
    dispatch(nextStep());
  };
};

export const goToPreviousStep = () => {
  return (dispatch, getState) => {
    dispatch(previousStep());
  };
};
export const fetchPlans = () => {
  return (dispatch, getState) => {
    const { plan, period } = getState().router.locationBeforeTransitions.query;
    dispatch(processFetchPlans(plan, period));
  };
};

export const purchasePlan = () => {
  return (dispatch, getState) => {
    const { currentlySelectedPlan, paymentMethod, email, planConfig } = getState().businessPlan;
    const { subdomain, billingCycle, numberOfUsers } = currentlySelectedPlan;
    const { cardNumber, expiry, cvc } = paymentMethod;
    dispatch(requestPurchaseBusinessPlan());  // sets busy state

    const pricingId = planConfig.purchaseOptions.find((option) => {
      return option.recurring_type === billingCycle;
    }).plan_pricing_id;

    // hacky way to split expiry into month and year
    const slashIndex = expiry.indexOf('/');
    const expiryMonth = expiry.slice(0, slashIndex);
    const expiryYear = expiry.slice(slashIndex+1, expiry.length);

    requestStripeCardToken(cardNumber, expiryMonth, expiryYear, cvc, function (responseCode, resp) {
      if (responseCode === 200) {
        const card = resp['card'];
        const plan = {
          email: email,
          subdomain: subdomain,
          plan_pricing_id: pricingId,
          number_of_users: numberOfUsers,
          client_ip: resp['client_ip'],
          stripe_card_id: card['id'],
          stripe_card_figerprint: '',
          stripe_card_token: '',
          card_brand: card['brand'],
          card_country: card['country'],
          card_last4: card['last4']
        };
        dispatch(processPurchase(plan));
      } else {
        const errorMessage = resp['error']['message'];
        const errorMessages = [errorMessage];
        dispatch(donePurchasingBusinessPlan(errorMessages));
      }
    });
  };
};
const processFetchPlans = (planName, period) => {
  const apiURL = `${API_URL}/billing/api/plan/`;
  const fetchParams = assignDefaults({
    method: 'GET'
  });
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      const plan = value.find((p) => p.name.toLowerCase() === planName);
      dispatch(setSelectedPlanConfig({
        numberOfUsers: plan.min_required_num_user,
        billingCycle: period
      }));
      const cameledPlanConfig = {
        name: plan.name,
        minRequiredNumUser: plan.min_required_num_user,
        purchaseOptions: plan.purchase_options,
        maxNumUser: plan.max_num_user,
        currency: plan.currency
      };
      dispatch(doneFetchingPlans(cameledPlanConfig));
    };
  };
  const fetchFail = (data) => {
  };
  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

const processVerifySubdomain = (subdomain) => {
  const apiURL = `${API_URL}/accounts/api/subdomain/verify/`;
  const body = {subdomain};
  const fetchParams = assignDefaults({
    method: 'POST',
    body
  });
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      const {result, error} = value;
      dispatch(receiveVerifySubdomain({
        displaySubdomainVerified: true,
        isSubdomainVerified: result,
        subdomainErrorMessage: error
      }));
    };
  };
  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(receiveVerifySubdomain({
        displaySubdomainVerified: true,
        isSubdomainVerified: false,
        subdomainErrorMessage: 'Service Error'
      }));
    };
  };
  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

const processPurchase = (plan) => {
  const apiURL = `${API_URL}/billing/api/subscription/`;
  const body = { ...plan };
  const fetchParams = assignDefaults({
    method: 'POST',
    body
  });

  const fetchSuccess = ({value}) => {
    const {result, message} = value;
    return (dispatch, getState) => {
      if (result === 'rejected') {
        dispatch(donePurchasingBusinessPlan(message));
      }
    };
  };

  const fetchFail = ({value}) => {
    return (dispatch, getState) => {
      let messages = [];
      if (typeof value !== 'object') {
        dispatch(donePurchasingBusinessPlan(['Server Error']));
      } else {
        Object.keys(value).forEach(key => {
          messages.push(value[key][0]);
        });
        dispatch(donePurchasingBusinessPlan(messages));
      }
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Reducer
// ------------------------------------
const businessPlanReducer = handleActions({
  NEXT_STEP: (state, action) =>
    Object.assign({}, state, {
      stepIndex: 1,
      purchaseErrorMessages: []
    }),
  PREVIOUS_STEP: (state, action) =>
    Object.assign({}, state, {
      stepIndex: 0
    }),
  RECEIVE_VERIFY_SUBDOMAIN: (state, action) =>
    Object.assign({}, state, {
      validations: Object.assign({}, state.validations, {...action.payload})
    }),
  REQUEST_PURCHASE_BUSINESS_PLAN: (state, action) =>
    Object.assign({}, state, {
      isPageBusy: true
    }),
  DONE_FETCHING_PLANS: (state, action) =>
    Object.assign({}, state, {
      planConfig: action.payload,
      isPageBusy: false
    }),
  DONE_PURCHASING_BUSINESS_PLAN: (state, action) =>
    Object.assign({}, state, {
      purchaseErrorMessages: action.payload,
      isPageBusy: false
    }),
  SET_SELECTED_PLAN_CONFIG: (state, action) =>
    Object.assign({}, state, {
      currentlySelectedPlan: Object.assign({}, state.currentlySelectedPlan, { ...action.payload })
    }),
  SET_PAYMENT_METHOD: (state, action) =>
    Object.assign({}, state, {
      purchaseErrorMessages: [],
      paymentMethod: Object.assign({}, state.paymentMethod, {...action.payload})
    }),
  SET_EMAIL: (state, action) =>
    Object.assign({}, state, {
      purchaseErrorMessages: [],
      email: action.payload
    }),
  DISPLAY_SUBDOMAIN_HINT: (state, action) =>
    Object.assign({}, state, {
      validations: Object.assign({}, state.validations, {
        displaySubdomainHint: action.payload
      })
    })
}, INIT_BUSINESS_PLAN_STATE);

export default businessPlanReducer;
