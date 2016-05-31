import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { MdCheck, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/lib/md'
import QuestionInteractive from 'components/Questions/QuestionInteractive/QuestionInteractive'
import FormRow from '../FormRow/FormRow'
import LearnMoreSection from '../LearnMoreSection/LearnMoreSection'
import { findIndexById, getContextFromAnswer, getFirstQuestionOfGroup, 
  animateEnter, animateLeave } from 'helpers/formInteractiveHelper'
import styles from './FormSection.scss'
import _ from 'lodash'

import Animate from 'rc-animate'

class FormSection extends Component {

  static propTypes = {
    primaryColor: PropTypes.string,
    status: PropTypes.oneOf(['pending', 'active', 'completed']),
    step: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    totalSteps: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    allQuestions: PropTypes.array.isRequired,
    questionGroup: PropTypes.object.isRequired,
    logics: PropTypes.array,
    currentQuestionId: PropTypes.number.isRequired,
    answers: PropTypes.array.isRequired,
    prevQuestion: PropTypes.func.isRequired,
    nextQuestion: PropTypes.func.isRequired,
    goToQuestion: PropTypes.func.isRequired,
    storeAnswer: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  static defaultProps = {
    status: 'pending',
    step: 1,
    totalSteps: 1,
    questionGroup: {
      title: 'Basic Details',
      questions: []
    }
  }

  get renderAllQuestions() {
    const { questionGroup: {questions}, currentQuestionId, 
      allQuestions, primaryColor, answers, storeAnswer, nextQuestion } = this.props
    const curQIdx = findIndexById(allQuestions, currentQuestionId)
    const context = getContextFromAnswer(answers)

    if (questions) {
      return questions.map((question, i) => {
        const idx = findIndexById(allQuestions, question.id)
        const answer = _.find(answers, {id: question.id})
        const answerValue = typeof answer === 'object' ? answer.value : ''
        return (
          <QuestionInteractive key={question.id}
            {...question} 
            primaryColor={primaryColor}
            storeAnswer={storeAnswer}
            nextQuestion={nextQuestion}
            context={context}
            value={answerValue}
            status={curQIdx == idx 
              ? 'current' : curQIdx - idx == 1 
              ? 'next' : idx - curQIdx == 1
              ? 'prev' : 'hidden'} 
          />
        )
      })
    } else {
      return false
    }
  }

  shouldShowActiveTitle() {
    const { allQuestions, currentQuestionId, questionGroup } = this.props
    const groupQuestions = questionGroup.questions
    const curQIdx = findIndexById(allQuestions, currentQuestionId)
    const firstGroupIdx = findIndexById(allQuestions, groupQuestions[0].id)
    return (curQIdx == firstGroupIdx)
  }

  get renderActiveSection() {
    const { step, totalSteps, questionGroup, prevQuestion, nextQuestion, primaryColor } = this.props
    const anim = {
      enter: animateEnter,
      leave: animateLeave,
    }

    return (
      <section className={`${styles.formSection} ${styles.active}`}>
        <hr className={styles.hrLine} />
        <FormRow>
          <div className={styles.step}>
            { `${step} of ${totalSteps}` }
          </div>

          <div className={styles.formSectionInner}>
            <Animate exclusive={false} animation={anim} component="div">
              <h3 className={styles.formSectionTitle} key={"formSectionTitle"}>
              { this.shouldShowActiveTitle() && questionGroup.title}
              </h3>
              {this.renderAllQuestions}
            </Animate>
          </div>

          <ul className={styles.navButtonsWrapper}>
            <li>
              <Button className={styles.navButton} onClick={() => prevQuestion()}>
                <MdKeyboardArrowUp size="24" />
              </Button>
            </li>
            <li>
              <Button className={styles.navButton} onClick={() => nextQuestion()}>
                <MdKeyboardArrowDown size="24" />
              </Button>
            </li>
          </ul>
        </FormRow>
        <hr className={styles.hrLine} />
        <FormRow>
          <LearnMoreSection primaryColor={primaryColor} />
        </FormRow>
        { step < totalSteps &&
          <FormRow>
            <h2 className={styles.nextSectionTitle}>Next Sections</h2>
          </FormRow>
        }
      </section>
    )
  }

  get renderPendingSection() {
    const { step, totalSteps, questionGroup } = this.props
    return (
      <section className={`${styles.formSection} ${styles.pending}`}>
        <FormRow>
          <div className={styles.step}>
            { step }
          </div>
          <div className={styles.formSectionInner}>
            <h3 className={styles.formSectionTitle}>{questionGroup.title}</h3>
          </div>
        </FormRow>
      </section>
    )
  }

  get renderCompletedSection() {
    const { step, totalSteps, questionGroup, goToQuestion } = this.props
    const firstQuestionId = getFirstQuestionOfGroup(questionGroup)
    console.log(firstQuestionId)
    return (
      <section className={`${styles.formSection} ${styles.completed}`}>
        <FormRow>
          <div className={styles.step}>
            <a href="javascript:;"><MdCheck className={styles.greenIcon} /></a>
          </div>
          <div className={styles.formSectionInner}>
            <h3 className={styles.formSectionTitle}>
              {questionGroup.title}
              <a href="javascript:;" onClick={() => goToQuestion(firstQuestionId)} 
                className={styles.formSectionEdit}>Edit</a>
            </h3>
          </div>
        </FormRow>
      </section>
    )
  }

  render() {
    const { status } = this.props
    if ( status === 'active' )
      return this.renderActiveSection
    else if ( status === 'pending' )
      return this.renderPendingSection
    else
      return this.renderCompletedSection
  }

}

export default FormSection
