import React, {
  Component,
  PropTypes
} from 'react';
import classNames from 'classnames/bind';
import styles from './AppButton.scss';
import Spinner from 'components/Spinner';
import lightness from 'lightness';
import { FaCheck } from 'react-icons/lib/fa';

const cx = classNames.bind(styles);

class AppButton extends Component {
  static propTypes = {
    /**
     * onClick handler
     */
    onClick: PropTypes.func,

    /**
     * Render the button in disabled state
     */
    isDisabled: PropTypes.bool,

    // disables the button and adds a spinner icon
    isBusy: PropTypes.bool,

    // Display a success status with a tick inside
    isSucceed: PropTypes.bool,

    // className attribute
    extraClass: PropTypes.string,

    /**
     * lg will render the button in 64px height
     * md will render the button in 36px height
     * sm will render the button in 24px height
     */
    size: PropTypes.oneOf(['lg', 'md', 'sm']),
    /**
     * primary will render the button in primary style
     * secondary will render the button in secondary style
     * additional will render the button in additional style
     */
    type: PropTypes.oneOf(['primary', 'secondary', 'additional']),
    block: PropTypes.bool,
    primaryColour: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    size: 'md',
    type: 'primary',
    block: false,
    primaryColour: '#3893d0',
    extraClass: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
  }

  handleClick = (e) => {
    const { onClick, isBusy, isDisabled } = this.props;
    if (isBusy || isDisabled) {
      e.preventDefault();
    } else {
      onClick.apply(this, arguments);
    }
  };

  mouseOver = () => {
    this.setState({hover: true});
  };

  mouseOut = () => {
    this.setState({hover: false});
  };

  getButtonCSSClass() {
    const {isDisabled, isBusy, size, type, block, extraClass} = this.props;
    return cx({
      [extraClass]: true,
      [type]: true,
      [size]: true,
      block: block,
      isDisabled: isDisabled,
      isBusy: isBusy,
      button: true
    });
  }

  getOptionalAttributes() {
    const { isDisabled } = this.props;
    var optionals = {};
    if (isDisabled) {
      optionals['disabled'] = true;
    }
    return optionals;
  }
  render() {
    const { primaryColour, children, isBusy, type, size, isDisabled, isSucceed } = this.props;
    let backgroundColor = primaryColour;
    const cx = classNames.bind(styles); // eslint-disable-line
    var optionals = this.getOptionalAttributes;
    if (this.state.hover) {
      backgroundColor = lightness(primaryColour, -10);
    }
    if (isDisabled) {
      backgroundColor = lightness(primaryColour, 40);
    }
    let styleOverride = {
      backgroundColor: backgroundColor
    };

    if (type !== 'primary') {
      styleOverride = null;
      backgroundColor = null;
    }
    return (
      <button type="button" style={styleOverride} className={this.getButtonCSSClass()}
        onClick={this.handleClick} onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} {...optionals}>
        {
          isBusy && <Spinner primaryColour={backgroundColor} size={size} />
        }
        {
          isSucceed && <FaCheck />
        }
        <span className={cx({hidden: isBusy || isSucceed})}>{children}</span>
      </button>
    );
  }
}

export default AppButton;
