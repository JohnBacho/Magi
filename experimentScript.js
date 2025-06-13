const startBtn = document.getElementById("startBtn");
const StartScreen = document.getElementById("StartScreen");
const formContainer = document.getElementById("formContainer");
const submitBtn = document.getElementById("submitBtn");
const submitBtn2 = document.getElementById("submitBtn2");
const submitBtn3 = document.getElementById("submitBtn3");
const formContainer3 = document.getElementById("formContainer3");
const submitBtn4 = document.getElementById("submitBtn4");
const submitBtn5 = document.getElementById("submitBtn5");
const EyeTrackingForm = document.getElementById("EyeTrackingForm");
const EyeTrackingText = document.getElementById("EyeTrackingText");
const Grid = document.getElementById("grid");
const SquareColor = window.getComputedStyle(square).backgroundColor;
const FixationPoint = document.getElementById("FixationPoint");
const ColorOptions = document.getElementsByClassName("color-option");
const ColorPalette = document.getElementById("color-palette");
const slider = document.getElementById("ConfidenceSlider");
const formContainer4 = document.getElementById("formContainer4");
const CloseBtn = document.getElementById("CloseBtn");
const container = document.getElementById("container");

const RedButton = document.getElementById("red");
const BlueButton = document.getElementById("blue");
const GreenButton = document.getElementById("green");
const YellowButton = document.getElementById("yellow");

let clickEnabled = true;
let responseTimeMs = null;
let responseFormShowTime = null;
let squareClickLog = [];
let CurrentColor = "red";
let mouseData = [];
let clickData = [];
let gazeData = [];
let LookingAtStimulus;

const pattern1 = [
  "#ddd",
  "#ddd",
  "blue",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "green",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "yellow",
  "#ddd",
  "#ddd",
  "#ddd",
  "red",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
];

const pattern2 = [
  "#ddd",
  "green",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "blue",
  "#ddd",
  "#ddd",
  "#ddd",
  "red",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "yellow",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
];

const pattern3 = [
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "red",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "yellow",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "blue",
  "#ddd",
  "#ddd",
  "#ddd",
  "green",
  "#ddd",
];

const pattern4 = [
  "#ddd",
  "#ddd",
  "green",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "yellow",
  "#ddd",
  "#ddd",
  "#ddd",
  "red",
  "#ddd",
  "#ddd",
  "#ddd",
  "blue",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
];

const pattern5 = [
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "yellow",
  "#ddd",
  "#ddd",
  "#ddd",
  "red",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "#ddd",
  "green",
  "blue",
];

// These two need to be the same length
let sequence = [pattern1, pattern2, pattern3, pattern4, pattern5];
const SequentialBoolArray = [true, false, true, true, false];

const buttons = [RedButton, BlueButton, GreenButton, YellowButton];

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    CurrentColor = button.id;

    buttons.forEach((btn) => btn.classList.remove("big"));
    button.classList.add("big");
  });
});

function resetColorSelection() {
  CurrentColor = "red";
  buttons.forEach((btn) => btn.classList.remove("big"));
  document.getElementById("red").classList.add("big");
}

for (let i = 0; i < 25; i++) {
  const square = document.createElement("div");
  square.className = "square";
  square.dataset.index = i;

  square.addEventListener("click", () => {
    if (!clickEnabled) return;

    const previousColor = square.style.backgroundColor;
    const newColor = previousColor === CurrentColor ? "#ddd" : CurrentColor;
    square.style.backgroundColor = newColor;

    squareClickLog.push({
      index: i,
      color: newColor,
      step: currentIndex,
      time: performance.now(),
    });
  });

  grid.appendChild(square);
}

const squares = document.querySelectorAll(".square");
const getCurrentStep = () => currentIndex;

trackMouse(mouseData, getCurrentStep);
trackClicks(clickData, getCurrentStep);

