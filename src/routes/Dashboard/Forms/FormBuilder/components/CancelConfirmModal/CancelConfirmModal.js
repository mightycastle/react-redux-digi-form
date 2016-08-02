import React, {
  Component,
  PropTypes
} from 'react';
import {
  Modal,
  Button
} from 'react-bootstrap';
import { connectModal } from 'redux-modal';

class CancelConfirmModal extends Component {
  static propTypes = {
    handleHide: PropTypes.func.isRequired,
    show: PropTypes.bool,
    setQuestionEditMode: PropTypes.func,
    saveElement: PropTypes.func
  };

  handleYes = () => {
    const { handleHide, setQuestionEditMode, saveElement } = this.props;
    saveElement();
    setQuestionEditMode({ mode: false });
    handleHide();
  }

  handleNo = () => {
    const { handleHide, setQuestionEditMode } = this.props;
    setQuestionEditMode({ mode: false });
    handleHide();
  }

  render() {
    const { show, handleHide } = this.props;
    return (
      <Modal show={show} onHide={handleHide}
        aria-labelledby="ModalHeader">
        <Modal.Body>
          Do you want to save changes?
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.handleYes}>
            Yes
          </Button>
          <Button onClick={this.handleNo}>
            No
          </Button>
        </Modal.Footer>

      </Modal>
    );
  }
}

export default connectModal({ name: 'cancelConfirmModal' })(CancelConfirmModal);
