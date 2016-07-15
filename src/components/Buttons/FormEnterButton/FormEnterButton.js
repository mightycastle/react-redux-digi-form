import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import styles from './FormEnterButton.scss';

class FormEnterButton extends Component {

  static propTypes = {
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool,
    buttonLabel: PropTypes.string,
    autoFocus: PropTypes.bool
  };

  static defaultProps = {
    buttonLabel: '',
    autoFocus: false
  };

  static contextTypes = {
    primaryColor: React.PropTypes.string
  };

  handleClick = () => {
    const { onClick } = this.props;
    if (typeof onClick === 'function') onClick();
  }

  renderDefaultLabel() {
    return (
      <div className={styles.btnDefaultInner}>
        <div>press</div>
        <div>ENTER</div>
      </div>
    );
  }

  renderButtonLabel() {
    const { buttonLabel } = this.props;
    return (
      <div className={styles.btnInner}>
        {buttonLabel}
      </div>
    );
  }

  render() {
    const { buttonLabel, isDisabled, autoFocus } = this.props;
    var { primaryColor } = this.context;
    var optionals = {};

    if (autoFocus) {
      optionals['autoFocus'] = {
        autoFocus: true
      };
    }
    if (typeof primaryColor !== 'undefined') {
      optionals['style'] = {
        color: primaryColor,
        borderColor: primaryColor
      };
    }

    if (isDisabled) {
      optionals['disabled'] = true;
    }

    return (
      <Button type="button" onClick={this.handleClick}
        className={styles.formEnterButton}
        {...optionals}>
        {buttonLabel !== '' ? this.renderButtonLabel() : this.renderDefaultLabel()}
      </Button>
    );
  }
}

export default FormEnterButton;