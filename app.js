// Add the storage key as an app-wide constant
const STORAGE_KEY = "markdown-generator";
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

    if(event.submitter.id === 'gen-markdown') {
        console.log('GEN MARKUP PRESSED');
        generateMarkdown();
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
    const popup = fieldsToStore.children[3];
    const callRep = fieldsToStore.children[4].checked;
    const callSenators = fieldsToStore.children[6].checked;
    const cta = fieldsToStore.children[9].children[1].value;
    const ctaBullets = fieldsToStore.children[10].children;
    const impact = fieldsToStore.children[11].children[1].value;
    const moreInfo = fieldsToStore.children[12].children[1].value;
    const moreInfoBullets = fieldsToStore.children[13].children;

    let ctaInfo = [];
    for(let bullet of ctaBullets) {
        ctaInfo.push(bullet.children[0].value);
    }

    let moreInfoItems = [];
    for(let bullet of moreInfoBullets) {
        moreInfoItems.push(bullet.children[0].value);
    }
    
    return {subject, recommendingOrg, callRep, callSenators, cta, ctaInfo, impact, moreInfo, moreInfoItems, popup};
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

function generateMarkdown() {
    let slackText = "*Call Your Reps*\n";
    let discordText = "# **Call Your Reps**\n";

    let gmailTitle = document.createElement("p");
    gmailTitle.innerHTML = "<b>Call Your Reps<b>";
    let gmailOut = document.getElementById("gmail");
    gmailOut.appendChild(gmailTitle);

    let curr = 1;
    topics.forEach(function(topic) {
        console.log("TOPIC ", topic);
        slackText += slackMarkdown(topic); 
        discordText += discordMarkdown(topic, curr, topics.length);
        gmailOut.appendChild(gmailMarkdown(topic));
        curr++;
    });

    const slackNode = document.createElement("code");
    slackNode.innerText = slackText;
    let slackOut = document.getElementById("slack");
    slackOut.appendChild(slackNode);

    const discordNode = document.createElement("code");
    discordNode.innerText = discordText;
    let discordOut = document.getElementById("discord");
    discordOut.appendChild(discordNode);
    
    let output = document.getElementById("markdown");
    output.removeAttribute("class");
}

function slackMarkdown(topic) {
    let text = "";
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
    let ctaInfo = topic['ctaInfo']
    if(ctaInfo.length > 0) {
        for(let bullet of ctaInfo) {
            text += "    - " + bullet + "\n";
        }
    }
    if(topic["impact"] !== "") {
        text += " _Impact:_ " + topic['impact'] + "\n";
    }
    if(topic["moreInfo"] !== "") {
        text += " _More Info:_ " + topic['moreInfo'] + "\n";
    }
    let moreInfoItems = topic['moreInfoItems']
    if(moreInfoItems.length > 0) {
        for(let bullet of moreInfoItems) {
            text += "    - " + bullet + "\n";
        }
    }
    text+= "\n";
    return text;
}

function discordMarkdown(topic, curr, total) {
    let text = "";
    text += "## (" + curr + "/" + total + ") **" + topic['subject'] + "**\n";
    text += " _**Recommending Organization:**_ " + topic['recommendingOrg'] + "\n";
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
    text += " _**Who to Call:**_ " + whoToCall + "\n";
    text += " _**CTA:**_ " + topic['cta'] + "\n";
    let ctaInfo = topic['ctaInfo']
    if(ctaInfo.length > 0) {
        for(let bullet of ctaInfo) {
            text += "- " + bullet + "\n";
        }
    }
    if(topic["impact"] !== "") {
        text += " _**Impact:**_ " + topic['impact'] + "\n";
    }
    if(topic["moreInfo"] !== "") {
        text += " _**More Info:**_ " + topic['moreInfo'] + "\n";
    }
    let moreInfoItems = topic['moreInfoItems']
    if(moreInfoItems.length > 0) {
        for(let bullet of moreInfoItems) {
            text += "- " + bullet + "\n";
        }
    }
    text+= "\n";
    return text;
}

function gmailMarkdown(topic) {
    let topLevel = document.createElement("p");
    topLevel.innerHTML = "<b><i>" + topic['subject'] + "</i></b>";

    let details = document.createElement("ul");

    let recOrg = document.createElement("li");
    recOrg.innerHTML = "<i>Recommending Organization:</i> " + topic["recommendingOrg"];
    details.appendChild(recOrg);

    let who = "";
    if(topic['callRep']) {
        who += "Representative";
    }
    if(topic['callSenators']) {
        if(who !== "") {
            who += ", ";
        }
        who += "Senators";
    }
    let whoToCall = document.createElement("li");
    whoToCall.innerHTML = "<i>Who To Call:</i> " + who;
    details.appendChild(whoToCall);

    let cta = document.createElement("li");
    cta.innerHTML = "<i>CTA:</i> " + topic["cta"];
    details.appendChild(cta);

    let ctaInfo = topic['ctaInfo']
    if(ctaInfo.length > 0) {
        let bullets = document.createElement("ul");
        for(let info of ctaInfo) {
            let bullet = document.createElement("li");
            bullet.innerHTML = info;
            bullets.appendChild(bullet);
        }
        cta.appendChild(bullets);
    }

    let impact = document.createElement("li");
    impact.innerHTML = "<i>Impact:</i> " + topic["impact"];
    details.appendChild(impact);

    let moreInfo = document.createElement("li");
    moreInfo.innerHTML = "<i>More Info:</i> " + topic["moreInfo"];
    details.appendChild(moreInfo);

    let moreInfoItems = topic['moreInfoItems']
    if(moreInfoItems.length > 0) {
        let bullets = document.createElement("ul");
        for(let info of moreInfoItems) {
            let bullet = document.createElement("li");
            bullet.innerHTML = info;
            bullets.appendChild(bullet);
        }
        moreInfo.appendChild(bullets);
    }

    topLevel.appendChild(details);
    return topLevel;
}

function addBullet(event) {
    console.log("ADD BULLET ", event.target);
    let fieldset = event.target.parentElement.parentElement;
    let bullets;
    if(event.target.id === "cta-btn") {
        bullets = fieldset.children[10];
    } else if (event.target.id === "more-info-btn") {
        bullets = fieldset.children[13];
    }
    // get ul with id cta-bullets
    // let ctaBullets = fieldset.children[10];
    let bullet = document.createElement("li");
    let newInput = document.createElement("input");
    newInput.type = "text";
    bullet.appendChild(newInput);
    bullets.removeAttribute("class");
    bullets.appendChild(bullet);
    
}