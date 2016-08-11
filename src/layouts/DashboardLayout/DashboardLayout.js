import React, {
  Component,
  PropTypes
} from 'react';
import { Grid } from 'react-bootstrap';
import BuilderHeader from 'components/Headers/BuilderHeader';
import DashboardTabs from 'containers/DashboardTabs/DashboardTabs';
import styles from './DashboardLayout.scss';

class DashboardLayout extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    location: PropTypes.object
  };

  render() {
    const {
      children,
      location
    } = this.props;
    return (
      <div className={styles.dashboard}>
        <BuilderHeader />
        <DashboardTabs location={location} />
        <div className={styles.contentWrapper}>
          <Grid fluid>
            {children}
          </Grid>
        </div>
      </div>
    );
  }
}

export default DashboardLayout;
