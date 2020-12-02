
function init(event) {
    const btns = document.querySelectorAll(".btn-info");
    
    for (let i=0; i < btns.length; i++) {
      const btn = btns[i];
      btn.addEventListener("click", getNewTask);
    }
}

function getNewTask(e) {
    const week = (e.currentTarget).closest(".card");
    loadSpreadsheetData(week.getAttribute("id"));
}

function loadSpreadsheetData(week) {
    const sheetId = env("GOOGLE_SHEET_ID"); 
    const apiKey = env("GOOGLE_API_KEY");
    const url = `https://www.googleapis.com/drive/v3/files/${sheetId}/export?mimeType=text/csv&fields=*&key=${apiKey}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = CSVToArray(xhr.response, ",", true);
            parseData(response, week);
        }        
      };
    xhr.send();
}

function parseData(tasks, week) {
    let selectedTasks = [];
    tasks.map(function(task) {
        (task[1] === week) && selectedTasks.push(task);
    });
    const randomTask = getRandomTask(selectedTasks, week)
    showTask(randomTask, week);
}

function showTask(task, week) {
    const card = document.querySelector(`#${week}`);
    const can = card.querySelector(".can");
    can.innerHTML = `<div class="p-3">${task[2]}</div>`;
}

function CSVToArray(data, delimiter=",", omitFirstRow=false) {
    return data
        .slice(omitFirstRow ? data.indexOf("\n") + 1 : 0)
        .split("\n")
        .map(function(v) {
            return v.split(delimiter);
        });
};

function getRandomTask(tasks,week) {
    let savedTasks = JSON.parse(window.localStorage.getItem(`positivieblik-${week}`));
    let usedTasks = [];
    let randomNumber = Math.floor(Math.random() * tasks.length);
    let randomTask = tasks[randomNumber];

    if (savedTasks && savedTasks.length > 0 && savedTasks.length === tasks.length) {
        window.localStorage.clear();
        location.reload();
    }
    
    if (savedTasks && savedTasks.length > 0) {
        while (savedTasks.includes(randomTask[0])) {
            randomNumber = Math.floor(Math.random() * tasks.length);
            randomTask = tasks[randomNumber];
        }
        savedTasks.push(randomTask[0]);
        usedTasks = savedTasks;
    } else {
        usedTasks.push(randomTask[0]);
    }
    
    window.localStorage.setItem(`positivieblik-${week}`, JSON.stringify(usedTasks));
    
    return randomTask;
}

// Load function when DOM is loaded
window.addEventListener("DOMContentLoaded", init);