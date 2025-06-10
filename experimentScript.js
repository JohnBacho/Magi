const startBtn = document.getElementById("startBtn");
const StartScreen = document.getElementById("StartScreen");
const circle = document.getElementById("circle");
const screamSound = document.getElementById("screamSound");
const formContainer = document.getElementById("formContainer");

const submitBtn = document.getElementById("submitBtn");
const text = document.getElementById("text");
const submitBtn2 = document.getElementById("submitBtn2");
const instructionPhase = document.getElementById("instructionPhase");
const question = document.getElementById("question");
const submitBtn3 = document.getElementById("submitBtn3"); 
const TestSound = document.getElementById("TestSound");
const formContainer3 = document.getElementById("formContainer3");
const submitBtn4 = document.getElementById("submitBtn4");
const EyeTrackingForm = document.getElementById("EyeTrackingForm");
const EyeTrackingText = document.getElementById("EyeTrackingText");
const Grid = document.getElementById("grid");
let clickEnabled = true;
const SquareColor = window.getComputedStyle(square).backgroundColor;
const FixationPoint = document.getElementById("FixationPoint");



const pattern1 = [
    "red", "#ddd", "#ddd", "#ddd", "blue",
    "#ddd", "green", "#ddd", "yellow", "#ddd",
    "#ddd", "#ddd", "red", "#ddd", "#ddd",
    "#ddd", "green", "#ddd", "yellow", "#ddd",
    "blue", "#ddd", "#ddd", "#ddd", "red"
];

// const pattern1 = [
//   "true", false, false, false, true,
//   false, true, false, true, false,
//   false, false, true, false, false,
//   false, true, false, true, false,
//   true, false, false, false, true
// ];

const pattern2 = [
  true, false, false, false, true,
  true, true, false, true, false,
  false, false, false, false, true,
  false, true, false, true, false,
  true, false, true, false, true
];

const pattern3 = [
  true, false, false, false, true,
  true, true, false, true, false,
  false, false, false, false, true,
  false, true, false, true, false,
  true, false, true, false, true
];


for (let i = 0; i < 25; i++) {
    const square = document.createElement('div');
    square.className = 'square';

    square.addEventListener('click', () => {
        if (!clickEnabled){
          return;
        } 
        square.style.backgroundColor =
          square.style.backgroundColor === "steelblue" ? "#ddd" : "steelblue";
      });


    grid.appendChild(square);
  }

const squares = document.querySelectorAll('.square');



let gazeData = [];
let LookingAtStimulus;

