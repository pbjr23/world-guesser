import React, { useState } from 'react';
import data from './data.json';
import questionBank from './questionBank.js';
import ReactModal from 'react-modal';


function getName(idx) {
  if (data[idx].type === 'US state') {
    return data[idx].state_name + " (US state)";
  } else {
    return data[idx].country_name;
  }
}

function getNameWithoutLabel(idx) {
  if (data[idx].type === 'US state') {
    return data[idx].state_name;
  } else {
    return data[idx].country_name;
  }
}

function getFlag(idx) {
  return data[idx].flag_code;
}

function formatNumber(num) {
    if (num < 1e6) {
        return parseFloat(Math.round(num)).toLocaleString();
    } else if (num < 1e9) {
        return (num / 1e6).toPrecision(3) + " million";
    } else if (num < 1e12) {
        return (num / 1e9).toPrecision(3) + " billion";
    } else {
        return (num / 1e12).toPrecision(3) + " trillion";
    }
}

function getQuestionSet() {
  return questionBank[Math.floor(Math.random() * questionBank.length)];
}


function TriviaApp() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState(Array(5).fill(null));
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [leftCSS, setLeftCSS] = useState("answer-choice-box");
  const [rightCSS, setRightCSS] = useState("answer-choice-box");
  const [questions, setQuestions] = useState(getQuestionSet());
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


  function getStatusBoxCSS(idx) {
    if (results[idx] === true) {
      return "status-box-correct";
    } else if (results[idx] === false) {
      return "status-box-incorrect";
    } else {
      return "status-box-unanswered";
    }
  }

  function generateAnswerSummary(leftIdx, rightIdx, questionType) {

    let message = results[currentQuestion] ? "Correct! " : "Incorrect! ";
    const largerIdx = questions[currentQuestion][3];
    const smallerIdx = questions[currentQuestion][0] === questions[currentQuestion][3] ? questions[currentQuestion][1] : questions[currentQuestion][0];
    let largerName, smallerName, largerValue, smallerValue, largerDisplayValue, smallerDisplayValue;

    largerName = getNameWithoutLabel(largerIdx);
    smallerName = getNameWithoutLabel(smallerIdx);
    if (questionType === 'GDP') {
      largerValue = data[largerIdx].gdp_nominal_2022;
      largerDisplayValue = "$" + formatNumber(largerValue);
      smallerValue = data[smallerIdx].gdp_nominal_2022;
      smallerDisplayValue = "$" + formatNumber(smallerValue);
    } else if (questionType === 'population') {
      largerValue = data[largerIdx].population;
      largerDisplayValue = formatNumber(largerValue);
      smallerValue = data[smallerIdx].population;
      smallerDisplayValue = formatNumber(smallerValue);
    } else if (questionType === 'area') {
      largerValue = data[largerIdx].type === 'country' ? data[largerIdx].area_sq_km / 2.589988 : data[largerIdx].area_sq_miles;
      largerDisplayValue = formatNumber(largerValue) + " square miles";
      smallerValue = data[smallerIdx].type === 'country' ? data[smallerIdx].area_sq_km / 2.589988 : data[smallerIdx].area_sq_miles;
      smallerDisplayValue = formatNumber(smallerValue) + " square miles";
    }

    const percentDiff = ((largerValue - smallerValue) / smallerValue) * 100;

    message += `${largerName} has ${questionType === "area" ? "an" : "a"} ${questionType} of `;
    message += `${largerDisplayValue}, which is ${parseFloat(Math.round(percentDiff)).toLocaleString()}% larger than `;
    message += `${smallerName}'s ${questionType} of ${smallerDisplayValue}.`;
    return message;
  }

  function getStatisticMessage(idx, questionType, withLabel = false) {
    let message = "";

    if (questionType === 'GDP') {
      message += (withLabel ? "GDP: " : "") + "$" + formatNumber(data[idx].gdp_nominal_2022);
    } else if (questionType === 'population') {
      message += (withLabel ? "Population: " : "") + formatNumber(data[idx].population);
    } else if (questionType === 'area') {
      const areaSqMiles = data[idx].type === 'country' ? data[idx].area_sq_km / 2.589988 : data[idx].area_sq_miles;
      message += (withLabel ? "Area: " : "") + formatNumber(areaSqMiles) + " mi";
    }

    return message;
  }

  function generateDisplayStatisticWithLabel(idx, questionType) {
    const message = getStatisticMessage(idx, questionType, true);
    return (
      <span>
        {message} {questionType === 'area' ? <sup>2</sup> : ''}
      </span>
    );
  }

  function generateDisplayStatistic(idx, questionType) {
    const message = getStatisticMessage(idx, questionType);
    return (
      <span>
        {message} {questionType === 'area' ? <sup>2</sup> : ''}
      </span>
    );
  }

  function generateResultsTable() {
    return (
      <table className="results-table">
        <tbody>
          {results.map((result, idx) => (
            <React.Fragment key={idx+1}>
            <tr className={results[idx] ? "correct" : "incorrect"}>
              <td rowSpan="2">{idx + 1}</td>
              <td colSpan="2" className="centered">Larger {questions[idx][2]}?</td>
            </tr>
            <tr>
              <td width="50%"  className={`${(results[idx] ? (questions[idx][0] === questions[idx][3]) : (questions[idx][0] !== questions[idx][3])) ? "selected" : ""} ${results[idx] ? "correct" : "incorrect"} ${questions[idx][0] === questions[idx][3] ? "correct-answer" : ""}`}>
                <span className={`fi flag-mini fi-${ getFlag(questions[idx][0])  }`}></span>
                {getName(questions[idx][0])}
                <div>
                  {generateDisplayStatistic(questions[idx][0], questions[idx][2])}
                </div>
              </td>
              <td width="50%" className={`${(results[idx] ? (questions[idx][1] === questions[idx][3]) : (questions[idx][1] !== questions[idx][3])) ? "selected" : ""} ${results[idx] ? "correct" : "incorrect"} ${questions[idx][1] === questions[idx][3] ? "correct-answer" : ""} `}>
                <span className={`fi flag-mini fi-${ getFlag(questions[idx][1])  }`}></span>
                {getName(questions[idx][1])}
                <div>
                  {generateDisplayStatistic(questions[idx][1], questions[idx][2])}
                </div>
              </td>
            </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  }

  // Called when the user clicks on an option
  // Determines whether the user chose correct, shows the correct answer,
  // and updates the internal score variables
  const handleAnswerChoiceClick = (userChoice, otherChoice, questionType) => {
    console.log(userChoice, otherChoice, questionType);

    // Check for correctness
    const isCorrect = userChoice === questions[currentQuestion][3];

    // Keep track of correct/incorrect status across questions
    const nextResults = results.map((status, i) => {
      if (i === currentQuestion) {
        // Update the status for the current question
        return isCorrect ? true : false;
      } else {
        // The rest don't change
        return status;
      }
    });
    setResults(nextResults);

    // Show the correct answer
    const isLeftElement = userChoice === questions[currentQuestion][0];
    if (isLeftElement) {
      setLeftCSS(isCorrect ? "green-correct-choice" : "red-incorrect-choice");
      setRightCSS("answer-choice-box-fixed");
    } else {
      setRightCSS(isCorrect ? "green-correct-choice" : "red-incorrect-choice");
      setLeftCSS("answer-choice-box-fixed");
    }
    setIsAnswerVisible(true);
  };

  const handleNextQuestionClick = () => {
    setIsAnswerVisible(false);
    // Move to the next question
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowFinishScreen(true);
    }
    setLeftCSS("answer-choice-box");
    setRightCSS("answer-choice-box");
  };

  const handlePlayAgainClick = () => {
    const newQuestions = getQuestionSet();

    setShowFinishScreen(false);
    setQuestions(newQuestions);
    setResults(Array(5).fill(null));
    setIsAnswerVisible(false);
    setLeftCSS("answer-choice-box");
    setRightCSS("answer-choice-box");
    setCurrentQuestion(0);
  };

  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };


  const leftIdx = questions[currentQuestion][0];
  const rightIdx = questions[currentQuestion][1];
  const currQuestionType = questions[currentQuestion][2];

  return (
    <div className="game">
      <div className="title">
        <h1>World Trivia</h1>
        <hr />
      </div>
      <div className="game-info">
        <div className="question-count">
          {showFinishScreen ? (
              <div>Results</div>
            ) : (
              <div>
                <span>Question</span> {1 + currentQuestion} / {questions.length}
              </div>
          )}
        </div>
        <div className="status-boxes">
          <div className={`status-box ${ getStatusBoxCSS(0) }`}></div>
          <div className={`status-box ${ getStatusBoxCSS(1) }`}></div>
          <div className={`status-box ${ getStatusBoxCSS(2) }`}></div>
          <div className={`status-box ${ getStatusBoxCSS(3) }`}></div>
          <div className={`status-box ${ getStatusBoxCSS(4) }`}></div>
        </div>
        <div className="game-configuration">
          <i className="fa-solid fa-circle-question info-icon" onClick={handleOpenInfoModal}></i>
          <ReactModal
            isOpen={isInfoModalOpen}
            contentLabel="Info"
            onRequestClose={handleCloseInfoModal}
            className="info-modal"
            ariaHideApp={false}
          >
              <i className="fa-solid fa-x info-modal-close-icon" onClick={handleCloseInfoModal}></i>
              <div className="info-modal-header">
                <h2>Game Information</h2>
              </div>
              <div className="info-modal-content">
                <p>This trivia game asks you to compare various attributes of two locations (either a country or a US state). There are three different categories of questions:</p>
                <h4>GDP</h4>
                <p>This will ask you to choose the location with the higher nominal GDP. These values are from 2022 and are sourced from the World Economic Database and the US Bureau of Economic Analysis.</p>
                <h4>Population</h4>
                <p>This will ask you to choose the location with the larger population. This data comes from the United Nations and the US Census and is based on 2022 values and estimates.</p>
                <h4>Area</h4>
                <p>This will ask you to choose the location with the larger area. This includes land and water area for a location and is sourced from CIA World Factbook.</p>
            </div>
          </ReactModal>
        </div>
      </div>
      {showFinishScreen ? (
        <div className="finish-screen">
          <div className="finish-label">
            Score: {results.filter(value => value === true).length} out of {questions.length}
          </div>
          {generateResultsTable()}
          <button className="next-question-button" onClick={handlePlayAgainClick}>Play Again!</button>
        </div>
      ) : (
        <div className="question-section">
          <div className="question-text">Which has a larger {currQuestionType}?</div>
          <div className="answer-section">
            <div className={leftCSS} onClick={() => !isAnswerVisible ? handleAnswerChoiceClick(leftIdx, rightIdx, currQuestionType) : null }>
              <span className={`fi flag fi-${ getFlag(leftIdx)  }`}></span>
              {getName(leftIdx)}
              {isAnswerVisible && <div>
                <hr />
                <div className="correct-answer-details">{generateDisplayStatisticWithLabel(leftIdx, currQuestionType)}</div>
              </div>}
            </div>
            <div className={rightCSS} onClick={() => !isAnswerVisible ? handleAnswerChoiceClick(rightIdx, leftIdx, currQuestionType) : null }>
              <span className={`fi flag fi-${ getFlag(rightIdx) } `}></span>
              {getName(rightIdx)}
              {isAnswerVisible && <div>
                <hr />
                <div className="correct-answer-details">{generateDisplayStatisticWithLabel(rightIdx, currQuestionType)}</div>
              </div>}
            </div>
          </div>
          {isAnswerVisible && <div className={`correct-answer-summary ${results[currentQuestion] ? "answer-summary-green" : "answer-summary-red"}`}>
              {generateAnswerSummary(leftIdx, rightIdx, currQuestionType)}
              <button className="next-question-button" onClick={handleNextQuestionClick}>Next Question</button>
          </div>}
        </div>
      )}
    </div>
  )
};

export default TriviaApp;
