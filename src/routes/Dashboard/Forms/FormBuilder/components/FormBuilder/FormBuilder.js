import React, {
  Component,
  PropTypes
} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import ElementsListPanel from '../ElementsListPanel';
import PageView from '../PageView';
import QuestionEditPanel from '../QuestionEditPanel';
import CancelConfirmModal from '../CancelConfirmModal';
import UploadModal from '../UploadModal';
import { formsUrl } from 'helpers/urlHelper';
import styles from './FormBuilder.scss';
import DocumentFieldsSelectionHeader from 'components/FormBuilder/DocumentFieldsSelectionHeader';
import {
  formBuilderSelectMode
} from 'constants/formBuilder';
import {
  getActiveLabel,
  getNextBoxIndex,
  getChoiceLabelByIndex
} from 'helpers/formBuilderHelper';
import { getQuestionInputSchema } from 'schemas/questionInputs';

class FormBuilder extends Component {

  static propTypes = {
    /*
     * Form ID
     */
    id: PropTypes.number.isRequired,

    /*
     * questions: Redux state to store the array of questions.
     */
    questions: PropTypes.array.isRequired,

    /*
     * logics: Redux state to store the array of logics.
     */
    logics: PropTypes.array.isRequired,

    /*
     * documents: Redux state to store the array of documents with image url.
     */
    documents: PropTypes.array,

    /*
     * documentMapping: Redux state to hold the bounding box of the question item in document
     */
    documentMapping: PropTypes.object.isRequired,

    /*
     * isFetching: Redux state that indicates whether the requested form is being fetched from backend
     */
    isFetching: PropTypes.bool.isRequired,

    /*
     * isVerifying: Redux state that indicates the status whether the form is being submitted
     */
    isSubmitting: PropTypes.bool.isRequired,

    /*
     * isModified: Redux state that indicates whether the form is modified since last save or load.
     */
    isModified: PropTypes.bool.isRequired,

    /*
     * saveElement: Redux action to save the current element being edited.
     */
    saveElement: PropTypes.func.isRequired,

    /*
     * saveForm: Redux action to save the current element being edited and submit form.
     */
    saveForm: PropTypes.func.isRequired,

    /*
     * currentElement: Redux state to hold the element currently being edited.
     */
    currentElement: PropTypes.object,

    /*
     * setQuestionInfo: Redux action to add or update a specific item into current question.
     */
    setQuestionInfo: PropTypes.func.isRequired,

    /*
     * resetQuestionInfo: Redux action to remove a specific item into current question.
     */
    resetQuestionInfo: PropTypes.func.isRequired,

    /*
     * setValidationInfo: Redux action to add or update a specific item in validations array.
     */
    setValidationInfo: PropTypes.func.isRequired,

    /*
     * resetValidationInfo: Redux action to remove a specific item in validations array.
     */
    resetValidationInfo: PropTypes.func.isRequired,

    /*
     * setMappingInfo: Action to update the document mapping info.
     */
    setMappingInfo: PropTypes.func.isRequired,

    resetMappingInfo: PropTypes.func.isRequired,

    /*
     * setMappingPositionInfo: Action to update the document mapping position info of active selection.
     */
    setMappingPositionInfo: PropTypes.func.isRequired,

    /*
     * pageZoom: Redux state to keep the page zoom ratio.
     */
    pageZoom: PropTypes.number.isRequired,

    /*
     * setPageZoom: Redux action to set page zoom ratio.
     */
    setPageZoom: PropTypes.func.isRequired,

    /*
     * questionEditMode: Redux state to indicate question edit mode
     * One of formBuilderSelectMode
     */
    questionEditMode: PropTypes.number.isRequired,

    /*
     * setCurrentElement: Redux action to set/load currentElement
     */
    setCurrentElement: PropTypes.func.isRequired,

    /*
     * setQuestionEditMode: Redux action to set question edit mode.
     * If id is specified, enters into existing question edit mode.
     * If id is not specified, enters into new question edit mode.
     */
    setQuestionEditMode: PropTypes.func.isRequired,

    /*
     * setActiveBox: Redux action to set activeBoxPath path.
     */
    setActiveBox: PropTypes.func.isRequired,
    deleteElement: PropTypes.func.isRequired,
    /*
     * newForm: Redux action to reset form with initial state for new form
     */
    newForm: PropTypes.func.isRequired,

    /*
     * fetchForm: Redux action to fetch form from backend with ID specified by request parameters
     */
    fetchForm: PropTypes.func.isRequired,

    /*
     * params: URL params
     */
    params: PropTypes.object,

    /*
     * show: Redux modal show
     */
    show: PropTypes.func.isRequired,

    /*
     * goTo: Redux action to go to specific url.
     */
    goTo: PropTypes.func.isRequired
  };

