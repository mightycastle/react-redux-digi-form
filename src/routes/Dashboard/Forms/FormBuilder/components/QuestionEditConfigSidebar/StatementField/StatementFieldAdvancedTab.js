import React, {
  Component,
  PropTypes
} from 'react';
import EditSection from 'components/QuestionEditFields/EditSection';

class StatementFieldAdvancedTab extends Component {
  static propTypes = {
    currentElement: PropTypes.object.isRequired,
    questions: PropTypes.array.isRequired,
    updateQuestionProp: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <EditSection>
        </EditSection>
      </div>
    );
  }
}

export default StatementFieldAdvancedTab;