function trackMouse(mouseArray, getStep) {
  document.addEventListener("mousemove", function (event) {
    mouseArray.push({
      x: event.clientX,
      y: event.clientY,
      step: getStep(),
      time: performance.now(),
    });
  });
}

function trackClicks(clickArray, getStep) {
  document.addEventListener("click", function (event) {
    clickArray.push({
      x: event.clientX,
      y: event.clientY,
      step: getStep(),
      time: performance.now(),
    });
  });
}

async function startEyeTracking() {
  // Starts up the eyetracker as well as data collection
  await webgazer
    .setRegression("weightedRidge")
    .setGazeListener((data, elapsedTime) => {
      if (data) {
        gazeData.push({
          // Pushes eyetracking data to array
          x: data.x,
          y: data.y,
          time: elapsedTime,
          step: currentIndex,
          LookingAtStimulus: LookingAtStimulus,
        });
      }
    })
    .saveDataAcrossSessions(false)
    .begin();

  webgazer
    .showVideoPreview(true) // shows video of the camera in the corner
    .showPredictionPoints(true) // red circle is shown where the user is looking
    .applyKalmanFilter(true); // smooths out jitter
}

function isLookingAtStimulus(data, element) {
  // checks if user is looking at the stimulus and returns a bool
  const rect = element.getBoundingClientRect();
  return (
    data.x >= rect.left &&
    data.x <= rect.right &&
    data.y >= rect.top &&
    data.y <= rect.bottom
  );
}
let currentIndex = -1;
let paused = false;
let pauseTime = 0;
let responses = [];
let memoryTrialData = [];
let animationFrame;
let soundPlayed = false;
let formShownTime = 0;
let experimentStartTime;

// Start BTN
startBtn.addEventListener("click", () => {
  StartScreen.style.display = "none";
  toggleClicking(false);
  experimentStartTime = Date.now(); // used to calculate how long the experiment is
  if (mobileAndTabletCheck()) {
    formContainer2.style.display = "block";
  } else {
    EyeTrackingForm.style.display = "block";
  }
});

// if user selects Yes start calibration
document.getElementById("YesEyeTracking").addEventListener("click", () => {
  EyeTrackingForm.style.display = "none";
  EyeTrackingText.style.display = "block";
});

// if user selects no skips eye tracking
document.getElementById("NoEyeTracking").addEventListener("click", () => {
  EyeTrackingForm.style.display = "none";
  formContainer2.style.display = "block";
});

document
  .getElementById("EyeTrackingSubmitBtn")
  .addEventListener("click", () => {
    EyeTrackingText.style.display = "none";
    startEyeTracking();
    startCalibration();
  });

// Age BTN
submitBtn2.addEventListener("click", () => {
  const selectedAge = document.querySelector('input[name="age-range"]:checked');

  if (selectedAge) {
    responses.push({
      Age: selectedAge.value,
    });

    formContainer2.style.display = "none";
    formContainer3.style.display = "block";
  } else {
    alert("Please select an age range before continuing.");
  }
});

// Select Gender
submitBtn4.addEventListener("click", () => {
  const selectedGender = document.querySelector('input[name="gender"]:checked');

  if (selectedGender) {
    let genderValue = selectedGender.value;

    if (genderValue === "self-describe") {
      const customInput = document
        .getElementById("self-describe-input")
        .value.trim();
      if (customInput) {
        genderValue = customInput;
      } else {
        alert("Please enter your self-described gender.");
        return;
      }
    }

    responses.push({
      Gender: genderValue,
    });

    formContainer3.style.display = "none";
    resetColorSelection();
    currentIndex = 0;
    RunSequence();
  } else {
    alert("Please select a gender before continuing.");
  }
});

