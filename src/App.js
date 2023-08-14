// src/App.js

import React, { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import data from './data.json';


function getName(idx) {
  if (data[idx].type === 'US state') {
    return data[idx].state_name + " (US state)";
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


function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState(Array(5).fill(null));
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [leftCSS, setLeftCSS] = useState("answer-choice-box");
  const [rightCSS, setRightCSS] = useState("answer-choice-box");


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    world_game_delay: 4,
    world_game_units: 'miles'
  });

  useEffect(() => {
    // Load settings from cookies on component mount
    console.log(document.cookie);
    const delay = document.cookie.split('; ').find(row => row.startsWith('world_game_delay='))?.split('=')[1];
    const unit = document.cookie.split('; ').find(row => row.startsWith('world_game_units='))?.split('=')[1];

    if (delay && unit) {
      setSettings({ delay, unit });
    }
  }, []);

  const onSettingChange = (key, value) => {
    setSettings(prevSettings => ({ ...prevSettings, [key]: value }));
    document.cookie = `${key}=${value}; max-age=31536000`; // Cookie lasts for a year
  };

  // const questions = [
  //   [24, 87, 'population', 87],
  //   [137, 300, 'GDP', 300],
  //   [81, 3, 'population', 81],
  //   [259, 35, 'area', 259],
  //   [229, 0, 'population', 0],
  // ];

  const questions = [[220, 216, 'population', 220],
 [219, 67, 'population', 67],
 [262, 79, 'population', 79],
 [208, 40, 'population', 40],
 [165, 84, 'GDP', 84]];

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

    let message = results[currentQuestion] ? "Correct! " : "Incorrect - ";
    const largerIdx = questions[currentQuestion][3];
    const smallerIdx = questions[currentQuestion][0] === questions[currentQuestion][3] ? questions[currentQuestion][1] : questions[currentQuestion][0];
    let largerName, smallerName, largerValue, smallerValue, largerDisplayValue, smallerDisplayValue;

    largerName = getName(largerIdx);
    smallerName = getName(smallerIdx);
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
      const largerValue = data[largerIdx].type === 'country' ? data[largerIdx].area_sq_km / 2.589988 : data[largerIdx].area_sq_miles;
      largerDisplayValue = formatNumber(largerValue) + " square miles";
      const smallerValue = data[smallerIdx].type === 'country' ? data[smallerIdx].area_sq_km / 2.589988 : data[smallerIdx].area_sq_miles;
      smallerDisplayValue = formatNumber(smallerValue) + " square miles";
    }

    const percentDiff = ((largerValue - smallerValue) / smallerValue) * 100;

    message += `${largerName} has ${questionType === "area" ? "an" : "a"} ${questionType} of `;
    message += `${largerDisplayValue}, which is ${parseFloat(Math.round(percentDiff)).toLocaleString()}% larger than `;
    message += `${smallerName}'s ${questionType} of ${smallerDisplayValue}`;
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
            <tr key={idx + 1} className={results[idx] ? "correct" : "incorrect"}>
              <td>{idx + 1}</td>
              <td>Larger {questions[idx][2]}?</td>
              <td className={(results[idx] ? (questions[idx][0] === questions[idx][3]) : (questions[idx][0] !== questions[idx][3])) ? "selected" : ""}>
                <span className={`fi flag-mini fi-${ getFlag(questions[idx][0])  }`}></span>
                {getName(questions[idx][0])}
                <div>
                  {generateDisplayStatistic(questions[idx][0], questions[idx][2])}
                </div>
              </td>
              <td className={(results[idx] ? (questions[idx][1] === questions[idx][3]) : (questions[idx][1] !== questions[idx][3])) ? "selected" : ""}>
                <span className={`fi flag-mini fi-${ getFlag(questions[idx][1])  }`}></span>
                {getName(questions[idx][1])}
                <div>
                  {generateDisplayStatistic(questions[idx][1], questions[idx][2])}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Called when the user clicks on an option
  // Determines whether the user chose correct, shows the correct answer,
  // updates the internal score variables, and moves to the next question
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

    // After 4 seconds, reset the correct answer display and move to the next question
    setTimeout(() => {
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
    }, 2000);

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
              <div>Quiz Complete</div>
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
          <i className="fa-solid fa-gear settings-icon" onClick={() => setIsModalOpen(true)}></i>
          <SettingsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            settings={settings}
            onSettingChange={onSettingChange}
          />
        </div>
      </div>
      {showFinishScreen ? (
        <div className="finish-screen">
          <div className="finish-label">
            Score: {results.filter(value => value === true).length} out of {questions.length}
          </div>
          {generateResultsTable()}
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
          </div>}
        </div>
      )}
    </div>
  )
};

export default App;
