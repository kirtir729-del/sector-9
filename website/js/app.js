/* ============================================================
   SILENT CO-DRIVER
   FRONTEND CONTROLLER
============================================================ */


/* ============================================================
   SECTION NAVIGATION
============================================================ */

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".page-section");

function showSection(sectionId) {

    sections.forEach(section => {

        section.classList.remove("active");

    });

    navItems.forEach(item => {

        item.classList.remove("active");

    });

    const target = document.getElementById(sectionId);

    if (target) {

        target.classList.add("active");

    }

    const activeButton =
        document.querySelector(
            `.nav-item[data-section="${sectionId}"]`
        );

    if (activeButton) {

        activeButton.classList.add("active");

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(button => {

    button.addEventListener("click", () => {

        showSection(
            button.dataset.section
        );

    });

});


document.querySelectorAll("[data-section-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showSection(
                button.dataset.sectionTarget
            );

        });

    });


/* ============================================================
   DRIVER DATA
============================================================ */

const drivers = {

    driver1: {

        name: "TEST DRIVER",

        number: "01",

        team: "SILENT RACING",

        stress: 72,

        fatigue: 54,

        voice: 68,

        cognitive: 61,

        risk: 81

    },

    driver44: {

        name: "TEST-44",

        number: "44",

        team: "SILENT RACING",

        stress: 64,

        fatigue: 48,

        voice: 52,

        cognitive: 55,

        risk: 67

    },

    driver16: {

        name: "TEST-16",

        number: "16",

        team: "SILENT RACING",

        stress: 41,

        fatigue: 32,

        voice: 38,

        cognitive: 42,

        risk: 38

    }

};


let currentDriver = drivers.driver1;


/* ============================================================
   UPDATE DRIVER
============================================================ */

function updateDriver(driver) {

    currentDriver = driver;

    document.getElementById("driverName").textContent =
        driver.name;

    document.getElementById("topDriver").textContent =
        driver.number;

    document.getElementById("overviewScore").textContent =
        driver.stress;

    document.getElementById("stressMetric").textContent =
        driver.stress;

    document.getElementById("fatigueMetric").textContent =
        driver.fatigue;

    document.getElementById("voiceMetric").textContent =
        driver.voice;

    document.getElementById("cognitiveMetric").textContent =
        driver.cognitive;

    document.getElementById("riskMetric").textContent =
        `${driver.risk}%`;

    document.getElementById("audioStress").textContent =
        driver.stress;

}


/* ============================================================
   AUDIO FILE
============================================================ */

const audioFile =
    document.getElementById("audioFile");

const selectedAudio =
    document.getElementById("selectedAudio");

const audioDropzone =
    document.getElementById("audioDropzone");


audioFile.addEventListener("change", () => {

    if (!audioFile.files.length) {

        selectedAudio.textContent =
            "No audio selected";

        return;

    }

    const file = audioFile.files[0];

    selectedAudio.textContent =
        `SELECTED: ${file.name} · ${(file.size / 1024).toFixed(1)} KB`;

});


/* ============================================================
   AUDIO ANALYSIS
============================================================ */

const analyzeAudioBtn =
    document.getElementById("analyzeAudioBtn");


analyzeAudioBtn.addEventListener("click", async () => {

    if (!audioFile.files.length) {

        selectedAudio.textContent =
            "Please select a driver radio clip first.";

        return;

    }


    analyzeAudioBtn.textContent =
        "ANALYSING...";

    analyzeAudioBtn.disabled = true;


    /*
       Demo mode.

       Later this section can call:

       POST /analyze

       with FormData audio.

       For now the UI remains usable even
       if the FastAPI server is not running.
    */

    await new Promise(resolve =>
        setTimeout(resolve, 1200)
    );


    const stress =
        Math.floor(
            55 + Math.random() * 30
        );


    const fatigue =
        Math.floor(
            35 + Math.random() * 30
        );


    const voice =
        Math.floor(
            45 + Math.random() * 30
        );


    const cognitive =
        Math.floor(
            40 + Math.random() * 30
        );


    const risk =
        Math.floor(
            50 + Math.random() * 40
        );


    document.getElementById("stressMetric")
        .textContent = stress;

    document.getElementById("overviewScore")
        .textContent = stress;

    document.getElementById("audioStress")
        .textContent = stress;

    document.getElementById("fatigueMetric")
        .textContent = fatigue;

    document.getElementById("voiceMetric")
        .textContent = voice;

    document.getElementById("cognitiveMetric")
        .textContent = cognitive;

    document.getElementById("riskMetric")
        .textContent = `${risk}%`;


    document.getElementById("transcript")
        .textContent =
        `"Radio analysis completed. Driver reports increased instability through the current sector."`;


    updateStressChart(stress);


    analyzeAudioBtn.textContent =
        "ANALYSIS COMPLETE";

    analyzeAudioBtn.disabled = false;

});


