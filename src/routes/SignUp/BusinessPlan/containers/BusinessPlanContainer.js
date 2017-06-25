import connect from 'redux/utils/connect';
import {
  purchasePlan,
  goToNextStep,
  goToPreviousStep,
  fetchPlans,
  verifySubdomain,
  setEmail,
  setSelectedPlanConfig,
  setPaymentMethod,
  displaySubdomainHint,
  INIT_BUSINESS_PLAN_STATE
} from 'redux/modules/businessPlan';

import BusinessPlan from '../components/BusinessPlan';

const mapActionCreators = {
  purchasePlan,
  goToNextStep,
  goToPreviousStep,
  fetchPlans,
  verifySubdomain,
  setEmail,
  setSelectedPlanConfig,
  setPaymentMethod,
  displaySubdomainHint
};

const mapStateToProps = (state) => {
  const { businessPlan } = state;
  const {
    plansConfig,
    stepIndex,
    validations,
    paymentMethod,
    purchaseErrorMessage,
    isPageBusy,
    currentlySelectedPlan
  } = businessPlan || INIT_BUSINESS_PLAN_STATE;
  return {
    plansConfig,
    stepIndex,
    validations,
    paymentMethod,
    purchaseErrorMessage,
    isPageBusy,
    currentlySelectedPlan
  };
};

export default connect(mapStateToProps, mapActionCreators)(BusinessPlan);
