const API_BASE = "/api";

async function apiRequest(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        options
    );

    if (!response.ok) {

        throw new Error(
            `API error: ${response.status}`
        );
    }

    return response.json();
}async function loadDriver(driverId) {

    try {

        const driver =
            await apiRequest(
                `/drivers/${driverId}`
            );

        const name =
            document.getElementById(
                "driverName"
            );

        if (name) {
            name.textContent =
                driver.name;
        }

        const number =
            document.querySelector(
                ".driver-number"
            );

        if (number) {
            number.textContent =
                driver.number;
        }

    } catch (error) {

        console.error(
            "Driver loading failed:",
            error
        );
    }
}


const driverSelect =
    document.getElementById(
        "driverSelect"
    );

if (driverSelect) {

    driverSelect.addEventListener(
        "change",
        () => {

            loadDriver(
                driverSelect.value
            );

        }
    );

    loadDriver(
        driverSelect.value
    );
}async function sendLiveAnalysis(level) {

    try {

        const result =
            await apiRequest(
                "/audio/live",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        level: level
                    })
                }
            );

        updateDriverMetrics(
            result
        );

    } catch (error) {

        console.error(
            "Live analysis failed:",
            error
        );
    }
}


function updateDriverMetrics(data) {

    const mappings = {

        stress: "mStress",

        fatigue: "mFatigue",

        voice_instability:
            "mTremor",

        cognitive_load:
            "mCogLoad",

        performance_risk:
            "mRisk"

    };


    Object.entries(
        mappings
    ).forEach(
        ([key, elementId]) => {

            const element =
                document.getElementById(
                    elementId
                );

            if (element) {

                element.textContent =
                    data[key] + "%";

            }

        }
    );


    const stress =
        document.getElementById(
            "stressIndex"
        );

    if (stress) {

        stress.textContent =
            data.stress;
    }


    const label =
        document.getElementById(
            "stressLabel"
        );

    if (label) {

        label.textContent =
            data.stress < 35
                ? "CALM"
                : data.stress < 65
                    ? "MODERATE"
                    : "HIGH STRESS";
    }
}setInterval(() => {

    const level =
        window.getAudioLevel();

    if (
        window.liveAudioRunning
    ) {

        sendLiveAnalysis(
            level
        );

    }

}, 2000);const fileInput =
    document.getElementById(
        "fileInput"
    );

const analyzeBtn =
    document.getElementById(
        "analyzeBtn"
    );

const audioPlayer =
    document.getElementById(
        "audioPlayer"
    );

const fileInfo =
    document.getElementById(
        "fileInfo"
    );


let selectedAudio = null;


if (fileInput) {

    fileInput.addEventListener(
        "change",
        () => {

            const file =
                fileInput.files[0];

            if (!file) return;

            selectedAudio =
                file;

            const url =
                URL.createObjectURL(
                    file
                );

            if (audioPlayer) {

                audioPlayer.src =
                    url;

                audioPlayer.hidden =
                    false;

            }


            if (fileInfo) {

                fileInfo.textContent =
                    `${file.name} • ${(
                        file.size / 1024
                    ).toFixed(1)} KB`;

            }


            if (analyzeBtn) {

                analyzeBtn.disabled =
                    false;

            }

        }
    );
}if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        async () => {

            if (!selectedAudio) return;


            analyzeBtn.disabled =
                true;

            analyzeBtn.textContent =
                "ANALYSING...";


            try {

                const formData =
                    new FormData();

                formData.append(
                    "audio",
                    selectedAudio
                );


                const result =
                    await apiRequest(
                        "/audio/demo",
                        {
                            method: "POST",

                            body:
                                formData
                        }
                    );


                updateDriverMetrics(
                    result
                );


                updateDemoResults(
                    result
                );


            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Audio analysis failed."
                );

            } finally {

                analyzeBtn.disabled =
                    false;

                analyzeBtn.textContent =
                    "ANALYSE RADIO";

            }

        }
    );
}function updateDemoResults(
    result
) {

    const issue =
        document.getElementById(
            "issueCategory"
        );

    if (issue) {

        issue.textContent =
            result.issue ||
            "No issue detected";
    }


    const recommendation =
        document.getElementById(
            "recommendation"
        );

    if (recommendation) {

        recommendation.innerHTML =
            `<strong>ENGINEER ACTION</strong>
             <br>
             ${result.recommendation}`;
    }


    const quality =
        document.getElementById(
            "qualityValue"
        );

    if (quality) {

        quality.textContent =
            `${result.signal_quality}%`;
    }
}let stressHistory = [];

function addStressPoint(
    value
) {

    stressHistory.push({
        time: new Date(),
        value: value
    });


    if (
        stressHistory.length > 30
    ) {

        stressHistory.shift();

    }


    drawStressGraph();
}