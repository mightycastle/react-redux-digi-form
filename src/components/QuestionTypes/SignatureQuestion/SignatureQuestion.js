import React, {
  Component,
  PropTypes
} from 'react';
import {
  Modal
} from 'react-bootstrap';
import FormEnterButton from 'components/Buttons/FormEnterButton/FormEnterButton';
import AppButton from 'components/Buttons/AppButton/AppButton';
import SignatureWidget from 'components/SignatureWidget/SignatureWidget';
import VerificationWidget from 'components/SignatureWidget/VerificationWidget';
import styles from './SignatureQuestion.scss';
import { signatureFonts } from 'schemas/signatureSchema';
import { valueIsValid } from 'helpers/validationHelper';
import getCsrfToken from 'redux/utils/csrf';
import request from 'superagent';
import _ from 'lodash';

const apiUrl = `${API_URL}/form_document/api/signing_verification`;

class SignatureQuestion extends Component {

  static contextTypes = {
    primaryColour: React.PropTypes.string
  };

  static propTypes = {
    compiledQuestion: PropTypes.object.isRequired,
    isReadOnly: PropTypes.bool,
    isInputLocked: PropTypes.bool,
    autoFocus: PropTypes.bool,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    showModal: PropTypes.func,
    handleEnter: PropTypes.func,
    formTitle: PropTypes.string,
    sessionId: PropTypes.number,
    ensureSessionExists: PropTypes.func,
    // flag to determine if this question should launch modals to display widgets
    isEditAnswerModal: PropTypes.bool
  };

  static defaultProps = {
    isReadOnly: false,
    value: {'name': '', 'email': '', 'dataUrl': ''},
    isEditAnswerModal: false
  };

  constructor(props) {
    super(props);
    this.state = {
      activeWidget: '', // 'signature', 'verification'
      verificationStatus: '', // 'code_sent', 'verifying', 'success', 'failed'
      value: this.props.value,
      errors: {'name': [], 'email': [], 'dataUrl': [], 'code': []}
    };
  };

  componentDidMount() {
    var self = this;
    this.props.ensureSessionExists().then(function () {
      self.setState({'isFormSessionCreated': true});
    });
  }

  showSignatureWidget = () => {
    this.setState({activeWidget: 'signature'});
  }
  showVerificationWidget = () => {
    this.setState({activeWidget: 'verification'});
  }
  hideWidget = () => {
    this.setState({activeWidget: ''});
  }

  _getEmptyErrors() {
    return {'name': [], 'email': [], 'dataUrl': [], 'code': []};
  }
  resetErrors = (fieldName=false) => {
    var newErrors = this.state.errors;
    if (fieldName) {
      newErrors[fieldName] = [];
    } else {
      newErrors = this._getEmptyErrors();
    }
    this.setState({
      errors: newErrors
    });
  }

  handleSignatureChange = (value) => {
    // check if email has changed
    if (value.email !== this.state.value.email) {
      this.setState({verificationStatus: ''});
    }
    this.setState({value: value}, () => { this.props.handleEnter(); });
  }

  handleKeyDown = (event) => {
    const { handleEnter } = this.props;
    if (event.keyCode === 13) {
      handleEnter();
    }
  }

  validate(cb) {
    const validations = this.props.compiledQuestion['validations'];
    const isRequired = typeof _.find(validations, { type: 'isRequired' }) !== 'undefined';
    const { value } = this.state;
    var isValid = true;
    var errors = this._getEmptyErrors();
    if (isRequired) {
      if (value.dataUrl === '') {
        errors.dataUrl = ['Please sign your signature.'];
        isValid = false;
      }
      var emailErrors = valueIsValid(value.email, [{'type': 'isEmail'}]);
      if (emailErrors.length > 0) {
        errors.email = emailErrors;
        isValid = false;
      }
      // Empty signature name error handle
      var nameErrors = valueIsValid(value.name, [{'type': 'isRequired'}]);
      if (nameErrors.length > 0) {
        errors.name = nameErrors;
        isValid = false;
      }
    }
    if (isValid) {
      cb(true);
    } else {
      this.setState({errors: errors});
      cb(false);
    }
  }

  verify(cb) {
    const validations = this.props.compiledQuestion['validations'];
    const isRequired = typeof _.find(validations, { type: 'isRequired' }) !== 'undefined';
    const that = this;
    const { value: { email } } = this.state;
    const { sessionId } = this.props;
    if (isRequired) {
      request.get(`${apiUrl}/check_email/?email=${email}&response_id=${sessionId}`)
        .set('X-CSRFToken', getCsrfToken())
        .send()
        .end(function (err, res) {
          if (err) {
            console.error('request error', err); // TODO: deal with this potential error
            cb(false);
          }
          var serverResult = JSON.parse(res.text)['is_verified'];
          if (serverResult) {
            // email is already verified
            that.props.onChange(that.state.value);
            cb(true);
          } else {
            // email has not been verified yet
            that.showVerificationWidget();
            // do we need to send a code?
            // TODO: is there a way to check from the backend if a code was already sent?
            if (that.state.verificationStatus === '') {
              // send code
              that.sendVerificationCode();
            }
            cb(false);
          }
        });
    } else {
      this.props.onChange(this.state.value);
      cb(true);
    }
  }

