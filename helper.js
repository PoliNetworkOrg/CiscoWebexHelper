var debug = false;
var platform = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function muteAndUnmute() {
    try {
        try { $("#screen").simulate("drag-n-drop", {dx: 1}); } catch (e) { if (debug) { console.warn(e); }};

        setTimeout(function () {
            try { document.getElementById("soundVolume").click();	} catch (e) {};
        }, 20)
    } catch (e) {}
}

async function injectHelper() {
    await sleep(2000);
    myVideoHelper = null;
    i = 0;
    while (myVideoHelper == null && i < 50) {
        console.log("Try to get the video attemp ", i)
        await sleep(2000)
        myVideoHelper = document.getElementById("screen_html5_api")
        if(myVideoHelper == null) {
          try {
            myVideoHelper = document.getElementsByClassName("od-VideoCanvas-video")[0]; // try the new sharepoint player
            platform = 1;
          } catch (ignore) {}
        }
        i++;
    }
    if (myVideoHelper == null) {
        console.log("Injecting failed")
        return
    }
    console.log("We get the video");
    console.log("Adding the listeners");
    document.addEventListener("keydown", function (event) {
        event.preventDefault();
        const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
        if(platform == 0){ //old player
          switch (key) { // change to event.key to key to use the above variable
              case "ArrowLeft":
                  // Left pressed
                  updateSteps("SX");
                  break;
              case "ArrowRight":
                  // Right pressed
                  updateSteps("DX");
                  break;
              case "ArrowUp":
                  // Up pressed
                  updateSpeed("FASTER");
                  break;
              case "ArrowDown":
                  // Down pressed
                  updateSpeed("SLOWER");
                  break;
              case "m":
                  // Down pressed
                  muteAndUnmute();
                  break;
              case " ":
                  document.getElementById("playOrPause").click();
                  break;
          }
        }
        else { //new player
          switch (key) { // change to event.key to key to use the above variable
            case "ArrowLeft":
                // Left pressed
                myVideoHelper.currentTime = myVideoHelper.currentTime - 15;
                break;
            case "ArrowRight":
                // Right pressed
                myVideoHelper.currentTime = myVideoHelper.currentTime + 15;
                break;
            case "ArrowUp":
                // Up pressed
                myVideoHelper.playbackRate = myVideoHelper.playbackRate + 0.1;
                console.log(myVideoHelper.playbackRate)
                break;
            case "ArrowDown":
                // Down pressed
                myVideoHelper.playbackRate = myVideoHelper.playbackRate - 0.1;
                console.log(myVideoHelper.playbackRate);
                break;
              }
        }
    });

    console.log("Finished.")
}

// Author Saman Fekri
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

injectHelper();

if (window.location.href.includes(".webex.com") || window.location.href.includes("polimi365.sharepoint.com/sites/recordings")) {
    basebar = false;
    var step = 10;
    var sliderBTNw = false;

    function updateSteps(desired = "DX") {
      console.log("updateSteps")
        if (!basebar) {
            try {
              if(platform == 0){
                basebar = document.getElementById("baseBar");
                sliderBTNw = document.getElementsByClassName("el-slider__button-wrapper")[0];
              } else {
                basebar = document.getElementsByClassName("od-ScrubBar")[0];
                sliderBTNw = document.getElementsByClassName("od-ScrubBar-thumb")[0];
              }
            } catch (e) {
                console.warn("0", e);
            }
        }
        try {
            try {
                $("#screen").simulate("drag-n-drop", {dx: 1});
            } catch (e) {
                if (debug) {
                    console.warn(e);
                }
            }
            ;
            setTimeout(function () {
                const timePieces = document.getElementById("timeIndicator").innerHTML.split("&nbsp;/&nbsp;")[1].split(":");
                let maxSeconds = 1;
                if (timePieces.length === 1) {
                    maxSeconds = parseInt(timePieces[0]);
                } else if (timePieces.length === 2) {
                    maxSeconds = parseInt(timePieces[0]) * 60 + parseInt(timePieces[1]);
                } else if (timePieces.length === 3) {
                    maxSeconds = parseInt(timePieces[0]) * 3600 + parseInt(timePieces[1]) * 60 + parseInt(timePieces[2]);
                }
                const dx = basebar.getBoundingClientRect().width * (step / maxSeconds);
                setTimeout(function () {
                    $(sliderBTNw).simulate("drag-n-drop", {dx: (desired === "DX") ? dx : -dx});
                }, 20);
            }, 20)
        } catch (e) {
            console.warn("1", e);
        }
    }

    let cumulativeVolumeChange = 0;
    function updateSpeed(speed = "FASTER") {
        try {
            cumulativeVolumeChange += 1;
            try { $("#screen").simulate("drag-n-drop", {dx: 1}); } catch (e) { if (debug) { console.warn(e); }};

            setTimeout(function () {
                if(cumulativeVolumeChange <= 1) {
                    if(document.getElementById("settingPopoverID").style.display == "none") {
                        try { document.getElementById("playerSetting").click();	} catch (e) {};
                    }

                }

                setTimeout(function () {
                    let playbackRate = myVideoHelper.playbackRate;
                    try {
                        if (speed === "FASTER" && playbackRate < 4.9) {
                            playbackRate += 0.1;
                        } else if (speed === "SLOWER" && playbackRate > 0.1) {
                            playbackRate -= 0.1;
                        }
                        myVideoHelper.playbackRate = playbackRate;
                    } catch (e) {}
                    document.getElementsByClassName("speedValue")[0].innerHTML = round(myVideoHelper.playbackRate, 1) + "x";

                    setTimeout(function () {
                        cumulativeVolumeChange -= 1;
                        if(cumulativeVolumeChange <= 0) {
                            try { document.getElementById("playerSetting").click();	} catch (e) {};
                        }
                    }, 1000);
                } , 60);
            }, 20)
        } catch (e) {}
    }
}