async function startEyeTracking() { // Starts up the eyetracker as well as data collection 
  await webgazer
    .setRegression('weightedRidge')
    .setGazeListener((data, elapsedTime) => {
      if (data) {
        gazeData.push({ // Pushes eyetracking data to array 
          x: data.x,
          y: data.y,
          time: elapsedTime,
          step: currentIndex,
          LookingAtStimulus: LookingAtStimulus
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

function isLookingAtStimulus(data, element) { // checks if user is looking at the stimulus and returns a bool
  const rect = element.getBoundingClientRect();
  return (
    data.x >= rect.left &&
    data.x <= rect.right &&
    data.y >= rect.top &&
    data.y <= rect.bottom
  );
}
let sequence = [pattern1, pattern2, pattern3];
let currentIndex = 0;
let paused = false;
let pauseTime = 0;
let responses = [];
let animationFrame;
let soundPlayed = false;
let formShownTime = 0;
let experimentStartTime;

// Start BTN
startBtn.addEventListener("click", () => {
  StartScreen.style.display = "none"
  toggleClicking(false);
  experimentStartTime = Date.now(); // used to calculate how long the experiment is 
  if(mobileAndTabletCheck()){
    formContainer2.style.display = "block";
  }
  else{
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

document.getElementById("EyeTrackingSubmitBtn").addEventListener("click", () => {
  EyeTrackingText.style.display = "none";
  startEyeTracking();
  startCalibration();
});

// Age BTN
submitBtn2.addEventListener("click", () => {
  const selectedAge = document.querySelector('input[name="age-range"]:checked');
  
  if (selectedAge) {
    responses.push({
      Age: selectedAge.value
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
      const customInput = document.getElementById("self-describe-input").value.trim();
      if (customInput) {
        genderValue = customInput;
      } else {
        alert("Please enter your self-described gender.");
        return;
      }
    }

    responses.push({
      Gender: genderValue
    });

    formContainer3.style.display = "none";
    RunSequence(true);

  } else {
    alert("Please select a gender before continuing.");
  }
});

function RunSequence(Sequential) {
FixationPoint.style.display = "block";
toggleClicking(false);
setTimeout(() => {
    FixationPoint.style.display = "none";
    grid.style.display = "grid";
    UpdatePattern(sequence[currentIndex], Sequential);
    
    setTimeout(() => {
        // Hide pattern
        grid.style.display = "none";
        
        setTimeout(() => {
            // Show response grid
            grid.style.display = "grid";
            formShownTime = performance.now();
            toggleClicking(true);
            RestPattern();
            formContainer.style.display = "flex";
        }, 1000); // 1 second blank interval
        
    }, 3000); // Pattern shows for 3 seconds 
    
}, 1500); // Fixation shows for 1.5 seconds
}

// Submit button
submitBtn.addEventListener("click", () => {
  let total = CalculateTotalScore(sequence[currentIndex]);
  console.log(total);
  RestPattern();
responses.push({
  responseTimeMs: performance.now() - formShownTime,
  Score: total
});
currentIndex++;
grid.style.display = "none";
formContainer.style.display = "none";
RunSequence(false)

});

function UpdatePattern(PatternArray, Sequential) {
  if(!Sequential){
    PatternArray.forEach((value, index) => {
      squares[index].style.backgroundColor = value;
  });
  }
  else{
  let delayCount = 0;
  PatternArray.forEach((value, index) => {
  if(value != "#ddd"){
      setTimeout(() => {
        squares[index].style.backgroundColor = value;
        setTimeout(() => {
          squares[index].style.backgroundColor = ""; 
        }, 300); // Show red for 300ms
      }, delayCount * 250); // Starts next square 250ms after the last
      delayCount++;
  }
    }
  );
  }  
}

function RestPattern() {
squares.forEach(square => {
      square.style.backgroundColor = "#ddd"
    });
}

function CalculateTotalScore(pattern) {
  let score = [];
  let totalscore = 0;

  squares.forEach((square, index) => {
    const color = window.getComputedStyle(square).backgroundColor;
    if (color === 'rgb(70, 130, 180)') {
      score[index] = true;
    } else {
      score[index] = false;
    }
    if (score[index] === pattern[index]) {
      totalscore++;
    }
  });
  return totalscore;
}

function toggleClicking(Set) {
    clickEnabled = Set;
    squares.forEach(square => {
      square.style.cursor = clickEnabled ? 'pointer' : 'not-allowed';
    });
  }
  

function endExperiment() {
  responses.push({
    TotalTime: Date.now() - experimentStartTime,
  });
    const finalPayload = {
    timestamp: new Date().toISOString(),
    responses: responses,
    gaze: gazeData,
    DeviceID: navigator.userAgent,
    ScreenWidth: window.innerWidth,
    ScreenHeight: window.innerHeight
  };

  const responsesInput = document.getElementById("responsesInput");
  responsesInput.value = JSON.stringify(finalPayload);

  document.getElementById("responseForm").submit();

  setTimeout(() => {
    alert("Experiment complete! Thank you for your participation.");
    startBtn.style.display = "block";
    updateDisplay(null);
  }, 100);
}


//eye tracking
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
      const screenX = window.innerWidth * parseFloat(point.x) / 100;
      const screenY = window.innerHeight * parseFloat(point.y) / 100;

      webgazer.recordScreenPosition(screenX, screenY, "click");
      clickCount++;

      if (maxClicksPerPoint != clickCount) {
        let intensity = ((clickCount + 1) * 0.20);
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
window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};