/* ============================================================
   BASELINE
============================================================ */

document.getElementById("baselineBtn")
    .addEventListener("click", () => {

        const button =
            document.getElementById("baselineBtn");

        button.textContent =
            "BASELINE SAVED ✓";

        button.style.borderColor =
            "#35e889";

        button.style.color =
            "#35e889";

    });


/* ============================================================
   STRESS DATA
============================================================ */

const laps = [
    "L1",
    "L2",
    "L3",
    "L4",
    "L5",
    "L6",
    "L7",
    "L8"
];


const stressData = [
    31,
    34,
    38,
    45,
    51,
    57,
    68,
    82
];


const paceData = [
    92,
    91,
    94,
    90,
    88,
    86,
    84,
    81
];


/* ============================================================
   CHART DEFAULTS
============================================================ */

Chart.defaults.color = "#777";

Chart.defaults.font.family =
    "JetBrains Mono";


/* ============================================================
   OVERVIEW CHART
============================================================ */

const stressCanvas =
    document.getElementById("stressChart");


let stressChart;


if (stressCanvas) {

    stressChart = new Chart(
        stressCanvas,
        {

            type: "line",

            data: {

                labels: laps,

                datasets: [

                    {

                        label: "Stress",

                        data: stressData,

                        borderColor: "#e10600",

                        backgroundColor:
                            "rgba(225,6,0,.08)",

                        borderWidth: 2,

                        pointRadius: 3,

                        pointBackgroundColor:
                            "#e10600",

                        tension: .35,

                        fill: true

                    },

                    {

                        label: "Pace",

                        data: paceData,

                        borderColor: "#dddddd",

                        borderWidth: 1,

                        pointRadius: 2,

                        tension: .35

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    x: {

                        grid: {

                            color:
                                "rgba(255,255,255,.04)"

                        }

                    },

                    y: {

                        grid: {

                            color:
                                "rgba(255,255,255,.04)"

                        },

                        beginAtZero: true,

                        max: 100

                    }

                }

            }

        }

    );

}


/* ============================================================
   ANALYSIS CHART
============================================================ */

const analysisCanvas =
    document.getElementById("analysisChart");


if (analysisCanvas) {

    new Chart(

        analysisCanvas,

        {

            type: "line",

            data: {

                labels: laps,

                datasets: [

                    {

                        label: "Stress Index",

                        data: stressData,

                        borderColor: "#e10600",

                        backgroundColor:
                            "rgba(225,6,0,.08)",

                        borderWidth: 3,

                        pointRadius: 4,

                        fill: true,

                        tension: .35

                    },

                    {

                        label: "Pace Index",

                        data: paceData,

                        borderColor: "#ffffff",

                        borderWidth: 2,

                        pointRadius: 3,

                        tension: .35

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    intersect: false,

                    mode: "index"

                },

                plugins: {

                    legend: {

                        labels: {

                            usePointStyle: true,

                            padding: 20

                        }

                    }

                },

                scales: {

                    x: {

                        grid: {

                            color:
                                "rgba(255,255,255,.05)"

                        }

                    },

                    y: {

                        min: 0,

                        max: 100,

                        grid: {

                            color:
                                "rgba(255,255,255,.05)"

                        }

                    }

                }

            }

        }

    );

}


/* ============================================================
   UPDATE STRESS GRAPH
============================================================ */

function updateStressChart(value) {

    if (!stressChart) return;

    stressData[stressData.length - 1] =
        value;

    stressChart.data.datasets[0].data =
        stressData;

    stressChart.update();

}


/* ============================================================
   API STATUS
============================================================ */

async function checkAPI() {

    const sidebarApi =
        document.getElementById("sidebarApi");

    try {

        const response =
            await fetch("http://127.0.0.1:8000/");

        if (response.ok) {

            sidebarApi.textContent =
                "ONLINE";

            sidebarApi.style.color =
                "#35e889";

        }

    } catch (error) {

        sidebarApi.textContent =
            "DEMO MODE";

        sidebarApi.style.color =
            "#ffb800";

    }

}


checkAPI();


/* ============================================================
   INITIAL STATE
============================================================ */

updateDriver(
    drivers.driver1
);

console.log(
    "Silent Co-Driver UI loaded successfully."
);