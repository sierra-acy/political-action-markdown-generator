// Add the storage key as an app-wide constant
const STORAGE_KEY = "markup-generator";
const callRepForm = document.getElementsByTagName("form")[0];

let topics = [];

// Listen to form submissions
callRepForm.addEventListener("submit", (event) => {
    // Prevent the form from submitting to the server
    // since everything is client-side.
    event.preventDefault();

    // if store new topic fails, don't move forward
    if(!storeNewTopic()) {
        return;
    }

    if(event.submitter.id === 'gen-markup') {
        console.log('GEN MARKUP PRESSED');
        generateMarkup();
    } else {
        console.log('ADD TOPIC PRESSED');
        addTopicForm('callRepsFieldset.html', topics.length-1);
    }
});

// Listen to form submissions
function enableFields(event) {
    console.log('EDIT PRESSED');
    console.log(event.target.name);

    // enable form
    let fieldset = document.getElementById(event.target.name);
    fieldset.removeAttribute("disabled");
    
    // hide edit button
    event.target.setAttribute("class", "hidden");

    // show save button
    let saveBtn = document.getElementsByName(event.target.name)[1];
    saveBtn.removeAttribute("class");

}

function saveFields(event) {
    console.log("SAVE CLICKED");
    const currId = event.target.name;
    let fieldsToStore = document.getElementById(currId);
    
    let dataObj = getFieldValues(fieldsToStore);

    if(!validateCheckboxes(dataObj)) {
        return;
    }

    // replace stored topic with new values
    topics[currId] = dataObj;

    console.log(topics);

    // disable form 
    fieldsToStore.setAttribute("disabled","");

    // hide save
    let saveBtn = document.getElementsByName(currId)[1];
    saveBtn.setAttribute("class", "hidden");

    // show edit button
    let editBtn = document.getElementsByName(currId)[0];
    editBtn.removeAttribute("class");
}



function storeNewTopic() {
    console.log('STORE NEW TOPIC CALLED');
    const currId = topics.length;
    let fieldsToStore = document.getElementById(currId);

    let fieldData = getFieldValues(fieldsToStore)
    // const moreInfoBullets = moreInfoElem.children;
    // const ctaBullets = ctaElem.children;

    if(!validateCheckboxes(fieldData)) {
        return;
    }
    
    // Get data from storage.
    // const topics = getAllStoredTopics();

    // Add the new topic object to the end of the array of topic objects.
    topics.push(fieldData);
    console.log(topics);

    // Store the updated array back in the storage.
    // window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));

    // disable form 
    fieldsToStore.setAttribute("disabled","");

    // enable edit button
    let editBtn = document.getElementsByName(currId)[0];
    editBtn.removeAttribute("class");

    console.log('NEW TOPIC STORED');
    return true;
}

function getFieldValues(fieldsToStore) {
    const subject = fieldsToStore.children[0].children[1].value;
    const recommendingOrg = fieldsToStore.children[1].children[1].value;
    const callRep = fieldsToStore.children[4].checked;
    const callSenators = fieldsToStore.children[6].checked;
    const cta = fieldsToStore.children[9].children[1].value;
    const moreInfo = fieldsToStore.children[10].children[1].value;
    const popup = fieldsToStore.children[3];

    return {subject, recommendingOrg, callRep, callSenators, cta, moreInfo, popup};
}

function validateCheckboxes(dataObj){ // validate checkboxes
    if(!dataObj["callRep"] && !dataObj["callSenators"]) {
        // display error message
        console.log('At least one checkbox required.');
        const popup = dataObj["popup"];
        popup.classList.toggle("show");
        return false;
    }
    return true;
}

function getAllStoredTopics() {
  // Get the string of topic data from localStorage
  const data = window.localStorage.getItem(STORAGE_KEY);

  // If no topics were stored, default to an empty array
  // otherwise, return the stored data as parsed JSON
  const topics = data ? JSON.parse(data) : [];

  return topics;
}

async function addTopicForm(url, elementId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // prep next id
    const nextId = topics.length;
    let html = await response.text();
    
    // insert name attribute to Edit and Save buttons
    let index = html.indexOf(">Edit<");
    html = html.substring(0,index) + " name='" + nextId + "'" + html.substring(index);
    
    index = html.indexOf(">Save<");
    html = html.substring(0,index) + " name='" + nextId + "'" + html.substring(index);

    // insert fieldset into document
    document.getElementById(elementId).insertAdjacentHTML('afterend', html);

    // get new fields and set id to next number
    const fieldsets = document.getElementsByTagName('fieldset');
    let newFieldset = fieldsets[fieldsets.length-1];
    newFieldset.id = nextId;
  } catch (error) {
    console.error('Failed to fetch HTML:', error);
  }
}

function generateMarkup() {
    // slack
    let text = "*Call Your Reps*\n";
    
    topics.forEach(function(topic) {
        console.log("TOPIC ", topic);
        text += "_*" + topic['subject'] + "*_\n";
        text += " _Recommending Organization:_ " + topic['recommendingOrg'] + "\n";
        let whoToCall = "";
        if(topic['callRep']) {
            whoToCall += "Representative";
        }
        if(topic['callSenators']) {
            if(whoToCall !== "") {
                whoToCall += ", ";
            }
            whoToCall += "Senators";
        }
        text += " _Who to Call:_ " + whoToCall + "\n";
        text += " _CTA:_ " + topic['cta'] + "\n";
        if(topic["moreInfo"] !== "") {
            text += " _More Info:_ " + topic['moreInfo'] + "\n";
        }
        text+= "\n";
    });

    const slackNode = document.createElement("p");
    slackNode.innerText = text;
    slackNode.setAttribute("id", "slack");

    let output = document.getElementById("markup");
    output.appendChild(slackNode);
}