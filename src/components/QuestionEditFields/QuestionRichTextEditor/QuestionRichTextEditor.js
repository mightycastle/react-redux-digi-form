import React, {
  Component,
  PropTypes
} from 'react';
import {
  Button,
  Dropdown,
  MenuItem
} from 'react-bootstrap';
import {
  Modifier,
  Editor,
  EditorState,
  RichUtils,
  Entity,
  CompositeDecorator
} from 'draft-js';
import {
  convertToHTML,
  convertFromHTML
} from 'draft-convert';
import classNames from 'classnames';
import {
  FaChain,
  FaBold,
  FaItalic,
  FaChevronDown
} from 'react-icons/lib/fa';
import _ from 'lodash';
import SectionTitle from '../SectionTitle';
import styles from './QuestionRichTextEditor.scss';

const answersRegex = /\{\{(.*?)\}\}/g;
const findAnswerEntities = (contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = answersRegex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

const AnswerSpan = (props) => {
  return <span {...props} contentEditable={false} className={styles.block}>{props.children}</span>; // eslint-disable-line
};

class QuestionRichTextEditor extends Component {

  static propTypes = {
    value: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    filteredQuestions: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    popoverId: PropTypes.string,
    /*
    / labelStyle
    / major - roble_alt_boldbold, 16px
    / minor - Open Sans, 13px
    */
    labelStyle: PropTypes.oneOf(['major', 'minor']),
    /*
    / answersPullRight
    / align the answers dropdown to the right side of the button
    */
    answersPullRight: PropTypes.bool
  };

  static defaultProps = {
    popoverId: '',
    answersPullRight: false
  };

  constructor(props) {
    super(props);
    const { value } = this.props;
    const answerBlockDecorator = new CompositeDecorator([
      {
        strategy: findAnswerEntities,
        component: AnswerSpan
      }
    ]);
    this.state = {
      editorState: EditorState.createWithContent(
        convertFromHTML(_.defaultTo(value, '')),
        answerBlockDecorator
      )
    };
  }

  componentWillReceiveProps(nextProps) {
  }

  handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  handleInsertHyperLink = () => {
    const { editorState } = this.state;
    console.log(editorState.getCurrentContent().getBlockMap());
  }

  handleValueChange = (editorState) => {
    this.setState({editorState});
    const { setValue } = this.props;
    setValue(convertToHTML(editorState.getCurrentContent()));
  }

  handleAnswerSelect = (value) => {
    const { editorState } = this.state;
    const prevFocusOffset = editorState.getSelection().focusOffset;
    const prevAnchorOffset = editorState.getSelection().anchorOffset;
    const answerEntity = Entity.create('ANSWER_BLOCK', 'IMMUTABLE');
    var newContent = null;
    var nextCursorPos = null;
    if (editorState.getSelection().isCollapsed()) {
      newContent = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(),
        value, null, answerEntity);
      nextCursorPos = editorState.getSelection().merge({
        anchorOffset: prevAnchorOffset + value.length,
        focusOffset: prevFocusOffset + value.length,
        hasFocus: true
      });
    } else {
      newContent = Modifier.replaceText(editorState.getCurrentContent(), editorState.getSelection(),
        value, null, answerEntity);
      nextCursorPos = editorState.getSelection().merge({
        anchorOffset: prevAnchorOffset + value.length,
        focusOffset: prevAnchorOffset + value.length,
        hasFocus: true
      });
    }
    newContent = Modifier.insertText(newContent, nextCursorPos, ' ');
    const newEditorState = EditorState.push(editorState, newContent, 'apply-entity');
    this.setState({
      editorState: newEditorState
    });
  }

  onBoldClick = () => {
    this.handleValueChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }

  onItalicClick = () => {
    this.handleValueChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }

  showOffset = () => {
    const { editorState } = this.state;
    console.log(editorState.getSelection().anchorOffset, editorState.getSelection().focusOffset);
    console.log(editorState.getSelection().anchorKey, editorState.getSelection().focusKey);
  }

  renderToolbar() {
    const { title, labelStyle, popoverId } = this.props;
    return (
      <div className={styles.toolbar}>
        <div className={styles.titleWidget}>
          <SectionTitle title={title} popoverId={popoverId} labelStyle={labelStyle} />
        </div>
        <ul className={styles.buttonsWidget}>
          <li>
            {this.renderAnswerDropdown()}
          </li>
          <li>
            <Button bsSize="xsmall"
              className={styles.squareButton}
              onClick={this.handleInsertHyperLink}>
              <FaChain />
            </Button>
          </li>
          <li>
            <Button bsSize="xsmall"
              className={styles.squareButton}
              onClick={this.onBoldClick}>
              <FaBold />
            </Button>
          </li>
          <li>
            <Button bsSize="xsmall"
              className={styles.squareButton}
              onClick={this.onItalicClick}>
              <FaItalic />
            </Button>
          </li>
        </ul>
      </div>
    );
  }

  renderAnswerDropdown() {
    const { filteredQuestions, answersPullRight } = this.props;
    const buttonClass = classNames({
      [styles.dropdownAnswerButton]: true,
      'btn btn-xs btn-default': true
    });
    return (
      <Dropdown
        id="QRT_AnswersDropdown"
        className={classNames({[styles.answersDropdown]: true, 'pull-right': answersPullRight})}
        onSelect={this.handleAnswerSelect}>
        <Button bsRole="toggle" block
          className={buttonClass}>
          + Answer
          <span className="pull-right">
            <FaChevronDown size={8} />
          </span>
        </Button>
        <Dropdown.Menu>
          {filteredQuestions.length > 0
            ? filteredQuestions.map((item, index) => (
              <MenuItem key={index} eventKey={`{{ answer_${item.value} }}`}>{item.label}</MenuItem>
            ))
            : <MenuItem disabled>No questions available</MenuItem>
          }
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    return (
      <div className={styles.questionRichTextEditor}>
        {this.renderToolbar()}
        <div className={styles.editWidget}>
          <Editor
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.handleValueChange}
            spellCheck />
        </div>
      </div>
    );
  }
}

export default QuestionRichTextEditor;