function RunSequence() {
  FixationPoint.style.display = "block";
  toggleClicking(false);
  setTimeout(() => {
    FixationPoint.style.display = "none";
    container.style.display = "flex";
    grid.style.display = "grid";
    UpdatePattern(sequence[currentIndex], SequentialBoolArray[currentIndex]);

    setTimeout(() => {
      // Hide pattern
      grid.style.display = "none";

      setTimeout(() => {
        // Show response grid
        document.getElementById("container").classList.add("center");
        grid.style.display = "grid";
        formShownTime = performance.now();
        for (let i = 0; i < ColorOptions.length; i++) {
          ColorOptions[i].style.display = "inline-block";
        }
        ColorPalette.style.display = "flex";
        toggleClicking(true);
        RestPattern();
        formContainer.style.display = "flex";
      }, 1000); // 1 second blank interval
    }, 3000); // Pattern shows for 3 seconds
  }, 1500); // Fixation shows for 1.5 seconds
}

// Submit button
submitBtn.addEventListener("click", () => {
  grid.style.display = "none";
  document.getElementById("container").classList.remove("center");
  container.style.display = "none";
  ColorPalette.style.display = "none";
  formContainer.style.display = "none";
  formContainer4.style.display = "block";
  responseTimeMs = performance.now() - formShownTime;
  responseFormShowTime = performance.now();
});

//confidance button
submitBtn5.addEventListener("click", () => {
  formContainer4.style.display = "none";
  const result = CalculateTotalScore(sequence[currentIndex]);
  RestPattern();
  memoryTrialData.push({
    responseTimeMs: responseTimeMs,
    formResponseTimeMs: performance.now() - responseFormShowTime,
    confidenceRating: slider.value,
    score: result.total,
    accuracy: result.total / 25,
    guessType: result.guessType,
    userSelected: result.userSelected,
    correctInPattern: result.correctInPattern,
    cubes: result.scoreArray,
  });
  currentIndex++;
  resetColorSelection();
  slider.value = 0;
  sliderValue.textContent = "0";

  if (currentIndex >= sequence.length) {
    endExperiment();
  } else {
    RunSequence();
  }
});

function UpdatePattern(PatternArray, Sequential) {
  if (!Sequential) {
    PatternArray.forEach((value, index) => {
      squares[index].style.backgroundColor = value;
    });
  } else {
    let delayCount = 0;
    PatternArray.forEach((value, index) => {
      if (value != "#ddd") {
        setTimeout(() => {
          squares[index].style.backgroundColor = value;
          setTimeout(() => {
            squares[index].style.backgroundColor = "";
          }, 500); // Show red for 300ms
        }, delayCount * 500); // Starts next square 250ms after the last
        delayCount++;
      }
    });
  }
}

// rests the squares back to default color
function RestPattern() {
  squares.forEach((square) => {
    square.style.backgroundColor = "#ddd";
  });
}

// converts rgb value to a name so that it can be compared in CalculateTotalScore
function rgbToName(rgb) {
  const map = {
    "rgb(255, 0, 0)": "red",
    "rgb(0, 128, 0)": "green",
    "rgb(0, 0, 255)": "blue",
    "rgb(255, 255, 0)": "yellow",
    "rgb(221, 221, 221)": "grey",
  };
  return map[rgb];
}

// computes score as well as if the user over or under estimated
function CalculateTotalScore(pattern) {
  let score = [];
  let totalscore = 0;
  let userSelected = 0;
  let correctInPattern = 0;

  squares.forEach((square, index) => {
    const color = window.getComputedStyle(square).backgroundColor;
    const squareColorName = rgbToName(color);

    if (squareColorName !== "grey") {
      userSelected++;
    }

    if (pattern[index] !== "#ddd") {
      correctInPattern++;
    }

    if (
      squareColorName === pattern[index] ||
      (squareColorName === "grey" && pattern[index] == "#ddd")
    ) {
      score[index] = true;
      totalscore++;
    } else {
      score[index] = false;
    }
  });

  let guessType = "accurate";
  if (userSelected > correctInPattern) {
    guessType = "over";
  } else if (userSelected < correctInPattern) {
    guessType = "under";
  }

  return {
    total: totalscore,
    scoreArray: score,
    guessType: guessType,
    userSelected: userSelected,
    correctInPattern: correctInPattern,
  };
}

