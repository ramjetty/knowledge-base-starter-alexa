/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const qa = require('./modules/qa.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the knowledge base skill template. You can ask a question. Try saying: what is question one.';
    const promptText = "What is your question?"
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(promptText)
      .getResponse();
  },
};

const QuestionIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QuestionIntent';
  },
  async handle(handlerInput) {

    let resolution = handlerInput.requestEnvelope.request.intent.slots.question.resolutions.resolutionsPerAuthority[0];

    if (resolution.status.code === "ER_SUCCESS_MATCH") {
      let id = resolution.values[0].value.id;
      let speechText = 'Sorry I don\'t know that question';
      await qa.getQuestionById(id).then(function(data){
        let answer = data[0].answer;
        let prompt = data[0].prompt;
  
        speechText = `${answer} ${prompt}`;
  
      }, function(err){
        speechText = "There was a problem";
      });

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();

    } else {
      //TODO: capture new questions and send notification
      let speechText = 'Sorry I don\'t know. I\'ve sent your question to one of my human co-workers who can teach me the answer. Please ask me again tomorrow and hopefully I have an answer for you then.';

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask a question. If I know the answer I\'ll tell you. If I don\'t know the answer, I\'ll get it for you';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    QuestionIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
