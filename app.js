// Add the storage key as an app-wide constant
const STORAGE_KEY = "markup-generator";

// create constants for the form and the form controls
const newCallRepForm = document.getElementsByTagName("form")[0];
const subjectElem = document.getElementById("subject");
const recommendingOrgElem = document.getElementById("rec");
const callRepElem = document.getElementById("call-reps");
const callSenatorElem = document.getElementById("call-senator");
const ctaElem = document.getElementById("cta");
const moreInfoElem = document.getElementById("more-info");

const moreInfoBullets = moreInfoElem.children;
const ctaBullets = ctaElem.children;


// Listen to form submissions
newCallRepForm.addEventListener("submit", (event) => {
    // Prevent the form from submitting to the server
    // since everything is client-side.
    event.preventDefault();

    console.log('SUBMIT PRESSED');
    console.log('EVENT: ');
    console.log(event.submitter.id);

    storeNewTopic();
    if(event.submitter.id === 'gen-markup') {
        console.log('GEN MARKUP PRESSED');
        // generateMarkup();
    }
});

function storeNewTopic() {
    console.log('STORE NEW TOPIC CALLED');
    // Get the start and end dates from the form.
    const subject = subjectElem.value;
    const recommendingOrg = recommendingOrgElem.value;
    const callReps = callRepElem.checked;
    const callSenator = callSenatorElem.checked;
    const cta = ctaElem.value;
    const moreInfo = moreInfoElem.value;
    
    // Get data from storage.
    const topics = getAllStoredTopics();

    // Add the new topic object to the end of the array of topic objects.
    topics.push({subject, recommendingOrg, callReps, callSenator, cta, moreInfo});
    console.log(topics);

    // Store the updated array back in the storage.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));

    // // TODO: Grey out that form
    // // TODO: Dispaly edit button

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