  componentDidUpdate(prevProps, prevState) {
    const { id, goTo, params, fetchForm } = this.props;
    // If it was redirected from forms/new, fetchForm again.
    params.id && !prevProps.params.id && !id && fetchForm(params.id);

    // If it was in forms/new and received id from Upload modal, redirects to {:formId}/edit
    // TODO: test this
    id && !params.id && goTo(formsUrl(`/${id}/edit`));
  };

  componentDidMount() {
    const { params, fetchForm } = this.props;
    if (params.id) {
      fetchForm(params.id);
    } else {
      const { show } = this.props;
      show('uploadModal');
    }
  }

  goToQuestionTypeListView = () => {
    this.props.setQuestionEditMode(formBuilderSelectMode.QUESTION_TYPE_LIST_VIEW);
  }

  saveAndContinue = () => {
    const { saveForm } = this.props;
    saveForm();
    this.goToQuestionTypeListView();
  }

  deleteCurrentQuestion = () => {
    const { setQuestionEditMode, setCurrentElement } = this.props;
    setCurrentElement(null);
    setQuestionEditMode(formBuilderSelectMode.QUESTION_TYPE_LIST_VIEW);
  }

  getAvailableSelectionFields = () => {
    const questionTypeName = this.props.currentElement.question.type;
    if (questionTypeName === 'CheckboxField') {
      var choices = this.props.currentElement.question.choices;
      if (!choices || !choices.length > 0) {
        return [];
      }
      var fieldsGroup = [];
      _.forEach(choices, function (choice) {
        var field = {'displayName': choice.label, 'key': choice.label, 'group': 'STANDARD'};
        fieldsGroup.push(field);
      });
      if (this.props.currentElement.question.include_other) {
        var otherLabel = getChoiceLabelByIndex(choices.length);
        fieldsGroup.push({'displayName': otherLabel, 'key': 'other', 'group': 'STANDARD'});
      }
      return [fieldsGroup];
    } else {
      var schema = getQuestionInputSchema(questionTypeName);
      var result = schema['availableFields'];
      return result;
    }
  }

  get activeLabel() {
    const activeBoxPath = _.get(this.props, ['currentElement', 'activeBoxPath']);
    return getActiveLabel(activeBoxPath);
  }

  setActiveLabel = (label) => {
    const { currentElement, setActiveBox } = this.props;
    const index = getNextBoxIndex(label, currentElement);
    setActiveBox(_.join([label, 'positions', index], '.'));
  }

  getMappedFieldsForCurrentQuestion() {
    var fieldsWithValidMapping = _.pickBy(this.props.currentElement.mappingInfo, function (value, key, object) {
      return value && Object.keys(value['positions']).length > 0;
    });
    return Object.keys(fieldsWithValidMapping);
  }

  render() {
    const { saveElement, setQuestionEditMode, questionEditMode } = this.props;
    const leftPanelClass = classNames({
      [styles.leftPanel]: true,
      [styles.open]: questionEditMode
    });
    const rightPanelClass = classNames({
      [styles.rightPanel]: true,
      [styles.open]: questionEditMode
    });

    var DocumentHeaderElement = null;
    if (questionEditMode === formBuilderSelectMode.QUESTION_BOX_MAPPING_VIEW) {
      var availableFields = this.getAvailableSelectionFields();
      // only display this component if availableFields is configured in the the schema
      if (availableFields) {
        DocumentHeaderElement = <DocumentFieldsSelectionHeader
          backLinkClickHandler={this.goToQuestionTypeListView}
          availableFields={availableFields}
          className={styles.fieldsSelectorHeader}
          activeLabel={this.activeLabel} setActiveLabel={this.setActiveLabel}
          finalisedFields={this.getMappedFieldsForCurrentQuestion()}
          saveAndContinueClickHandler={this.saveAndContinue}
          deleteClickHandler={this.deleteCurrentQuestion}
        />;
      }
    }

    return (
      <div className={styles.formBuilderContainer}>
        {DocumentHeaderElement}
        <div className={leftPanelClass}>
          {questionEditMode
            ? <QuestionEditPanel {...this.props} />
            : <ElementsListPanel {...this.props} />
          }
        </div>
        <div className={rightPanelClass}>
          <PageView {...this.props} />
        </div>
        <UploadModal {...this.props} />
        <CancelConfirmModal
          saveElement={saveElement}
          setQuestionEditMode={setQuestionEditMode} />
      </div>
    );
  }
}

export default FormBuilder;