// used to ensure user can't click on squares
function toggleClicking(Set) {
  clickEnabled = Set;
  squares.forEach((square) => {
    square.style.cursor = clickEnabled ? "pointer" : "not-allowed";
  });
}

// used for the confidence form
const sliderValue = document.getElementById("sliderValue");
slider.addEventListener("input", () => {
  sliderValue.textContent = slider.value;
});

// Package Up final payload
function endExperiment() {
  const finalPayload = {
    timestamp: new Date().toISOString(),
    totalTrialTimeMs: Date.now() - experimentStartTime,
    responses,
    memoryTrialData,
    gazeData,
    mouseData,
    clickData,
    squareClickLog,
    deviceID: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };

  document.getElementById("uploadingData").style.display = "flex";

  CloseBtn.addEventListener("click", () => {
    window.close();
  });

  // Backend -------------
  fetch("https://backend-y401.onrender.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalPayload),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("uploadingData").style.display = "none";
      console.log("Success:", data);
      document.getElementById("success-message").style.display = "flex";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to submit experiment data.");
    });
}

//eye tracking -------------
const calibrationPoints = [
  { x: "25%", y: "5%" },
  { x: "50%", y: "5%" },
  { x: "97%", y: "5%" },
  { x: "3%", y: "50%" },
  { x: "50%", y: "50%" },
  { x: "97%", y: "50%" },
  { x: "3%", y: "95%" },
  { x: "50%", y: "95%" },
  { x: "97%", y: "95%" },
];

let currentPoint = 0;
let clickCount = 0;
const maxClicksPerPoint = 5;

function startCalibration() {
  const container = document.getElementById("calibrationContainer");
  container.innerHTML = "";
  currentPoint = 0;
  clickCount = 0;
  showNextCalibrationPoint();
}

function showNextCalibrationPoint() {
  const container = document.getElementById("calibrationContainer");
  container.innerHTML = "";

  if (currentPoint >= calibrationPoints.length) {
    console.log("Calibration complete!");
    webgazer.showVideoPreview(false);
    formContainer2.style.display = "block";
    return;
  }

  clickCount = 0;

  const point = calibrationPoints[currentPoint];
  const dot = document.createElement("div");
  dot.classList.add("calibration-dot");

  dot.style.left = `calc(${point.x} - 10px)`;
  dot.style.top = `calc(${point.y} - 10px)`;
  dot.style.position = "absolute";

  container.appendChild(dot);

  dot.addEventListener("click", async () => {
    const feedback = document.createElement("div");
    feedback.classList.add("calibration-feedback");
    feedback.style.position = "absolute";
    feedback.style.top = "10px";
    feedback.style.left = "10px";
    feedback.style.color = "red";

    const prediction = await webgazer.getCurrentPrediction();
    if (prediction) {
      const screenX = (window.innerWidth * parseFloat(point.x)) / 100;
      const screenY = (window.innerHeight * parseFloat(point.y)) / 100;

      webgazer.recordScreenPosition(screenX, screenY, "click");
      clickCount++;

      if (maxClicksPerPoint != clickCount) {
        let intensity = (clickCount + 1) * 0.2;
        dot.style.opacity = intensity;
      } else {
        let green = Math.min(255, Math.floor((clickCount - 0.5) * 2 * 255));
        dot.style.backgroundColor = `rgba(255, ${green}, 0, 1)`;
      }

      if (clickCount >= maxClicksPerPoint) {
        container.removeChild(dot);
        currentPoint++;
        setTimeout(showNextCalibrationPoint, 400);
      }
    } else {
      feedback.textContent = "No gaze detected — please try again.";
      container.appendChild(feedback);
      setTimeout(() => feedback.remove(), 1500);
    }
  });
}

// checks if the device is mobile or tablet
window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