  sendVerificationCode = () => {
    const that = this;
    const { value: { name, email } } = this.state;
    const { sessionId } = this.props;
    request.post(`${apiUrl}/request_email_verification_code/`)
      .set('X-CSRFToken', getCsrfToken())
      .send({ display_name: name, email: email, response_id: sessionId })
      .end(function (err, res) {
        if (err) {
          console.error('request error', err); // TODO: deal with this potential error
        } else {
          that.setState({verificationStatus: 'code_sent'});
        }
      });
  }

  verifyCode = (code) => {
    const that = this;
    const { value: { email } } = this.state;
    const { sessionId } = this.props;
    this.setState({verificationStatus: 'verifying'});
    request.post(`${apiUrl}/verify_email_code/`)
      .set('X-CSRFToken', getCsrfToken())
      .send({ code: code, email: email, response_id: sessionId })
      .end(function (err, res) {
        if (err) {
          console.error('request error', err); // TODO: deal with this potential error
        } else {
          var serverResult = JSON.parse(res.text)['is_verified'];
          if (serverResult) {
            that.setState({verificationStatus: 'success'});
            that.props.onChange(that.state.value);
            that.props.handleEnter();
          } else {
            that.setState({verificationStatus: 'failed'});
            var newErrors = that.state.errors;
            newErrors.code = ['Please enter a valid code'];
            that.setState({errors: newErrors});
          }
        }
      });
  }

  renderSignatureWidget() {
    var widgetProps = {
      value: this.state.value,
      errors: this.state.errors,
      resetErrors: this.resetErrors,
      formTitle: this.props.formTitle,
      onChange: this.handleSignatureChange,
      isInputLocked: this.props.isInputLocked,
      hasConsentCheckbox: this.props.compiledQuestion.consentCheckbox || false,
      closeWidget: this.hideWidget,
      isEditAnswerModal: this.props.isEditAnswerModal
    };
    if (!this.props.isEditAnswerModal) {
      return (
        <Modal show={this.state.activeWidget === 'signature'}>
          <Modal.Header>
            <Modal.Title>YOUR SIGNATURE</Modal.Title>
          </Modal.Header>
          <SignatureWidget {...widgetProps} />
        </Modal>
      );
    } else if (this.state.activeWidget === 'signature') {
      return (
        <SignatureWidget {...widgetProps} />
      );
    } else {
      return false;
    }
  }

  renderVerificationWidget() {
    var widgetProps = {
      value: this.state.value,
      errors: this.state.errors.code,
      resetErrors: this.resetErrors,
      isInputLocked: this.props.isInputLocked,
      verificationStatus: this.state.verificationStatus,
      verifyCode: this.verifyCode,
      resendCode: this.sendVerificationCode,
      closeWidget: this.hideWidget
    };
    if (!this.props.isEditAnswerModal) {
      return (
        <Modal show={this.state.activeWidget === 'verification'}>
          <Modal.Body>
            <VerificationWidget {...widgetProps} />
          </Modal.Body>
        </Modal>
      );
    } else if (this.state.activeWidget === 'verification') {
      return (
        <VerificationWidget {...widgetProps} />
      );
    } else {
      return false;
    }
  }

  _renderSignatureQuestion() {
    const { isReadOnly, isInputLocked, autoFocus, isEditAnswerModal } = this.props;
    const { value, activeWidget } = this.state;
    const preloadFonts = signatureFonts.map((font, index) => (
      <div className={`signature-font-preload preload-${font.name}`} key={index}>font</div>
    ));
    const that = this;
    return (
      <div className={styles.signature}>
        {(!isEditAnswerModal || activeWidget === '') && value.dataUrl &&
          <div>
            <img src={value.dataUrl} alt="signature"
              className={styles.signatureImage}
              ref="signatureImage"
              tabIndex={0} onKeyDown={this.handleKeyDown}
            />
            <AppButton
              isDisabled={isInputLocked}
              size="lg"
              autoFocus={!value.dataUrl && autoFocus}
              onClick={that.showSignatureWidget}>
              Re-sign
            </AppButton>
          </div>
        }
        {(!isEditAnswerModal || activeWidget === '') && !isReadOnly && !value.dataUrl &&
          <FormEnterButton buttonLabel="Sign"
            isDisabled={isInputLocked}
            autoFocus={!value.dataUrl && autoFocus}
            onClick={that.showSignatureWidget}
          />
        }
        {this.renderSignatureWidget()}
        {this.renderVerificationWidget()}
        {preloadFonts}
      </div>
    );
  }

  _renderPlaceHolder() {
    return (<span></span>);
  }

  render() {
    if (this.state.isFormSessionCreated) {
      return this._renderSignatureQuestion();
    } else {
      return this._renderPlaceHolder();
    }
  }
}

export default SignatureQuestion;
