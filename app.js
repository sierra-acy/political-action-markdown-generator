// Add the storage key as an app-wide constant
const STORAGE_KEY = "markup-generator";
const callRepForm = document.getElementsByTagName("form")[0];

let topics = [];

// create constants for the form and the form controls
const fieldsets = document.getElementsByTagName("fieldset");
const editBtn = document.getElementById("edit-call-reps");

// Listen to form submissions
callRepForm.addEventListener("submit", (event) => {
    // Prevent the form from submitting to the server
    // since everything is client-side.
    event.preventDefault();

    console.log('SUBMIT PRESSED');
    console.log('EVENT: ');
    console.log(event);

    storeNewTopic();
    if(event.submitter.id === 'gen-markup') {
        console.log('GEN MARKUP PRESSED');
        // generateMarkup();
    } else {
        console.log('ADD TOPIC PRESSED');
        addTopicForm('callRepsFieldset.html', topics.length-1);
    }
});

// Listen to form submissions
function enableFields() {
    // console.log('EDIT PRESSED');
    // let fieldset = fieldsets[0];
    // // enable form
    // fieldset.removeAttribute("disabled");

    // // disable edit button
    // editBtn.setAttribute("disabled", "");
}

function storeNewTopic() {
    console.log('STORE NEW TOPIC CALLED');
    let fieldsToStore = document.getElementById(topics.length);

    const subject = fieldsToStore.children[0].children[1].value;
    const recommendingOrg = fieldsToStore.children[1].children[1].value;
    const callRep = fieldsToStore.children[4].checked;
    const callSenators = fieldsToStore.children[6].checked;
    const cta = fieldsToStore.children[9].children[1].value;
    const moreInfo = fieldsToStore.children[10].children[1].value;
    // const moreInfoBullets = moreInfoElem.children;
    // const ctaBullets = ctaElem.children;


    if(!callRep && !callSenators) {
        // display error message
        console.log('At least one checkbox required.');
        var popup = document.getElementById("call-reps-popup");
        popup.classList.toggle("show");
        return;
    }
    
    // Get data from storage.
    // const topics = getAllStoredTopics();

    // Add the new topic object to the end of the array of topic objects.
    topics.push({subject, recommendingOrg, callRep, callSenators, cta, moreInfo});
    console.log(topics);

    // Store the updated array back in the storage.
    // window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));

    // disable form 
    let fieldset = fieldsets[fieldsets.length-1];
    fieldset.setAttribute("disabled","");

    // enable edit button
    // editBtn.removeAttribute("disabled");

    console.log('NEW TOPIC STORED');
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
    const html = await response.text();
    // insert new fields
    document.getElementById(elementId).insertAdjacentHTML('afterend', html);

    // get new fields and set id to next number
    const fieldsets = document.getElementsByTagName('fieldset');
    let newFieldset = fieldsets[fieldsets.length-1];
    newFieldset.id = topics.length;
  } catch (error) {
    console.error('Failed to fetch HTML:', error);
  }
}