import React, {
  Component,
  PropTypes
} from 'react';
import {
  Button,
  Grid
} from 'react-bootstrap';
import { MdClose, MdMenu } from 'react-icons/lib/md';
import StackLogo from 'components/Logos/StackLogo';
import classNames from 'classnames';
import styles from './FormHeader.scss';
import { FORM_USER_SUBMISSION } from 'redux/modules/formInteractive';

class FormHeader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isMobileMenuOpen: false
    };
  }
  static contextTypes = {
    primaryColour: React.PropTypes.string
  };

  static propTypes = {
    /*
     * title: Form title
     */
    title: PropTypes.string.isRequired,
    /*
     * submitAnswer: Redux action to send submit request to server. Here it will be submitted by user's action.
     */
    submitAnswer: PropTypes.func.isRequired
  }

  componentDidMount() {
    window.addEventListener('click', this.hideMobileMenu);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.hideMobileMenu);
  }

  showMobileMenu = (e) => {
    this.setState({ isMobileMenuOpen: true });
    e.stopPropagation();
  }

  hideMobileMenu = (e) => {
    this.setState({ isMobileMenuOpen: false });
    e.stopPropagation();
  }

  handleSubmitAnswer = () => {
    const { submitAnswer } = this.props;
    submitAnswer(FORM_USER_SUBMISSION);
  }

  render() {
    const { title } = this.props;
    const mobileMenuClass = classNames({
      [styles.mobileMenu]: true,
      [styles.isOpen]: this.state.isMobileMenuOpen
    });
    return (
      <Grid>
        <div className={styles.wrapper}>
          <div className={styles.logoWrapper}>
            <StackLogo logoStyle="grey" width="auto" height={45} />
          </div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.buttonWrapper}>
            <Button onClick={this.handleSubmitAnswer} className={styles.saveButton}>
              Save & continue later
            </Button>
            <Button onClick={this.showMobileMenu}
              className={styles.mobileToggleMenu}>
              <MdMenu size={40} />
            </Button>
            <div className={mobileMenuClass} onClick={function (e) { e.stopPropagation(); }}>
              <div className={styles.mobileMenuTop}>
                <Button onClick={this.hideMobileMenu}
                  className={styles.mobileToggleMenu}>
                  <MdClose size={40} />
                </Button>
              </div>
              <ul className={styles.navMenu}>
                <li>
                  <a href="javascript:;">
                    Change section
                  </a>
                </li>
                <li>
                  <a href="javascript:;">
                    Footer content
                  </a>
                </li>
                <li>
                  <a href="javascript:;" onClick={this.handleSubmitAnswer}>
                    Save & continue later
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Grid>
    );
  }
}

export default FormHeader;
