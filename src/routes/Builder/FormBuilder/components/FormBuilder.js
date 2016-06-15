import React, { Component, PropTypes } from 'react';
import BuildHeader from 'components/Headers/BuildHeader';
import styles from './FormBuilder.scss'

class FormBuilder extends Component {

  static propTypes = {
    /*
     * Form ID
     */
    id: PropTypes.number.isRequired,

    /*
     * form: form_data of response, consists of questions and logics.
     */
    form: PropTypes.object.isRequired,

    /*
     * isFetching: Redux state that indicates whether the requested form is being fetched from backend
     */
    isFetching: PropTypes.bool.isRequired,

    /*
     * isVerifying: Redux state that indicates the status whether the form is being submitted
     */
    isSubmitting: PropTypes.bool.isRequired,

  };

  componentWillMount() {

  }

  componentWillReceiveProps(props) {

  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <BuildHeader />
        <div className={styles.container}>
          Form Builder Content
        </div>
      </div>
    )
  }
}

export default FormBuilder;
