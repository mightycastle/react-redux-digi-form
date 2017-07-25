import React, {
  Component,
  PropTypes
} from 'react';
import {
  Panel,
  Row,
  Col,
  Collapse
} from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/lib/fa';
import SelectButton from 'components/Buttons/SelectButton';
import Icon from 'components/Icon';
import _ from 'lodash';
import classNames from 'classnames';
import questionInputs, {
  questionInputGroups
} from 'schemas/questionInputs';
import styles from './ElementsListPanel.scss';

export default class ElementsListPanel extends Component {

  static propTypes = {
    /*
     * activeInputName: Redux state to indicate the active input element name.
     */
    activeInputName: PropTypes.string.isRequired,

    /*
     * setActiveInputName: used to set active input element selected, and enables to draw on the right
     */
    setActiveInputName: PropTypes.func.isRequired,

    /*
     * saveElement: Redux action to save the current element being edited.
     */
    saveElement: PropTypes.func.isRequired,

    /*
     * setQuestionEditMode: Redux action to set question edit mode
     */
    setQuestionEditMode: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      panels: {
        0: true   // 0 is the index, true means the panel is opened
      }
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(props) {

  }

  componentDidMount() {

  }

  handleQuestionTypePanelClick = (key) => {
    const { panels } = this.state;
    const newValue = !_.defaultTo(panels[key], false);
    this.setState({
      panels: Object.assign({}, panels, { [key]: newValue })
    });
  }

  handleElementClick(event, inputType) {
    event.stopPropagation();
    const { setQuestionEditMode } = this.props;
    setQuestionEditMode({
      mode: true,
      inputType
    });
  }

  renderPanelContent(elements) {
    const that = this;
    return (
      <Row className={styles.panelRow}>
        {
          elements.map((element, index) => {
            return (
              <Col xs={6} className={styles.panelCol} key={index}>
                <SelectButton
                  className={styles.inputType}
                  label={<span>
                    {element.displayIcon && <Icon name={element.displayIcon}
                      style={{verticalAlign: 'middle', height: '12px', width: '30px'}} />}
                    {element.displayText}
                  </span>}
                  onClick={function (e) { that.handleElementClick(e, element.name); }} />
              </Col>
            );
          })
        }
      </Row>
    );
  }

  render() {
    const that = this;
    var panelItems = questionInputGroups.map((group, index) => {
      const expanded = _.defaultTo(this.state.panels[index], false);
      const headerClass = classNames({
        [styles.panelHeader]: true,
        [styles.expanded]: expanded
      });
      return (
        <div key={index} className={styles.panelWrapper}>
          <div className={headerClass} onClick={function () { that.handleQuestionTypePanelClick(index); }}>
            {group.displayText}
            <span className={styles.headerArrow}><FaChevronDown size={12} /></span>
          </div>
          <Collapse in={expanded}>
            <Panel eventKey={index} className={styles.panel}>
              {that.renderPanelContent(_.filter(questionInputs, {group: group.name}))}
            </Panel>
          </Collapse>
        </div>
      );
    });

    return (
      <div className={styles.elementsListView}>
        <div className={styles.elementsListViewInner}>
          {panelItems}
        </div>
      </div>
    );
  }
}
